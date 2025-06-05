import { Form, Action, ActionPanel } from "@raycast/api";
import { Backend } from "../types";
import { getDefaultBackend } from "../utils/cliOptions";

export const FormComponent = (props: {
  arguments: { format?: string; inputFiles?: string[] | null };
  onSubmit: (params: { inputPaths: string[]; format: string; backend: Backend }) => Promise<void>;
}) => {
  const args = props.arguments;
  const format = args.format || "";

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Convert"
            onSubmit={async (values) => {
              await props.onSubmit({
                inputPaths: values.inputPaths as string[],
                format: values.format as string,
                backend: values.backend as Backend,
              });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="inputPaths"
        title="Select Files"
        allowMultipleSelection
        defaultValue={props.arguments.inputFiles || []}
      />
      <Form.TextField id="format" title="Output Format" defaultValue={format} />
      <Form.Dropdown id="backend" title="Backend" defaultValue={getDefaultBackend()}>
        {Object.keys(Backend).map((b) => (
          <Form.Dropdown.Item key={b} value={Backend[b as keyof typeof Backend]} title={b} />
        ))}
      </Form.Dropdown>
    </Form>
  );
};
