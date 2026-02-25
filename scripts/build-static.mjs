import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const staticPublicDir = path.join(root, "tmp", "static-public");
const staticTelegramMediaDir = path.join(staticPublicDir, "telegram", "media");

const copyPublicDir = () => {
  fs.rmSync(staticPublicDir, { recursive: true, force: true });
  fs.mkdirSync(staticPublicDir, { recursive: true });
  fs.cpSync(path.join(root, "public"), staticPublicDir, { recursive: true });
};

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
};

const optimizeTelegramMedia = async () => {
  if (!fs.existsSync(staticTelegramMediaDir)) {
    console.log("[static] No telegram media to optimize");
    return;
  }

  let sharpModule;
  try {
    sharpModule = await import("sharp");
  } catch {
    console.warn(
      "[static] Skipping telegram optimization: sharp not available"
    );
    return;
  }

  const sharp = sharpModule.default ?? sharpModule;
  const maxWidth = 2000;
  const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  let optimized = 0;
  let skipped = 0;
  let bytesSaved = 0;

  const files = walkFiles(staticTelegramMediaDir);
  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.has(extension)) {
      skipped += 1;
      continue;
    }
    try {
      const input = fs.readFileSync(filePath);
      const image = sharp(input);
      const metadata = await image.metadata();
      let pipeline = image;
      if (metadata.width && metadata.width > maxWidth) {
        pipeline = pipeline.resize({
          width: maxWidth,
          withoutEnlargement: true,
        });
      }
      if (extension === ".jpg" || extension === ".jpeg") {
        pipeline = pipeline.jpeg({ quality: 78, mozjpeg: true });
      } else if (extension === ".png") {
        pipeline = pipeline.png({ compressionLevel: 9, palette: true });
      } else if (extension === ".webp") {
        pipeline = pipeline.webp({ quality: 78 });
      }
      const output = await pipeline.toBuffer();
      if (output.length < input.length) {
        fs.writeFileSync(filePath, output);
        optimized += 1;
        bytesSaved += input.length - output.length;
      } else {
        skipped += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  const savedMb = (bytesSaved / (1024 * 1024)).toFixed(2);
  console.log(
    `[static] Optimized telegram media: ${optimized} files, saved ${savedMb} MB (${skipped} skipped)`
  );
};

const main = async () => {
  copyPublicDir();
  await optimizeTelegramMedia();

  const env = {
    ...process.env,
    STATIC_PUBLIC_DIR: staticPublicDir,
  };

  const run = (command, args) =>
    spawnSync(command, args, { stdio: "inherit", shell: true, env });

  const tsc = run("tsc", ["-b"]);
  if (tsc.status !== 0) {
    process.exit(tsc.status ?? 1);
  }

  const vite = run("vite", ["build", "--mode", "static"]);
  fs.rmSync(staticPublicDir, { recursive: true, force: true });
  process.exit(vite.status ?? 1);
};

main();
