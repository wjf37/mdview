import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface DirEntry {
  path: string;
  kind: 'file' | 'directory';
}

export interface BrowseCallbacks {
  onFileSelected: (filePath: string) => void;
  onDirSelected: (dirPath: string) => void;
}

let showHidden = false;
let currentBrowseDir = '';
let currentCallbacks: BrowseCallbacks | null = null;
let contextMenuReady = false;

function entryName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function setupContextMenu(): void {
  if (contextMenuReady) return;
  contextMenuReady = true;

  const menu = document.createElement('div');
  menu.className = 'context-menu hidden';
  menu.innerHTML = `
    <button class="context-menu-item" id="toggle-hidden-btn">
      <span class="context-menu-check" id="hidden-check"></span>
      Show hidden folders
    </button>`;
  document.body.appendChild(menu);

  const browseEl = document.getElementById('browse-view')!;

  browseEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const check = document.getElementById('hidden-check')!;
    check.textContent = showHidden ? '✓' : '';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.classList.remove('hidden');
  });

  document.getElementById('toggle-hidden-btn')!.addEventListener('click', async () => {
    showHidden = !showHidden;
    menu.classList.add('hidden');
    if (currentCallbacks) await loadBrowseView(currentBrowseDir, currentCallbacks);
  });

  document.addEventListener('click', () => menu.classList.add('hidden'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menu.classList.add('hidden');
  });
}

export async function loadBrowseView(
  dir: string,
  callbacks: BrowseCallbacks
): Promise<void> {
  currentBrowseDir = dir;
  currentCallbacks = callbacks;
  setupContextMenu();

  const dirNameEl = document.getElementById('browse-dir-name') as HTMLElement;
  const fileListEl = document.getElementById('file-list') as HTMLUListElement;
  const errorEl = document.getElementById('browse-error') as HTMLElement;
  const noFilesEl = document.getElementById('no-files-msg') as HTMLElement;

  dirNameEl.textContent = dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;

  fileListEl.innerHTML = '';
  errorEl.classList.add('hidden');
  noFilesEl.classList.add('hidden');

  let entries: DirEntry[];
  try {
    entries = await invoke<DirEntry[]>('list_entries', { dir });
  } catch (e) {
    errorEl.textContent = `Could not read directory: ${e}`;
    errorEl.classList.remove('hidden');
    return;
  }

  const visible = showHidden
    ? entries
    : entries.filter(e => !entryName(e.path).startsWith('.'));

  if (visible.length === 0) {
    noFilesEl.classList.remove('hidden');
    return;
  }

  for (const entry of visible) {
    const name = entryName(entry.path);
    const li = document.createElement('li');
    const btn = document.createElement('button');
    if (entry.kind === 'directory') {
      btn.className = 'file-item dir-item';
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('width', '13');
      icon.setAttribute('height', '12');
      icon.setAttribute('viewBox', '0 0 13 12');
      icon.setAttribute('fill', 'currentColor');
      icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M0 2.5A1.5 1.5 0 011.5 1h2.086a1 1 0 01.707.293L5.5 2.5H11.5A1.5 1.5 0 0113 4v6a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 010 10V2.5z');
      icon.appendChild(path);
      const label = document.createTextNode(` ${name}`);
      btn.appendChild(icon);
      btn.appendChild(label);
      btn.addEventListener('click', () => callbacks.onDirSelected(entry.path));
    } else {
      btn.className = 'file-item';
      btn.textContent = name;
      btn.addEventListener('click', () => callbacks.onFileSelected(entry.path));
    }
    li.appendChild(btn);
    fileListEl.appendChild(li);
  }
}

export type PickResult =
  | { kind: 'file'; path: string }
  | { kind: 'directory'; path: string }
  | null;

export async function pickFileOrFolder(): Promise<PickResult> {
  const result = await open({
    directory: false,
    multiple: false,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (typeof result !== 'string') return null;
  const pathType = await invoke<string>('get_path_type', { path: result });
  if (pathType === 'directory') return { kind: 'directory', path: result };
  if (pathType === 'file') return { kind: 'file', path: result };
  return null;
}
