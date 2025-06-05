import { Form } from "@raycast/api";
import { getSelectedFiles } from "./core/finder";
import { FormComponent } from "./views/form";
import { useState, useEffect, useRef } from "react";

import { handleConversion } from "./core/convert";

export default function ConvertFiles(props: { arguments: { format?: string; inputFiles?: string[] | null } }) {
  const format = props.arguments.format;
  const [showForm, setShowForm] = useState<boolean | null>(null);
  const [args, setArgs] = useState(props.arguments);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // Prevent double execution
    hasRun.current = true;

    (async () => {
      const selectedFiles = await getSelectedFiles();

      // Validate input
      if (selectedFiles && selectedFiles.length > 0 && format) {
        await handleConversion({ inputPaths: selectedFiles, format: format || "" });
      } else {
        // Input is incomplete, show the form
        setArgs({ ...props.arguments, inputFiles: selectedFiles });
        setShowForm(true);
      }
    })();
  }, []);

  // Only show form if no files were selected in Finder
  if (showForm) {
    return <FormComponent arguments={args} onSubmit={handleConversion} />;
  }

  return <Form isLoading={true} />;
}
