export function isImage(path: string, mime?: string) {
  if (mime?.startsWith("image/")) {
    return true;
  }
  if (path.startsWith("data:image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

export function isVideo(path: string, mime?: string) {
  if (mime?.startsWith("video/")) {
    return true;
  }
  if (path.startsWith("data:video/")) {
    return true;
  }
  return /\.(mp4|webm|mov)$/i.test(path);
}

export function buildMediaSource(path: string) {
  if (path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }
  if (path.startsWith("/")) {
    return path;
  }
  return `/${path}`;
}
