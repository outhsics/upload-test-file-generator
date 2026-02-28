use serde::{Deserialize, Serialize};
use std::env;
use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

const PAD_CHUNK_SIZE: usize = 1024 * 1024;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GenerateResponse {
    logs: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImageRequest {
    output_dir: String,
    prefix: String,
    format: String,
    width: u32,
    height: u32,
    count: u32,
    quality: u8,
    target_mb: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AudioRequest {
    output_dir: String,
    prefix: String,
    format: String,
    duration: f64,
    sample_rate: u32,
    channels: u8,
    frequency: f64,
    bitrate: u32,
    count: u32,
    target_mb: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VideoRequest {
    output_dir: String,
    prefix: String,
    format: String,
    width: u32,
    height: u32,
    duration: f64,
    fps: u32,
    video_bitrate: u32,
    audio_bitrate: u32,
    with_audio: bool,
    count: u32,
    target_mb: f64,
}

fn now_stamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn sanitize_prefix(prefix: &str) -> String {
    let trimmed = prefix.trim();
    if trimmed.is_empty() {
        return "test_file".to_string();
    }
    trimmed
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect()
}

fn build_output_filename(prefix: &str, ext: &str, index: u32) -> String {
    format!("{}_{}_{:03}.{}", sanitize_prefix(prefix), now_stamp(), index, ext)
}

fn run_ffmpeg(ffmpeg_bin: &Path, args: &[String]) -> Result<(), String> {
    let output = Command::new(ffmpeg_bin)
        .args(args)
        .output()
        .map_err(|err| format!("Failed to execute ffmpeg: {err}"))?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let details = if !stderr.is_empty() {
        stderr
    } else if !stdout.is_empty() {
        stdout
    } else {
        "ffmpeg failed without output".to_string()
    };
    Err(details)
}

fn check_range(value: u32, min: u32, max: u32, field: &str) -> Result<(), String> {
    if value < min || value > max {
        return Err(format!("{field} must be in [{min}, {max}]"));
    }
    Ok(())
}

fn ensure_non_negative(value: f64, field: &str) -> Result<(), String> {
    if value < 0.0 {
        return Err(format!("{field} must be >= 0"));
    }
    Ok(())
}

fn ensure_positive(value: f64, field: &str) -> Result<(), String> {
    if value <= 0.0 {
        return Err(format!("{field} must be > 0"));
    }
    Ok(())
}

fn resolve_output_dir(dir: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(dir);
    fs::create_dir_all(&path).map_err(|err| format!("Create output dir failed: {err}"))?;
    Ok(path)
}

fn pad_to_target_size(path: &Path, target_mb: f64) -> Result<String, String> {
    if target_mb <= 0.0 {
        return Ok("skip".to_string());
    }

    let target_bytes = (target_mb * 1024.0 * 1024.0).round() as u64;
    let current = fs::metadata(path)
        .map_err(|err| format!("Read metadata failed: {err}"))?
        .len();
    if current >= target_bytes {
        return Ok(format!("skip ({current} bytes >= target)"));
    }

    let mut remaining = target_bytes - current;
    let chunk = vec![0_u8; PAD_CHUNK_SIZE];
    let mut file = OpenOptions::new()
        .append(true)
        .open(path)
        .map_err(|err| format!("Open file for padding failed: {err}"))?;

    while remaining > 0 {
        let write_size = std::cmp::min(remaining as usize, PAD_CHUNK_SIZE);
        file.write_all(&chunk[..write_size])
            .map_err(|err| format!("Write padding failed: {err}"))?;
        remaining -= write_size as u64;
    }
    Ok("padded".to_string())
}

fn ffmpeg_candidates() -> Vec<PathBuf> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Some(from_env) = env::var_os("FFMPEG_PATH") {
        candidates.push(PathBuf::from(from_env));
    }

    if let Some(path_os) = env::var_os("PATH") {
        for dir in env::split_paths(&path_os) {
            candidates.push(dir.join("ffmpeg"));
        }
    }

    for fixed in [
        "/opt/homebrew/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
        "/opt/local/bin/ffmpeg",
        "/usr/bin/ffmpeg",
    ] {
        candidates.push(PathBuf::from(fixed));
    }

    candidates
}

fn resolve_ffmpeg_binary() -> Option<PathBuf> {
    ffmpeg_candidates().into_iter().find(|candidate| {
        candidate.is_file()
            && Command::new(candidate)
                .arg("-version")
                .output()
                .map(|output| output.status.success())
                .unwrap_or(false)
    })
}

fn ffmpeg_available_internal() -> bool {
    resolve_ffmpeg_binary().is_some()
}

fn require_ffmpeg() -> Result<PathBuf, String> {
    if let Some(bin) = resolve_ffmpeg_binary() {
        return Ok(bin);
    }
    let searched: Vec<OsString> = ffmpeg_candidates()
        .into_iter()
        .map(|path| path.into_os_string())
        .collect();
    Err(format!(
        "未找到 ffmpeg，请先执行 `brew install ffmpeg`。已搜索路径：{}",
        searched
            .iter()
            .map(|x| x.to_string_lossy())
            .collect::<Vec<_>>()
            .join(", ")
    ))
}

#[tauri::command]
fn default_output_dir() -> String {
    let fallback = env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("generated_test_files");
    env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join("Downloads").join("upload-test-files"))
        .unwrap_or(fallback)
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn check_ffmpeg() -> bool {
    ffmpeg_available_internal()
}

#[tauri::command]
fn open_output_dir(dir: String) -> Result<GenerateResponse, String> {
    let output = resolve_output_dir(&dir)?;
    let status = Command::new("open")
        .arg(&output)
        .status()
        .map_err(|err| format!("Failed to open output dir: {err}"))?;
    if !status.success() {
        return Err("Open output dir failed".to_string());
    }
    Ok(GenerateResponse {
        logs: vec![format!("Opened output directory: {}", output.to_string_lossy())],
    })
}

#[tauri::command]
fn generate_images(req: ImageRequest) -> Result<GenerateResponse, String> {
    let ffmpeg_bin = require_ffmpeg()?;
    check_range(req.width, 1, 16000, "width")?;
    check_range(req.height, 1, 16000, "height")?;
    check_range(req.count, 1, 1000, "count")?;
    check_range(req.quality as u32, 2, 31, "quality")?;
    ensure_non_negative(req.target_mb, "targetMb")?;

    let format = req.format.to_lowercase();
    match format.as_str() {
        "png" | "jpg" | "webp" | "bmp" => {}
        _ => return Err("Unsupported image format".to_string()),
    }

    let output = resolve_output_dir(&req.output_dir)?;
    let mut logs = vec![format!(
        "[Image] generating {} file(s) in {}",
        req.count,
        output.to_string_lossy()
    )];

    for i in 1..=req.count {
        let name = build_output_filename(&req.prefix, &format, i);
        let full = output.join(name);

        let mut args = vec![
            "-y".to_string(),
            "-f".to_string(),
            "lavfi".to_string(),
            "-i".to_string(),
            format!("testsrc2=size={}x{}:rate=1", req.width, req.height),
            "-frames:v".to_string(),
            "1".to_string(),
        ];
        if matches!(format.as_str(), "jpg" | "webp") {
            args.push("-q:v".to_string());
            args.push(req.quality.to_string());
        }
        args.push(full.to_string_lossy().to_string());

        run_ffmpeg(&ffmpeg_bin, &args)?;
        let pad = pad_to_target_size(&full, req.target_mb)?;
        let size = fs::metadata(&full)
            .map_err(|err| format!("Read generated file failed: {err}"))?
            .len();
        logs.push(format!(
            "[Image] created: {} ({} bytes, {})",
            full.file_name().unwrap_or_default().to_string_lossy(),
            size,
            pad
        ));
    }

    logs.push("[Image] done.".to_string());
    Ok(GenerateResponse { logs })
}

#[tauri::command]
fn generate_audio(req: AudioRequest) -> Result<GenerateResponse, String> {
    let ffmpeg_bin = require_ffmpeg()?;
    ensure_positive(req.duration, "duration")?;
    check_range(req.sample_rate, 8000, 192000, "sampleRate")?;
    check_range(req.channels as u32, 1, 2, "channels")?;
    ensure_positive(req.frequency, "frequency")?;
    check_range(req.bitrate, 16, 1024, "bitrate")?;
    check_range(req.count, 1, 1000, "count")?;
    ensure_non_negative(req.target_mb, "targetMb")?;

    let format = req.format.to_lowercase();
    match format.as_str() {
        "wav" | "mp3" | "m4a" | "flac" => {}
        _ => return Err("Unsupported audio format".to_string()),
    }

    let output = resolve_output_dir(&req.output_dir)?;
    let mut logs = vec![format!(
        "[Audio] generating {} file(s) in {}",
        req.count,
        output.to_string_lossy()
    )];

    for i in 1..=req.count {
        let name = build_output_filename(&req.prefix, &format, i);
        let full = output.join(name);
        let mut args = vec![
            "-y".to_string(),
            "-f".to_string(),
            "lavfi".to_string(),
            "-i".to_string(),
            format!(
                "sine=frequency={}:sample_rate={}:duration={}",
                req.frequency, req.sample_rate, req.duration
            ),
            "-ac".to_string(),
            req.channels.to_string(),
        ];

        match format.as_str() {
            "wav" => args.extend(["-c:a", "pcm_s16le"].iter().map(ToString::to_string)),
            "mp3" => args.extend(
                ["-c:a", "libmp3lame", "-b:a", &format!("{}k", req.bitrate)]
                    .iter()
                    .map(ToString::to_string),
            ),
            "m4a" => args.extend(
                ["-c:a", "aac", "-b:a", &format!("{}k", req.bitrate)]
                    .iter()
                    .map(ToString::to_string),
            ),
            "flac" => args.extend(["-c:a", "flac"].iter().map(ToString::to_string)),
            _ => return Err("Unsupported audio format".to_string()),
        }

        args.push(full.to_string_lossy().to_string());
        run_ffmpeg(&ffmpeg_bin, &args)?;
        let pad = pad_to_target_size(&full, req.target_mb)?;
        let size = fs::metadata(&full)
            .map_err(|err| format!("Read generated file failed: {err}"))?
            .len();
        logs.push(format!(
            "[Audio] created: {} ({} bytes, {})",
            full.file_name().unwrap_or_default().to_string_lossy(),
            size,
            pad
        ));
    }

    logs.push("[Audio] done.".to_string());
    Ok(GenerateResponse { logs })
}

#[tauri::command]
fn generate_video(req: VideoRequest) -> Result<GenerateResponse, String> {
    let ffmpeg_bin = require_ffmpeg()?;
    check_range(req.width, 16, 16000, "width")?;
    check_range(req.height, 16, 16000, "height")?;
    ensure_positive(req.duration, "duration")?;
    check_range(req.fps, 1, 120, "fps")?;
    check_range(req.video_bitrate, 100, 100_000, "videoBitrate")?;
    check_range(req.audio_bitrate, 16, 1024, "audioBitrate")?;
    check_range(req.count, 1, 1000, "count")?;
    ensure_non_negative(req.target_mb, "targetMb")?;

    let format = req.format.to_lowercase();
    match format.as_str() {
        "mp4" | "mov" | "webm" | "mkv" => {}
        _ => return Err("Unsupported video format".to_string()),
    }

    let output = resolve_output_dir(&req.output_dir)?;
    let mut logs = vec![format!(
        "[Video] generating {} file(s) in {}",
        req.count,
        output.to_string_lossy()
    )];

    for i in 1..=req.count {
        let name = build_output_filename(&req.prefix, &format, i);
        let full = output.join(name);

        let mut args = vec![
            "-y".to_string(),
            "-f".to_string(),
            "lavfi".to_string(),
            "-i".to_string(),
            format!("testsrc2=size={}x{}:rate={}", req.width, req.height, req.fps),
            "-t".to_string(),
            req.duration.to_string(),
        ];

        if req.with_audio {
            args.extend(
                [
                    "-f",
                    "lavfi",
                    "-i",
                    &format!("sine=frequency=440:sample_rate=48000:duration={}", req.duration),
                ]
                .iter()
                .map(ToString::to_string),
            );
        }

        match format.as_str() {
            "mp4" | "mov" | "mkv" => {
                args.extend(
                    [
                        "-c:v",
                        "libx264",
                        "-pix_fmt",
                        "yuv420p",
                        "-b:v",
                        &format!("{}k", req.video_bitrate),
                    ]
                    .iter()
                    .map(ToString::to_string),
                );
                if req.with_audio {
                    args.extend(
                        ["-c:a", "aac", "-b:a", &format!("{}k", req.audio_bitrate)]
                            .iter()
                            .map(ToString::to_string),
                    );
                    args.push("-shortest".to_string());
                } else {
                    args.push("-an".to_string());
                }
            }
            "webm" => {
                args.extend(
                    ["-c:v", "libvpx-vp9", "-b:v", &format!("{}k", req.video_bitrate)]
                        .iter()
                        .map(ToString::to_string),
                );
                if req.with_audio {
                    args.extend(
                        ["-c:a", "libopus", "-b:a", &format!("{}k", req.audio_bitrate)]
                            .iter()
                            .map(ToString::to_string),
                    );
                    args.push("-shortest".to_string());
                } else {
                    args.push("-an".to_string());
                }
            }
            _ => return Err("Unsupported video format".to_string()),
        }

        args.push(full.to_string_lossy().to_string());

        run_ffmpeg(&ffmpeg_bin, &args)?;
        let pad = pad_to_target_size(&full, req.target_mb)?;
        let size = fs::metadata(&full)
            .map_err(|err| format!("Read generated file failed: {err}"))?
            .len();
        logs.push(format!(
            "[Video] created: {} ({} bytes, {})",
            full.file_name().unwrap_or_default().to_string_lossy(),
            size,
            pad
        ));
    }

    logs.push("[Video] done.".to_string());
    Ok(GenerateResponse { logs })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            default_output_dir,
            check_ffmpeg,
            open_output_dir,
            generate_images,
            generate_audio,
            generate_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
