const fs = require('fs');
const path = require('path');

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getDirectorySize(dir) {
  let totalSize = 0;

  dir = dir || './';

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      totalSize += getDirectorySize(fullPath);
    } else {
      totalSize += stat.size;
    }
  });

  return totalSize;
}

function displaySize(dirOrFilePath, options) {
  dirOrFilePath = dirOrFilePath || './';
  
  options = options || {};
  options.showFiles = typeof options.showFiles === 'undefined' ? false : options.showFiles;
  options.log = typeof options.log === 'undefined' ? false : options.log;
  options.level = options.level || 0;

  const stat = fs.statSync(dirOrFilePath);

  if (stat.isFile()) {
    const size = stat.size;
    if (options.log) {
      console.log(`${dirOrFilePath}: ${formatBytes(size)}`);
    }
    return size;
  }

  let totalSize = 0;

  function log() {
    if (options.log) {
      console.log(...arguments);
    }
  }

  function processDirectory() {
    const files = fs.readdirSync(dirOrFilePath);

    files.forEach(file => {
      const fullPath = path.join(dirOrFilePath, file);
      const childStat = fs.statSync(fullPath);
      const indentation = '  '.repeat(options.level);

      if (childStat.isDirectory()) {
        const dirSize = getDirectorySize(fullPath);
        totalSize += dirSize;
        log(`${indentation}[${file}]: ${formatBytes(dirSize)}`);
        const newOptions = { ...options, level: options.level + 1 };
        displaySize(fullPath, newOptions);
      } else {
        totalSize += childStat.size;
        if (options.showFiles) {
          log(`${indentation}${file}: ${formatBytes(childStat.size)}`);
        }
      }
    });
  }

  if (options.level === 0) {
    const rootSize = getDirectorySize(dirOrFilePath);
    log(`[${path.basename(dirOrFilePath)}]: ${formatBytes(rootSize)}`);
    options.level++;
  }

  processDirectory();

  return totalSize;
}

module.exports = displaySize;

// If running in cli, handle it properly
if (require.main === module) {
  const dir = process.argv[2];
  const options = {};

  options.showFiles = process.argv.includes('--show-files');
  options.log = true;

  if (!dir) {
    console.error('Please provide a directory to display the size of.');
    process.exit(1);
  }

  displaySize(dir, options);
}
