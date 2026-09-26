import { build } from 'vite';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

async function buildForGAS() {
  console.log('🔨 Building React app for Google Apps Script deployment...');
  
  // Build the React app
  await build({
    configFile: resolve(projectRoot, 'vite.config.ts'),
    mode: 'production',
  });

  console.log('📦 Copying build output to GAS folder...');
  
  const distDir = resolve(projectRoot, 'dist');
  const gasDir = resolve(projectRoot, 'gas');
  
  // Clean gas folder except .gs files and appsscript.json
  const filesToKeep = ['Code.gs', 'appsscript.json'];
  const gasFiles = await import('fs/promises').then(fs => fs.readdir(gasDir));
  
  for (const file of gasFiles) {
    if (!filesToKeep.includes(file)) {
      rmSync(resolve(gasDir, file), { recursive: true, force: true });
    }
  }
  
  // Copy all build assets to gas folder
  const distFiles = await import('fs/promises').then(fs => fs.readdir(distDir, { recursive: true }));
  
  async function copyRecursive(src, dest) {
    const stat = await import('fs/promises').then(fs => fs.stat(src));
    if (stat.isDirectory()) {
      mkdirSync(dest, { recursive: true });
      const entries = await import('fs/promises').then(fs => fs.readdir(src));
      for (const entry of entries) {
        await copyRecursive(resolve(src, entry), resolve(dest, entry));
      }
    } else {
      copyFileSync(src, dest);
    }
  }
  
  await copyRecursive(distDir, gasDir);
  
  // Read the generated index.html from dist and create GAS-compatible index.html
  const distIndexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
  
  // Extract the script and link tags
  const scriptMatches = [...distIndexHtml.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)];
  const linkMatches = [...distIndexHtml.matchAll(/<link[^>]*href="([^"]+)"[^>]*>/g)];
  
  // Create GAS-compatible HTML that inlines the scripts/styles or references them correctly
  // For GAS, we need to serve the built assets. The easiest approach is to create an index.html
  // that uses the built files directly.
  
  let gasIndexHtml = distIndexHtml
    .replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/, '')
    .replace(/<link rel="modulepreload" href="[^"]*">/g, '')
    .replace(/<script type="module" src="([^"]+)"><\/script>/g, (match, src) => {
      // Convert to GAS-compatible script include
      const filename = src.split('/').pop();
      return `<script src="${filename}"></script>`;
    })
    .replace(/<link rel="stylesheet" href="([^"]+)">/g, (match, href) => {
      const filename = href.split('/').pop();
      return `<link rel="stylesheet" href="${filename}">`;
    });
  
  // Also need to handle the base path - GAS serves from root
  gasIndexHtml = gasIndexHtml
    .replace(/src="\/assets\//g, 'src="')
    .replace(/href="\/assets\//g, 'href="');
  
  writeFileSync(resolve(gasDir, 'index.html'), gasIndexHtml);
  
  console.log('✅ GAS build complete! Files copied to gas/ folder.');
  console.log('📝 Deploy the gas/ folder contents to Google Apps Script.');
}

buildForGAS().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});