import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export interface BrowseCallbacks {
  onFileSelected: (filePath: string) => void;
}

export async function loadBrowseView(
  dir: string,
  callbacks: BrowseCallbacks
): Promise<void> {
  const dirNameEl = document.getElementById('browse-dir-name') as HTMLElement;
  const fileListEl = document.getElementById('file-list') as HTMLUListElement;
  const errorEl = document.getElementById('browse-error') as HTMLElement;
  const noFilesEl = document.getElementById('no-files-msg') as HTMLElement;

  // Show dir name (last segment of path)
  dirNameEl.textContent = dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;

  // Reset state
  fileListEl.innerHTML = '';
  errorEl.classList.add('hidden');
  noFilesEl.classList.add('hidden');

  let files: string[];
  try {
    files = await invoke<string[]>('list_md_files', { dir });
  } catch (e) {
    errorEl.textContent = `Could not read directory: ${e}`;
    errorEl.classList.remove('hidden');
    return;
  }

  if (files.length === 0) {
    noFilesEl.classList.remove('hidden');
    return;
  }

  for (const filePath of files) {
    const filename = filePath.split(/[\\/]/).pop() ?? filePath;
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'file-item';
    btn.textContent = filename;
    btn.addEventListener('click', () => callbacks.onFileSelected(filePath));
    li.appendChild(btn);
    fileListEl.appendChild(li);
  }
}

export async function pickFolder(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false });
  return typeof result === 'string' ? result : null;
}
