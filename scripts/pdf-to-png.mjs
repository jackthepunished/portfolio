// Renders the first page of public/resume.pdf as public/resume.png using pdfjs-dist + @napi-rs/canvas.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const pdfPath = path.join(root, 'public', 'resume.pdf');
const pngPath = path.join(root, 'public', 'resume.png');

try {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');
  const data = await readFile(pdfPath);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data), disableFontFace: true }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const png = canvas.toBuffer('image/png');
  await writeFile(pngPath, png);
  console.log('Wrote', pngPath, '(' + png.length + ' bytes)');
} catch (e) {
  console.warn('pdf-to-png skipped:', e && e.message ? e.message : e);
}
