/**
 * Returns `true` if the given path or MIME type represents an image file.
 * Checks MIME prefix, data URI prefix, or common image file extensions.
 */
export function isImage(path: string, mime?: string) {
  if (mime?.startsWith("image/")) {
    return true;
  }
  if (path.startsWith("data:image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

/**
 * Returns `true` if the given path or MIME type represents a video file.
 * Checks MIME prefix, data URI prefix, or common video file extensions.
 */
export function isVideo(path: string, mime?: string) {
  if (mime?.startsWith("video/")) {
    return true;
  }
  if (path.startsWith("data:video/")) {
    return true;
  }
  return /\.(mp4|webm|mov)$/i.test(path);
}

/**
 * Normalizes a media file path to a usable URL for `<img>` and `<video>` sources.
 * Passes through data URIs and absolute HTTP URLs unchanged; prepends `/` to relative paths.
 */
export function buildMediaSource(path: string) {
  if (path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }
  if (path.startsWith("/")) {
    return path;
  }
  return `/${path}`;
}
