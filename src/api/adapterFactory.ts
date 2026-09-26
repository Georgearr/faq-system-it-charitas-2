import { AppAdapter } from './AppAdapter';
import { MockAdapter } from './MockAdapter';
import { AppsScriptAdapter } from './AppsScriptAdapter';

let activeAdapter: AppAdapter | null = null;

export function getAppAdapter(): AppAdapter {
  if (activeAdapter) {
    return activeAdapter;
  }

  // Detect Google Apps Script Web App environment
  const isGAS =
    typeof window !== 'undefined' &&
    typeof window.google !== 'undefined' &&
    typeof window.google.script !== 'undefined' &&
    typeof window.google.script.run !== 'undefined';

  if (isGAS) {
    activeAdapter = new AppsScriptAdapter();
  } else {
    activeAdapter = new MockAdapter();
  }

  return activeAdapter;
}

export function setAppAdapter(adapter: AppAdapter): void {
  activeAdapter = adapter;
}
