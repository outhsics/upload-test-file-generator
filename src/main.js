const tauri = window.__TAURI__;
const invoke = tauri?.core?.invoke;

const $ = (id) => document.getElementById(id);
const tabs = Array.from(document.querySelectorAll(".tab"));
const logEl = $("log");

let busy = false;

function setBusy(isBusy) {
  busy = isBusy;
  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = isBusy;
  });
}

function appendLog(message) {
  const time = new Date().toLocaleTimeString();
  logEl.value += `[${time}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function assertTauriReady() {
  if (!invoke) {
    appendLog("错误：请在 Tauri App 内运行，不要直接在浏览器打开。");
    throw new Error("Tauri API unavailable");
  }
}

async function callCommand(command, payload = {}) {
  assertTauriReady();
  setBusy(true);
  try {
    const response = await invoke(command, payload);
    for (const line of response.logs || []) {
      appendLog(line);
    }
  } catch (error) {
    appendLog(`ERROR: ${String(error)}`);
    throw error;
  } finally {
    setBusy(false);
  }
}

function readNumber(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) ? value : 0;
}

function outputDir() {
  return $("output_dir").value.trim();
}

function imagePayload() {
  return {
    req: {
      outputDir: outputDir(),
      prefix: $("img_prefix").value.trim() || "image_test",
      format: $("img_format").value,
      width: readNumber("img_width"),
      height: readNumber("img_height"),
      count: readNumber("img_count"),
      quality: readNumber("img_quality"),
      targetMb: readNumber("img_target_mb"),
    },
  };
}

function audioPayload() {
  return {
    req: {
      outputDir: outputDir(),
      prefix: $("aud_prefix").value.trim() || "audio_test",
      format: $("aud_format").value,
      duration: readNumber("aud_duration"),
      sampleRate: readNumber("aud_sample_rate"),
      channels: readNumber("aud_channels"),
      frequency: readNumber("aud_freq"),
      bitrate: readNumber("aud_bitrate"),
      count: readNumber("aud_count"),
      targetMb: readNumber("aud_target_mb"),
    },
  };
}

function videoPayload() {
  return {
    req: {
      outputDir: outputDir(),
      prefix: $("vid_prefix").value.trim() || "video_test",
      format: $("vid_format").value,
      width: readNumber("vid_width"),
      height: readNumber("vid_height"),
      duration: readNumber("vid_duration"),
      fps: readNumber("vid_fps"),
      videoBitrate: readNumber("vid_bitrate"),
      audioBitrate: readNumber("vid_audio_bitrate"),
      withAudio: $("vid_with_audio").checked,
      count: readNumber("vid_count"),
      targetMb: readNumber("vid_target_mb"),
    },
  };
}

function setupTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((it) => it.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".tab-content").forEach((section) => {
        section.classList.remove("active");
      });
      const target = tab.dataset.target;
      if (target) {
        $(target).classList.add("active");
      }
    });
  });
}

function bindEvents() {
  $("open_output").addEventListener("click", async () => {
    if (busy) return;
    await callCommand("open_output_dir", { dir: outputDir() });
  });

  $("gen_image").addEventListener("click", async () => {
    if (busy) return;
    await callCommand("generate_images", imagePayload());
  });

  $("gen_audio").addEventListener("click", async () => {
    if (busy) return;
    await callCommand("generate_audio", audioPayload());
  });

  $("gen_video").addEventListener("click", async () => {
    if (busy) return;
    await callCommand("generate_video", videoPayload());
  });

  $("preset_img_10mb").addEventListener("click", async () => {
    $("img_prefix").value = "image_10mb";
    $("img_format").value = "jpg";
    $("img_width").value = "2048";
    $("img_height").value = "2048";
    $("img_count").value = "1";
    $("img_quality").value = "2";
    $("img_target_mb").value = "10";
    await callCommand("generate_images", imagePayload());
  });

  $("preset_video_100mb").addEventListener("click", async () => {
    $("vid_prefix").value = "video_100mb";
    $("vid_format").value = "mp4";
    $("vid_width").value = "1920";
    $("vid_height").value = "1080";
    $("vid_duration").value = "30";
    $("vid_fps").value = "30";
    $("vid_bitrate").value = "8000";
    $("vid_audio_bitrate").value = "128";
    $("vid_with_audio").checked = true;
    $("vid_count").value = "1";
    $("vid_target_mb").value = "100";
    await callCommand("generate_video", videoPayload());
  });

  $("preset_audio_500mb").addEventListener("click", async () => {
    $("aud_prefix").value = "audio_500mb";
    $("aud_format").value = "wav";
    $("aud_duration").value = "300";
    $("aud_sample_rate").value = "48000";
    $("aud_channels").value = "2";
    $("aud_freq").value = "440";
    $("aud_bitrate").value = "192";
    $("aud_count").value = "1";
    $("aud_target_mb").value = "500";
    await callCommand("generate_audio", audioPayload());
  });
}

async function bootstrap() {
  setupTabs();
  bindEvents();

  if (!invoke) {
    appendLog("错误：Tauri API 不可用，请使用 `pnpm run dev` 启动。");
    return;
  }

  try {
    const defaultDir = await invoke("default_output_dir");
    $("output_dir").value = defaultDir;
    const ffmpeg = await invoke("check_ffmpeg");
    $("ffmpeg_status").textContent = ffmpeg
      ? "ffmpeg：已检测到"
      : "ffmpeg：未检测到，请先执行 `brew install ffmpeg`";
    appendLog("应用已就绪。");
  } catch (error) {
    appendLog(`启动失败：${String(error)}`);
  }
}

bootstrap();
