import { Clipboard, Form, Toast, showToast, closeMainWindow, popToRoot } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import path from "path";
import fs from "fs";

import { getSelectedFiles } from "./core/finder";
import { getDefaultBackend } from "./utils/cliOptions";
import { convertToFormats } from "./constants";
import { Backend } from "./types";
import { FormComponent } from "./views/form";
import { convertFileCore } from "./core/convert";
import { createTempFolder } from "./utils/path";

function listMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isFile() && f.toLowerCase().endsWith(".md"))
    .map((f) => path.join(dir, f));
}

async function convertAndCopyText(inputPaths: string[], backend: Backend): Promise<void> {
  await closeMainWindow();
  await showToast(Toast.Style.Animated, "Converting to text");

  const outputDir = createTempFolder();

  // Track {source file -> generated markdown} to include names/paths
  const collected: { src: string; out: string }[] = [];
  let seen = new Set(listMdFiles(outputDir));

  for (const file of inputPaths) {
    try {
      await convertFileCore(file, "md", backend, { outputDir });

      const current = new Set(listMdFiles(outputDir));
      const diff: string[] = [];
      for (const f of current) if (!seen.has(f)) diff.push(f);

      // If multiple candidates, pick the largest
      const chosen =
        diff.length === 0
          ? null
          : diff.length === 1
            ? diff[0]
            : diff.reduce((a, b) => (fs.statSync(a).size >= fs.statSync(b).size ? a : b));

      if (chosen) collected.push({ src: file, out: chosen });
      seen = current;
      await showToast(Toast.Style.Animated, `Converted ${path.basename(file)}`);
    } catch (e) {
      console.error(e);
    }
  }

  if (collected.length === 0) {
    await showToast(Toast.Style.Failure, "No text extracted");
    return;
  }

  // Read in order and concatenate, prefixing with file name and path
  const parts = collected.map(({ src, out }) => {
    const content = fs.readFileSync(out, "utf-8");
    const header = `--- ${path.basename(src)} — ${src} ---`;
    return `${header}\n${content}`;
  });
  const combined = parts.join("\n\n");

  await Clipboard.copy(combined);
  await showToast(Toast.Style.Success, "Text copied", `${combined.length} characters from ${collected.length} file(s)`);
  await popToRoot();
}

export default function ConvertToText() {
  const [showForm, setShowForm] = useState<boolean | null>(null);
  const [args, setArgs] = useState<{ format?: string; inputFiles?: string[] | null }>({ format: "md" });
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      const selectedFiles = await getSelectedFiles();

      const defaultBackend = getDefaultBackend();
      const availableFormats = convertToFormats[defaultBackend];
      const supportsMd = !availableFormats || availableFormats.includes("md");

      const valid = !!selectedFiles && selectedFiles.length > 0 && supportsMd;

      if (valid) {
        await convertAndCopyText(selectedFiles as string[], defaultBackend);
      } else {
        // Input incomplete or backend unsupported, show the form
        setArgs({ format: "md", inputFiles: selectedFiles || [] });
        setShowForm(true);
      }
    })();
  }, []);

  if (showForm) {
    return (
      <FormComponent
        arguments={args}
        onSubmit={async (params) => {
          const backend = params.backend || getDefaultBackend();
          const files = params.inputPaths || [];
          if (!files || files.length === 0) return;
          const fmt = (params.format || "md").toLowerCase();
          if (fmt !== "md") {
            await showToast(Toast.Style.Failure, "Only Markdown is supported in this command");
            return;
          }
          await convertAndCopyText(files, backend);
        }}
      />
    );
  }

  return <Form isLoading={true} />;
}
