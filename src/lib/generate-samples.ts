import fs from 'fs';
import path from 'path';

const SAMPLES_DIR = path.join(process.cwd(), 'public', 'samples');

if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

function generateVehicles() {
  const headers = "number,fuelType,make,model,capacity,status,driverName,driverPhone";
  let rows = [headers];
  for (let i = 1; i <= 25; i++) {
    const num = `TN ${i.toString().padStart(2, '0')} AB ${1000 + i}`;
    rows.push(`${num},Diesel,Tata,Starbus,50,ACTIVE,Driver ${i},+91 98765${i.toString().padStart(5, '0')}`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'vehicles.csv'), rows.join('\n'));
}

function generateStudents() {
  const headers = "name,registerNumber,department,vehicleNumber,routeName";
  let rows = [headers];
  for (let i = 1; i <= 30; i++) {
    const reg = `2026CS${100 + i}`;
    const vNum = `TN ${(i % 5 + 1).toString().padStart(2, '0')} AB ${1000 + (i % 5 + 1)}`;
    rows.push(`Student Name ${i},${reg},Computer Science,${vNum},Route ${i % 3 + 1}`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'students.csv'), rows.join('\n'));
}

function generateRoutes() {
  const headers = "name,distance,timing,description,boardingPoints";
  let rows = [headers];
  for (let i = 1; i <= 10; i++) {
    const stops = [`Stop A${i}`, `Stop B${i}`, `Stop C${i}`, `Stop D${i}`].join(',');
    rows.push(`Route ${i},${10 + i},07:30 AM - 08:30 AM,Main route for sector ${i},"${stops}"`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'routes.csv'), rows.join('\n'));
}

function generateFuel() {
  const headers = "vehicleNumber,date,fuelType,quantity,cost,startOdometer,endOdometer";
  let rows = [headers];
  for (let i = 1; i <= 20; i++) {
    const vNum = `TN ${(i % 5 + 1).toString().padStart(2, '0')} AB ${1000 + (i % 5 + 1)}`;
    const date = `2026-05-${i.toString().padStart(2, '0')}`;
    rows.push(`${vNum},${date},Diesel,50,4500,${10000 + (i * 200)},${10000 + (i * 200) + 150}`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'fuel.csv'), rows.join('\n'));
}

function generateMaintenance() {
  const headers = "vehicleNumber,date,serviceType,cost,serviceCenter,spareParts,notes";
  let rows = [headers];
  for (let i = 1; i <= 20; i++) {
    const vNum = `TN ${(i % 5 + 1).toString().padStart(2, '0')} AB ${1000 + (i % 5 + 1)}`;
    const date = `2026-04-${i.toString().padStart(2, '0')}`;
    rows.push(`${vNum},${date},Regular,5000,Service Center ${i},Oil Filter,Monthly routine check`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'maintenance.csv'), rows.join('\n'));
}

function generateExpenses() {
  const headers = "type,amount,date,vehicleNumber,notes";
  let rows = [headers];
  for (let i = 1; i <= 20; i++) {
    const types = ["Toll", "Parking", "Allowance", "Emergency", "Miscellaneous"];
    const type = types[i % 5];
    const vNum = `TN ${(i % 5 + 1).toString().padStart(2, '0')} AB ${1000 + (i % 5 + 1)}`;
    const date = `2026-05-${i.toString().padStart(2, '0')}`;
    rows.push(`${type},150,${date},${vNum},Daily trip expense`);
  }
  fs.writeFileSync(path.join(SAMPLES_DIR, 'expenses.csv'), rows.join('\n'));
}

console.log("Generating sample CSVs...");
generateVehicles();
generateStudents();
generateRoutes();
generateFuel();
generateMaintenance();
generateExpenses();
console.log("Done!");
