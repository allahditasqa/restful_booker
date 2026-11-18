// Opens the reports history (reports/index.html) in the default browser. Works on Windows, macOS and Linux.
const path = require('path');
const { exec } = require('child_process');

const file = path.resolve(__dirname, '..', 'reports', 'index.html');
const opener = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
exec(`${opener} "${file}"`, (error) => {
  if (error) console.log(`Open this file in a browser: ${file}`);
});
