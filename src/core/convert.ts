import { closeMainWindow, popToRoot, showToast, Toast } from "@raycast/api";

import { convert as libreoffice } from "./backends/libreoffice";
import { convert as docling } from "./backends/docling";
import { convert as markitdown } from "./backends/markitdown";

import { Backend } from "../types";
import { getDefaultBackend } from "../utils/cliOptions";

export async function handleConversion(params: { inputPaths: string[]; format: string; backend?: Backend }) {
  // Parameters
  params.backend = params.backend || getDefaultBackend();

  await closeMainWindow();

  if (!params.format) {
    await showToast(Toast.Style.Failure, "Format is required");
    return;
  }

  const files = params.inputPaths;
  if (!files || files.length === 0) {
    await showToast(Toast.Style.Failure, "No files selected");
    return;
  }

  console.log("Input files: ", files);
  await showToast(Toast.Style.Animated, "Converting files");

  let successful = 0,
    failed = 0;
  for (const file of files) {
    try {
      await convertFileCore(file, params.format, params.backend);
      successful++;
    } catch (e) {
      console.error(e);
      failed++;
    }
  }

  const message = `Converted ${successful} file(s) to ${params.format}`;
  if (failed > 0) {
    await showToast(Toast.Style.Failure, `${message}, ${failed} failed`);
  } else {
    await showToast(Toast.Style.Success, message);
  }

  await popToRoot();
}

async function convertFileCore(file: string, format: string, backend?: Backend) {
  switch (backend) {
    case Backend.LibreOffice:
      return await libreoffice(file, format);
    case Backend.Docling:
      return await docling(file, format);
    case Backend.MarkItDown:
      return await markitdown(file, format);
    default:
      throw new Error(`Unsupported backend: ${backend}`);
  }
}
