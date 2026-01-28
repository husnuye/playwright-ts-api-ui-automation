/* scripts/convert-videos.cjs
   Converts Playwright .webm videos under test-results/ into .mp4
   Output: ../reports/demo-videos/
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeName(name) {
  return name.replace(/[^\w.-]+/g, "_");
}

function ffmpegExists() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function convertWebmToMp4(inputWebm, outputMp4) {
  // -movflags +faststart: mp4 web’de hızlı açılır
  // -pix_fmt yuv420p: macOS/preview uyumu daha iyi
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      inputWebm,
      "-c:v",
      "libx264",
      "-crf",
      "23",
      "-preset",
      "veryfast",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputMp4,
    ],
    { stdio: "inherit" }
  );
}

function main() {
  const root = process.cwd(); // WebTests/
  const testResultsDir = path.join(root, "test-results");
  const outDir = path.resolve(root, "..", "reports", "demo-videos");

  ensureDir(outDir);

  if (!ffmpegExists()) {
    console.log("ffmpeg not found. Install it (macOS): brew install ffmpeg");
    process.exit(0);
  }

  const files = walk(testResultsDir);
  const webms = files.filter((f) => f.endsWith(path.join("video.webm")) || f.endsWith("video.webm"));

  if (webms.length === 0) {
    console.log("No video.webm found under test-results/. Nothing to convert.");
    return;
  }

  // stable, readable output names
  // Example input folder:
  // test-results/saucedemo.standard-...--chromium/video.webm
  for (const webm of webms) {
    const parent = path.basename(path.dirname(webm)); // folder name
    let outName = parent;

    // Optional nicer naming for your current suite:
    if (parent.startsWith("saucedemo.standard")) outName = "standard";
    if (parent.startsWith("saucedemo.visual")) outName = "visual";

    const mp4 = path.join(outDir, `${safeName(outName)}.mp4`);

    console.log(`\nConverting:\n  ${webm}\n-> ${mp4}\n`);
    convertWebmToMp4(webm, mp4);
  }

  console.log(`\n✅ MP4 videos saved under: ${outDir}\n`);
}

main();