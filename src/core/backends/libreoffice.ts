import fs from "fs/promises";
import path from "path";
import { toExt, getOutputPath } from "../../utils/path";

import libre from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(libre.convert);

export async function convert(inputPath: string, format: string, options?: { outputDir?: string }): Promise<void> {
  const buf = await fs.readFile(inputPath);
  const ext = toExt(format);
  const newBuf = await convertAsync(buf, ext, undefined);
  const outputPath = options?.outputDir
    ? path.join(options.outputDir, `${path.parse(inputPath).name}${ext}`)
    : await getOutputPath(inputPath, ext);
  await fs.writeFile(outputPath, newBuf);
}
