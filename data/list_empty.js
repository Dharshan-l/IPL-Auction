const fs = require('fs');
const path = require('path');

const playersFilePath = '/app/src/data/players.ts';
if (!fs.existsSync(playersFilePath)) {
  console.error('File not found:', playersFilePath);
  process.exit(1);
}
const content = fs.readFileSync(playersFilePath, 'utf-8');

// Extract CSV parts
const partRegex = /const CSV_PART\d = `([^`]+)`/g;
let match;
const players = [];

while ((match = partRegex.exec(content)) !== null) {
  const lines = match[1].trim().split('\n');
  for (const line of lines) {
    if (line.startsWith('Name,Team,Role') || !line.trim()) continue;
    const cols = line.split(',');
    if (cols.length > 0) {
      const name = cols[0].trim();
      const country = cols[3] ? cols[3].trim() : '';
      if (!country) {
        players.push(name);
      }
    }
  }
}

console.log('Total players with empty country:', players.length);
console.log(JSON.stringify(players));
process.exit(0);
