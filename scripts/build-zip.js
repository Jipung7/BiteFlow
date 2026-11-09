// BiteFlow Extension Packaging Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const extensionDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');
const zipOutput = path.join(distDir, 'biteflow-extension-v1.0.0.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (fs.existsSync(zipOutput)) {
  fs.unlinkSync(zipOutput);
}

console.log('Packaging BiteFlow Chrome Extension...');

try {
  if (process.platform === 'win32') {
    // Gunakan .NET ZipFile untuk menghindari error Write-Progress pada lingkungan headless
    const psCmd = `powershell -NoProfile -Command "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('${extensionDir.replace(/\\/g, '\\\\')}', '${zipOutput.replace(/\\/g, '\\\\')}')"`;
    execSync(psCmd, { stdio: 'inherit' });
  } else {
    // Gunakan utilitas zip standar UNIX
    execSync(`cd "${extensionDir}" && zip -r "${zipOutput}" ./*`, {
      stdio: 'inherit'
    });
  }

  if (fs.existsSync(zipOutput)) {
    const stats = fs.statSync(zipOutput);
    console.log(`Package created successfully: dist/biteflow-extension-v1.0.0.zip (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    throw new Error('ZIP output file was not found.');
  }
} catch (err) {
  console.error('Failed to create ZIP package:', err.message);
  process.exit(1);
}
