import { invoke } from '@tauri-apps/api/core';
import { loadBrowseView, pickFileOrFolder } from './browse';
import { loadReaderView } from './reader';
import { initTheme } from './theme';
import './style.css';

interface StartupInfo {
  cli_arg_file: string | null;
  cli_arg_dir: string | null;
  home_dir: string;
  cwd: string;
}

let currentDir = '';

function showView(view: 'browse' | 'reader'): void {
  const browseEl = document.getElementById('browse-view') as HTMLElement;
  const readerEl = document.getElementById('reader-view') as HTMLElement;
  browseEl.classList.toggle('hidden', view !== 'browse');
  readerEl.classList.toggle('hidden', view !== 'reader');
}

async function navigateToBrowse(dir: string): Promise<void> {
  currentDir = dir;
  showView('browse');
  await loadBrowseView(dir, {
    onFileSelected: async (filePath: string) => {
      showView('reader');
      await loadReaderView(filePath);
    },
    onDirSelected: async (dirPath: string) => {
      await navigateToBrowse(dirPath);
    },
  });
}

async function init(): Promise<void> {
  const info = await invoke<StartupInfo>('get_startup_info');

  document.getElementById('open-folder-btn')!.addEventListener('click', async () => {
    const picked = await pickFileOrFolder();
    if (!picked) return;
    if (picked.kind === 'directory') {
      await navigateToBrowse(picked.path);
    } else {
      currentDir = picked.path.split(/[\\/]/).slice(0, -1).join('/') || info.home_dir || '/';
      showView('reader');
      await loadReaderView(picked.path);
    }
  });

  document.getElementById('back-btn')!.addEventListener('click', async () => {
    await navigateToBrowse(currentDir);
  });

  const defaultDir = info.cwd || info.home_dir || '/';

  if (info.cli_arg_file) {
    const parts = info.cli_arg_file.split(/[\\/]/);
    const parentDir = parts.slice(0, -1).join('/') || defaultDir;
    currentDir = parentDir;
    showView('reader');
    const ok = await loadReaderView(info.cli_arg_file);
    if (!ok) await navigateToBrowse(parentDir);
    return;
  }

  await navigateToBrowse(info.cli_arg_dir ?? defaultDir);
}

initTheme();
init();
