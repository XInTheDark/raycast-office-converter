import { Backend } from "../types";
import { getPreferenceValues } from "@raycast/api";

export function getAllCliOptions() {
  const cliOptionsString: string = getPreferenceValues()["cliOptions"];
  let cliOptions: Record<string, string> = {};
  try {
    cliOptions = JSON.parse(cliOptionsString);
  } catch (e) {
    console.error(e);
    return {};
  }

  // set all keys to lowercase
  cliOptions = Object.fromEntries(Object.entries(cliOptions).map(([key, value]) => [key.toLowerCase(), value]));

  return cliOptions;
}

export function getCliOptions(b: Backend): string {
  return getAllCliOptions()[b.toString()] || "";
}

export function getBackend(s: string): Backend | undefined {
  if (Object.values(Backend).includes(s as Backend)) {
    return s as Backend;
  }
  return undefined;
}

export function getDefaultBackend(): Backend {
  const backend = getPreferenceValues()["defaultBackend"];
  return getBackend(backend) || Backend.LibreOffice;
}
