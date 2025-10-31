// scripts/seed/seed-examples.mjs
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const dataDir = "data";
const outDir = "examples";

fs.mkdirSync(outDir, { recursive: true });

const csvFiles = fs.existsSync(dataDir)
  ? fs.readdirSync(dataDir).filter(f => f.endsWith(".csv"))
  : [];

for (const file of csvFiles) {
  const csv = fs.readFileSync(path.join(dataDir, file), "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true });

  // Example format: wrap in { result: [...] } for ServiceNow-like responses
  const example = { result: rows };
  const outName = file.replace(/\.csv$/i, ".json");
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, JSON.stringify(example, null, 2), "utf8");
  console.log(`Wrote ${outPath} from ${file}`);
}

if (csvFiles.length === 0) {
  console.log("No CSV files found in data/ directory. Skipping seed.");
}
