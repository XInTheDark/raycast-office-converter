import path from "path";
import { getOutputPath, toExt } from "../../utils/path";
import { execSync } from "child_process";
import shellescape from "shell-escape";

import { Backend } from "../../types";
import { getCliOptions } from "../../utils/cliOptions";

export async function convert(inputPath: string, format: string, options?: { outputDir?: string }): Promise<void> {
  const cliOptions = getCliOptions(Backend.MarkItDown);

  const outputPath = options?.outputDir
    ? path.join(options.outputDir, `${path.parse(inputPath).name}${toExt(format)}`)
    : await getOutputPath(inputPath, toExt(format));
  const args = [inputPath, "-o", outputPath];

  const defaultOptions = shellescape(args);
  const mergedOptions = cliOptions ? `${defaultOptions} ${cliOptions}` : defaultOptions;

  const command = `markitdown ${mergedOptions}`;
  console.log(`Executing: ${command}`);

  execSync(command, {
    env: { ...process.env, PATH: `${process.env.PATH}:/opt/homebrew/bin/` },
    timeout: 10 * 60 * 1000,
    stdio: "inherit",
  });

  console.log(`Converted ${inputPath} to ${outputPath}`);
}
