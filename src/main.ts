import { invoke } from '@tauri-apps/api/core';
import { loadBrowseView, pickFolder } from './browse';
import { loadReaderView } from './reader';
import './style.css';

interface StartupInfo {
  cli_arg_file: string | null;
  cli_arg_dir: string | null;
  home_dir: string;
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
  });
}

async function init(): Promise<void> {
  const info = await invoke<StartupInfo>('get_startup_info');

  document.getElementById('open-folder-btn')!.addEventListener('click', async () => {
    const dir = await pickFolder();
    if (dir) await navigateToBrowse(dir);
  });

  document.getElementById('back-btn')!.addEventListener('click', () => {
    navigateToBrowse(currentDir);
  });

  if (info.cli_arg_file) {
    showView('reader');
    const ok = await loadReaderView(info.cli_arg_file);
    if (!ok) await navigateToBrowse(info.home_dir || '/');
    return;
  }

  await navigateToBrowse(info.cli_arg_dir ?? (info.home_dir || '/'));
}

init();
