const tauri = window.__TAURI__;
const invoke = tauri?.core?.invoke;

const INSTALL_COMMAND = "brew install ffmpeg";
const GATEKEEPER_FIX_COMMAND = 'xattr -dr com.apple.quarantine "/Applications/上传测试文件生成器.app"';
const GATEKEEPER_STORAGE_KEY = "gatekeeper_guide_seen_v1";

const $ = (id) => document.getElementById(id);
const tabs = Array.from(document.querySelectorAll(".tab"));
const logEl = $("log");
const gatedButtonIds = [
  "gen_image",
  "gen_audio",
  "gen_video",
  "preset_img_10mb",
  "preset_video_100mb",
  "preset_audio_500mb",
];

let busy = false;
let ffmpegReady = false;

function updateButtonStates() {
  const buttons = Array.from(document.querySelectorAll("button"));
  buttons.forEach((btn) => {
    btn.disabled = false;
  });

  if (busy) {
    buttons.forEach((btn) => {
      btn.disabled = true;
    });
    return;
  }

  if (!ffmpegReady) {
    gatedButtonIds.forEach((id) => {
      const btn = $(id);
      if (btn) btn.disabled = true;
    });
  }
}

function setBusy(isBusy) {
  busy = isBusy;
  updateButtonStates();
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
    return response;
  } catch (error) {
    appendLog(`错误：${String(error)}`);
    throw error;
  } finally {
    setBusy(false);
  }
}

function setFfmpegState(ready) {
  ffmpegReady = ready;
  const statusEl = $("ffmpeg_status");
  const guideEl = $("ffmpeg_guide");
  const overlayEl = $("setup_overlay");

  statusEl.classList.remove("ok", "warn");
  if (ready) {
    statusEl.textContent = "ffmpeg：已检测到，可以开始使用。";
    statusEl.classList.add("ok");
    guideEl.classList.add("hidden");
    overlayEl.classList.add("hidden");
  } else {
    statusEl.textContent = "ffmpeg：未检测到，请先安装。";
    statusEl.classList.add("warn");
    guideEl.classList.remove("hidden");
    overlayEl.classList.remove("hidden");
  }
  updateButtonStates();
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

function fallbackCopyText(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function isMacOS() {
  const agent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return agent.includes("Mac") || platform.includes("Mac");
}

async function copyInstallCommand() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } else {
      fallbackCopyText(INSTALL_COMMAND);
    }
    appendLog("已复制安装命令：brew install ffmpeg");
  } catch (error) {
    appendLog(`复制失败：${String(error)}`);
  }
}

async function copyGatekeeperCommand() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(GATEKEEPER_FIX_COMMAND);
    } else {
      fallbackCopyText(GATEKEEPER_FIX_COMMAND);
    }
    appendLog("已复制修复命令：xattr -dr com.apple.quarantine ...");
  } catch (error) {
    appendLog(`复制失败：${String(error)}`);
  }
}

async function refreshFfmpegStatus(logSuccess = false) {
  assertTauriReady();
  try {
    const detected = await invoke("check_ffmpeg");
    const previouslyMissing = !ffmpegReady;
    setFfmpegState(Boolean(detected));
    if (detected && (logSuccess || previouslyMissing)) {
      appendLog("检测成功：ffmpeg 已可用。");
    }
    if (!detected) {
      appendLog("请先在终端安装：brew install ffmpeg");
    }
  } catch (error) {
    appendLog(`依赖检测失败：${String(error)}`);
  }
}

function ensureFfmpegReady() {
  if (ffmpegReady) return true;
  appendLog("当前无法生成：请先安装 ffmpeg，并点击“重新检测”。");
  setFfmpegState(false);
  return false;
}

async function openInstallGuide() {
  if (busy) return;
  await callCommand("open_install_guide");
}

function closeGatekeeperModal() {
  $("gatekeeper_overlay").classList.add("hidden");
  try {
    localStorage.setItem(GATEKEEPER_STORAGE_KEY, "1");
  } catch (_error) {
    // Ignore storage failures in restricted environments.
  }
}

function initGatekeeperGuide() {
  const show = isMacOS();
  const panel = $("gatekeeper_guide");
  const modal = $("gatekeeper_overlay");

  $("gatekeeper_cmd_inline").textContent = GATEKEEPER_FIX_COMMAND;
  $("gatekeeper_cmd_modal").textContent = GATEKEEPER_FIX_COMMAND;
  $("copy_gatekeeper_cmd").addEventListener("click", copyGatekeeperCommand);
  $("copy_gatekeeper_cmd_modal").addEventListener("click", copyGatekeeperCommand);
  $("open_security_guide").addEventListener("click", openInstallGuide);
  $("open_security_guide_modal").addEventListener("click", openInstallGuide);
  $("close_gatekeeper_modal").addEventListener("click", closeGatekeeperModal);

  if (!show) {
    panel.classList.add("hidden");
    modal.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");

  let seen = false;
  try {
    seen = localStorage.getItem(GATEKEEPER_STORAGE_KEY) === "1";
  } catch (_error) {
    seen = false;
  }
  if (!seen) {
    modal.classList.remove("hidden");
  }
}

function bindEvents() {
  $("open_output").addEventListener("click", async () => {
    if (busy) return;
    await callCommand("open_output_dir", { dir: outputDir() });
  });

  $("copy_install_cmd").addEventListener("click", copyInstallCommand);
  $("copy_install_cmd_modal").addEventListener("click", copyInstallCommand);

  $("open_install_guide").addEventListener("click", openInstallGuide);
  $("open_install_guide_modal").addEventListener("click", openInstallGuide);

  $("recheck_ffmpeg").addEventListener("click", () => refreshFfmpegStatus(true));
  $("recheck_ffmpeg_modal").addEventListener("click", () => refreshFfmpegStatus(true));

  $("gen_image").addEventListener("click", async () => {
    if (busy || !ensureFfmpegReady()) return;
    await callCommand("generate_images", imagePayload());
  });

  $("gen_audio").addEventListener("click", async () => {
    if (busy || !ensureFfmpegReady()) return;
    await callCommand("generate_audio", audioPayload());
  });

  $("gen_video").addEventListener("click", async () => {
    if (busy || !ensureFfmpegReady()) return;
    await callCommand("generate_video", videoPayload());
  });

  $("preset_img_10mb").addEventListener("click", async () => {
    if (busy || !ensureFfmpegReady()) return;
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
    if (busy || !ensureFfmpegReady()) return;
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
    if (busy || !ensureFfmpegReady()) return;
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
  initGatekeeperGuide();
  $("install_cmd_inline").textContent = INSTALL_COMMAND;
  $("install_cmd_modal").textContent = INSTALL_COMMAND;
  updateButtonStates();

  if (!invoke) {
    appendLog("错误：Tauri API 不可用，请使用 `pnpm run dev` 启动。");
    return;
  }

  try {
    const defaultDir = await invoke("default_output_dir");
    $("output_dir").value = defaultDir;
    await refreshFfmpegStatus(false);
    appendLog("应用已就绪。");
  } catch (error) {
    appendLog(`启动失败：${String(error)}`);
  }
}

bootstrap();
