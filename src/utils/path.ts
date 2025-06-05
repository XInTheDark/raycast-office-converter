import path from "path";
import _fs from "fs";
import { environment } from "@raycast/api";
import { randomUUID } from "crypto";

export function toExt(format: string): string {
  return format.startsWith(".") ? format : `.${format}`;
}

export function changeExt(filePath: string, newExt: string): string {
  const { dir, name } = path.parse(filePath);
  return path.join(dir, `${name}${newExt}`);
}

export async function getOutputPath(inputPath: string, ext: string): Promise<string> {
  let p = changeExt(inputPath, ext);
  let i = 1;
  while (_fs.existsSync(p) && i < 1000) {
    const { dir, name } = path.parse(p);
    const newName = `${name} (${i++})`;
    p = path.join(dir, `${newName}${ext}`);
  }
  return p;
}

// Create a temp folder
// We can guarantee that the folder is empty
export function createTempFolder(): string {
  const parent = environment.supportPath;
  const tempFolderName = `${randomUUID()}-${Date.now()}`;
  const tempFolderPath = path.join(parent, tempFolderName);

  if (_fs.existsSync(tempFolderPath)) {
    _fs.rmSync(tempFolderPath, { recursive: true, force: true });
  }
  _fs.mkdirSync(tempFolderPath, { recursive: true });

  return tempFolderPath;
}
