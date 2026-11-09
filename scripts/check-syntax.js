// BiteFlow Zero-Dependency Syntax Validator
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findJsFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const rootDir = path.resolve(__dirname, '..');
const jsFiles = findJsFiles(rootDir);

let hasError = false;
console.log(`Checking syntax for ${jsFiles.length} JavaScript files...`);

for (const file of jsFiles) {
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`Syntax error in ${file}:`);
    console.error(err.stderr.toString());
    hasError = true;
  }
}

if (hasError) {
  console.error('Syntax check failed.');
  process.exit(1);
} else {
  console.log('All JavaScript files passed syntax verification.');
}
