import { copyFile, access } from 'fs/promises';
import path from 'path';

async function main() {
  try {
    const distDir = path.resolve(process.cwd(), 'dist');
    const src = path.join(distDir, 'index.html');
    const dest = path.join(distDir, '404.html');

    // Check that dist/index.html exists
    await access(src);

    await copyFile(src, dest);
    console.log('Copied', src, 'to', dest);
  } catch (err) {
    console.error('Error copying index.html to 404.html:', err.message || err);
    process.exitCode = 1;
  }
}

main();
