const fs = require('fs');
const path = require('path');

const SizeItUp = {
  formatBytes: function(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  getDirectorySize: function(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stat.size;
      }
    });

    return totalSize;
  },

  calculate: function(dirOrFilePath, options) {
    options = options || {};
    options.showFiles = typeof options.showFiles === 'undefined' ? false : options.showFiles;
    options.log = typeof options.log === 'undefined' ? false : options.log;
    options.level = options.level || 0;

    const stat = fs.statSync(dirOrFilePath);

    if (stat.isFile()) {
      const size = stat.size;
      if (options.log) {
        console.log(`${dirOrFilePath}: ${this.formatBytes(size)}`);
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
          const dirSize = SizeItUp.getDirectorySize(fullPath);
          totalSize += dirSize;
          log(`${indentation}[${file}]: ${SizeItUp.formatBytes(dirSize)}`);
          const newOptions = { ...options, level: options.level + 1 };
          SizeItUp.calculate(fullPath, newOptions);
        } else {
          totalSize += childStat.size;
          if (options.showFiles) {
            log(`${indentation}${file}: ${SizeItUp.formatBytes(childStat.size)}`);
          }
        }
      });
    }

    if (options.level === 0) {
      const rootSize = SizeItUp.getDirectorySize(dirOrFilePath);
      log(`[${path.basename(dirOrFilePath)}]: ${SizeItUp.formatBytes(rootSize)}`);
      options.level++;
    }

    processDirectory();

    return totalSize;
  }
};

module.exports = SizeItUp;

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

  SizeItUp.calculate(dir, options);
}
