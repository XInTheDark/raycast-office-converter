import fs from "fs/promises";
import { toExt, getOutputPath } from "../../utils/path";

import libre from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(libre.convert);

export async function convert(inputPath: string, format: string): Promise<void> {
  const buf = await fs.readFile(inputPath);
  const ext = toExt(format);
  const newBuf = await convertAsync(buf, ext, undefined);
  const outputPath = await getOutputPath(inputPath, ext);
  await fs.writeFile(outputPath, newBuf);
}
