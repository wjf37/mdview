import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { renderMarkdown } from './markdown';

export async function loadReaderView(filePath: string): Promise<boolean> {
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
    errorEl.textContent = `Could not read file: ${e}`;
    errorEl.classList.remove('hidden');
    return false;
  }

  contentEl.innerHTML = renderMarkdown(content);
  return true;
}
