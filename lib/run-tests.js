const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const testDir = './src/tests';
const testFiles = fs.readdirSync(testDir).filter(file => file.match(/\..+\.spec\.ts$/));

(async () => {
  for (const file of testFiles) {
    console.log(`Running test: ${file}`);
    await new Promise((resolve, reject) => {
      exec(`npx ts-mocha -p tsconfig.json ${path.join(testDir, file)} --timeout 4000 --exit`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error in ${file}:\n`, stderr);
          return reject(err);
        }
        console.log(stdout);
        resolve();
      });
    });
  }
  console.log('All tests completed.');
})();
