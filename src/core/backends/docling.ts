import fs from "fs";
import path from "path";

import { getOutputPath, toExt } from "../../utils/path";
import { execSync } from "child_process";
import { createTempFolder } from "../../utils/path";
import shellescape from "shell-escape";

import { Backend } from "../../types";
import { getCliOptions } from "../../utils/cliOptions";

// some formats in docling are not extensions
const formatMap: Record<string, string> = {
  txt: "text",
};

// https://docling-project.github.io/docling/usage/#convert-a-single-document
// https://docling-project.github.io/docling/reference/cli/
export async function convert(inputPath: string, format: string, options?: { outputDir?: string }): Promise<void> {
  const cliOptions = getCliOptions(Backend.Docling);

  // set up temp folder
  const tempFolder = options?.outputDir || createTempFolder();

  const args = [
    inputPath,
    "--to",
    formatMap[format] || format,
    "--output",
    tempFolder,
    "--pdf-backend",
    "dlparse_v4",
    "--ocr-engine",
    "ocrmac",
    "--image-export-mode",
    "placeholder",
  ];
  const defaultOptions = shellescape(args);
  const mergedOptions = cliOptions ? `${defaultOptions} ${cliOptions}` : defaultOptions;

  const command = `docling ${mergedOptions}`;
  console.log(`Executing: ${command}`);

  execSync(command, {
    env: { ...process.env, PATH: `${process.env.PATH}:/opt/homebrew/bin/` },
    timeout: 10 * 60 * 1000,
    stdio: "inherit",
  });

  // locate the output file inside tempFolder
  let fileName = fs.readdirSync(tempFolder).find((file) => file.endsWith(toExt(format)));
  if (!fileName) {
    // try to use the biggest file in the folder, skipping the ext check
    const files = fs.readdirSync(tempFolder).filter((file) => fs.statSync(`${tempFolder}/${file}`).isFile());
    if (files.length === 0) {
      throw new Error("No output file found in the temp folder");
    }
    fileName = files.reduce((a, b) =>
      fs.statSync(`${tempFolder}/${a}`).size > fs.statSync(`${tempFolder}/${b}`).size ? a : b,
    );
    console.log(`No specific output file found, using the largest file: ${fileName}`);
  }

  const filePath = path.join(tempFolder, fileName);
  console.log(`Output file found: ${filePath}`);

  // If outputDir is provided, the file is already in the desired location.
  // Otherwise, move it next to the input file with a safe name.
  if (!options?.outputDir) {
    const outputPath = await getOutputPath(inputPath, toExt(format));
    // move file
    fs.renameSync(filePath, outputPath);
    console.log(`File moved to: ${outputPath}`);
  }
}
