import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string): string {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Disable HTML passthrough — discard raw HTML blocks for security
marked.use({
  gfm: true,
  renderer: {
    html(): string {
      return '';
    },
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source) as string;
}
