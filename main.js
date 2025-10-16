const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();


program
  .option('-i, --input <file>', 'input JSON file (required)')
  .option('-o, --output <file>', 'output file ')
  .option('-d, --display', 'display result in console ')
  .option('-s, --survived', 'show only survived passengers (Survived = 1)')
  .option('-a, --age', 'display passenger age');

program.parse();

const options = program.opts();

// Перевірка обов’язкового параметра
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Читання даних
// Читання NDJSON або звичайного JSON
let data;
try {
  const rawData = fs.readFileSync(options.input, 'utf8').trim();

  if (rawData.includes('\n')) {
    // Якщо файл у форматі NDJSON — парсимо кожен рядок окремо
    data = rawData
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line));
  } else {
    // Інакше — звичайний JSON (масив або об’єкт)
    const parsed = JSON.parse(rawData);
    data = Array.isArray(parsed) ? parsed : [parsed];
  }
} catch (err) {
  console.error('Error reading or parsing input file');
  process.exit(1);
}

// Форматування кожного запису
const lines = data.map(passenger => {
  let parts = [passenger.Name];

  if (options.age) {
    // Якщо Age відсутній — підставляємо порожній рядок або "N/A"
    const age = passenger.Age != null ? passenger.Age : '';
    parts.push(age);
  }

  parts.push(passenger.Ticket);

  return parts.join(' ');
});

const output = lines.join('\n');

// Вивід у консоль, якщо -d
if (options.display) {
  console.log(output);
}

// Запис у файл, якщо -o
if (options.output) {
  fs.writeFileSync(options.output, output, 'utf8');
}
