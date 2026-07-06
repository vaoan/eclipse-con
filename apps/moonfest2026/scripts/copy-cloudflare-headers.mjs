import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("public", "_headers");
const destination = resolve("dist", "_headers");

if (existsSync(source)) {
  copyFileSync(source, destination);
}
