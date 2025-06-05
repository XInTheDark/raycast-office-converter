import { getOutputPath, toExt } from "../../utils/path";
import { execSync } from "child_process";
import shellescape from "shell-escape";

import { Backend } from "../../types";
import { getCliOptions } from "../../utils/cliOptions";

export async function convert(inputPath: string, format: string): Promise<void> {
  const cliOptions = getCliOptions(Backend.MarkItDown);

  const outputPath = await getOutputPath(inputPath, toExt(format));
  const args = [inputPath, "-o", outputPath];

  const defaultOptions = shellescape(args);
  const options = cliOptions ? `${defaultOptions} ${cliOptions}` : defaultOptions;

  const command = `markitdown ${options}`;
  console.log(`Executing: ${command}`);

  execSync(command, {
    env: { ...process.env, PATH: `${process.env.PATH}:/opt/homebrew/bin/` },
    timeout: 10 * 60 * 1000,
    stdio: "inherit",
  });

  console.log(`Converted ${inputPath} to ${outputPath}`);
}
