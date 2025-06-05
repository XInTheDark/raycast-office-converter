import convertFiles from "./convert-file";

export default function convertToMarkdown() {
  return convertFiles({ arguments: { format: "md" } });
}
