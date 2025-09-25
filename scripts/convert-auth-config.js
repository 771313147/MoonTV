#!/usr/bin/env node
/* eslint-disable */
// AUTO-GENERATED SCRIPT: Converts auth.config.json to TypeScript definition.
// Usage: node scripts/convert-auth-config.js

const fs = require('fs');
const path = require('path');

// Resolve project root (one level up from scripts folder)
const projectRoot = path.resolve(__dirname, '..');

// Paths
const authConfigPath = path.join(projectRoot, 'auth.config.json');
const libDir = path.join(projectRoot, 'src', 'lib');
const oldAuthRuntimePath = path.join(libDir, 'auth-runtime.ts');
const newAuthRuntimePath = path.join(libDir, 'auth-runtime.ts');

// Delete the old auth-runtime.ts file if it exists
if (fs.existsSync(oldAuthRuntimePath)) {
  fs.unlinkSync(oldAuthRuntimePath);
  console.log('旧的 auth-runtime.ts 已删除');
}

// Read and parse auth.config.json
let rawAuthConfig;
try {
  rawAuthConfig = fs.readFileSync(authConfigPath, 'utf8');
} catch (err) {
  console.error(`无法读取 ${authConfigPath}:`, err);
  process.exit(1);
}

let authConfig;
try {
  authConfig = JSON.parse(rawAuthConfig);
} catch (err) {
  console.error('auth.config.json 不是有效的 JSON:', err);
  process.exit(1);
}

// Prepare TypeScript file content
const tsContent =
  `// 该文件由 scripts/convert-auth-config.js 自动生成，请勿手动修改\n` +
  `/* eslint-disable */\n\n` +
  `export const authConfig = ${JSON.stringify(authConfig, null, 2)} as const;\n\n` +
  `export type AuthRuntimeConfig = typeof authConfig;\n\n` +
  `export default authConfig;\n`;

// Ensure lib directory exists
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Write TypeScript file
try {
  fs.writeFileSync(newAuthRuntimePath, tsContent, 'utf8');
  console.log(`auth-runtime.ts 已生成: ${newAuthRuntimePath}`);
} catch (err) {
  console.error('写入 auth-runtime.ts 失败:', err);
  process.exit(1);
}