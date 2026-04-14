import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { renderMarkdown } from './markdown';

let readerRequestId = 0;

export async function loadReaderView(filePath: string): Promise<boolean> {
  const requestId = ++readerRequestId;

  const contentEl = document.getElementById('markdown-content') as HTMLElement;
  const errorEl = document.getElementById('reader-error') as HTMLElement;
  const filenameEl = document.getElementById('reader-filename') as HTMLElement;

  // Reset state
  contentEl.innerHTML = '';
  errorEl.classList.add('hidden');

  const filename = filePath.split(/[\\/]/).pop() ?? filePath;
  filenameEl.textContent = filename;
  await getCurrentWindow().setTitle(`mdview — ${filename}`);

  let content: string;
  try {
    content = await invoke<string>('read_file', { path: filePath });
  } catch (e) {
    if (requestId !== readerRequestId) return false;
    errorEl.textContent = `Could not read file: ${e}`;
    errorEl.classList.remove('hidden');
    return false;
  }

  if (requestId !== readerRequestId) return false;
  contentEl.innerHTML = renderMarkdown(content);
  return true;
}
