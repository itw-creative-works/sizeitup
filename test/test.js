const package = require('../package.json');
const assert = require('assert');

beforeEach(() => {
});

before(() => {
});

after(() => {
});

/*
 * ============
 *  Test Cases
 * ============
 */
describe(`${package.name}`, () => {
  const lib = require('../dist/index.js');

  describe('.directories()', () => {

    const size_files = lib.calculate('./test/files', { showFiles: true, log: true });

    it('should calculate all files in the directory', () => {
      return assert.equal(size_files, 9);
    });

  });  

  describe('.files()', () => {

    const size_blank = lib.calculate('./test/files/blank.txt', { showFiles: false, log: true });
    const size_hi = lib.calculate('./test/files/hi.txt', { showFiles: false, log: true });
    const size_bye = lib.calculate('./test/files/bye.txt', { showFiles: false, log: true });

    it('should calculate blank.txt', () => {
      return assert.equal(size_blank, 0);
    });

    it('should calculate hi.txt', () => {
      return assert.equal(size_hi, 4);
    });    

    it('should calculate bye.txt', () => {
      return assert.equal(size_bye, 5);
    });      

  });    

})
