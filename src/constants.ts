import { Backend } from "./types";

// Defines the possible convert TO formats for each backend
export const convertToFormats: Record<Backend, string[] | null> = {
  [Backend.LibreOffice]: null,
  [Backend.Docling]: ["html", "md", "json", "txt"],
  [Backend.MarkItDown]: ["md"],
};
