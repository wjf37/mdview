// Updates the version in package.json, tauri.conf.json, and Cargo.toml.
// Usage: node scripts/set-version.js <version>   e.g. node scripts/set-version.js 0.2.0
const fs = require('fs');

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error('Usage: node scripts/set-version.js <version>  (e.g. 0.2.0)');
  process.exit(1);
}

// package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = version;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

// src-tauri/tauri.conf.json
const conf = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
conf.version = version;
fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(conf, null, 2) + '\n');

// src-tauri/Cargo.toml  (first version = "…" line only — the package version)
let cargo = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
cargo = cargo.replace(/^version = ".*"/m, `version = "${version}"`);
fs.writeFileSync('src-tauri/Cargo.toml', cargo);

console.log(`Version set to ${version}`);
