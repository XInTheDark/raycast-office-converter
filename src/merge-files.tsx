import { readFileSync } from "fs";
import { openSync, writeSync, closeSync } from "fs";

import path from "path";
import { getSelectedFiles } from "./core/finder";
import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";

export default function MergeFiles() {
  const [files, setFiles] = useState<string[]>([]);
  const { pop } = useNavigation();

  useEffect(() => {
    (async () => {
      const selectedFiles = await getSelectedFiles();
      if (selectedFiles) {
        setFiles(selectedFiles);
      }
    })();
  }, []);

  function mergeFiles(filePaths: string[], outputPath: string): void {
    for (const filePath of filePaths) {
      try {
        const fileContent = readFileSync(filePath, "utf-8");
        const fd = openSync(outputPath, "a");
        try {
          writeSync(fd, `--- ${filePath} ---\n`);
          writeSync(fd, fileContent);
          writeSync(fd, "\n\n");
        } catch (writeError) {
          console.error(`Error writing to file ${outputPath}:`, writeError);
        } finally {
          closeSync(fd);
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }
  }

  async function handleSave({ inputFiles, outputPath }: { inputFiles: string[]; outputPath: string }): Promise<void> {
    if (!inputFiles || inputFiles.length === 0) {
      return;
    }

    await showToast({ title: "Merging Files", style: Toast.Style.Animated });

    if (!outputPath) {
      outputPath = path.join(path.dirname(inputFiles[0]), `merged-${Date.now()}.txt`);
    }
    mergeFiles(inputFiles, outputPath);

    console.log(`Merged content saved to ${outputPath}`);
    pop();
    await showToast({ title: "Merged", message: `Saved to ${outputPath}`, style: Toast.Style.Success });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Merge Files…" onSubmit={handleSave} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="inputFiles"
        title="Select Files"
        allowMultipleSelection
        value={files}
        onChange={(f) => setFiles(f as string[])}
        info="Select text files to merge. The content will be appended in the order selected."
      />
      <Form.TextField
        id="outputPath"
        title="Output Path"
        placeholder="Leave blank for auto-generated name"
        info="Enter path to save merged file. Leave blank for a random name in the current directory."
      />
    </Form>
  );
}
