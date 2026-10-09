const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fontsDir = path.join(root, 'worker', 'fonts');

const regB64 = fs.readFileSync(path.join(fontsDir, 'calibri.ttf')).toString('base64');
const boldB64 = fs.readFileSync(path.join(fontsDir, 'calibrib.ttf')).toString('base64');
const italicB64 = fs.readFileSync(path.join(fontsDir, 'calibrii.ttf')).toString('base64');

let out = '// Authentic Calibri font binary data for Cloudflare Workers PDF generation\n';
out += 'function base64ToUint8Array(base64) {\n';
out += '  if (typeof Buffer !== "undefined") {\n';
out += '    return new Uint8Array(Buffer.from(base64, "base64"));\n';
out += '  }\n';
out += '  const binaryString = atob(base64);\n';
out += '  const len = binaryString.length;\n';
out += '  const bytes = new Uint8Array(len);\n';
out += '  for (let i = 0; i < len; i++) {\n';
out += '    bytes[i] = binaryString.charCodeAt(i);\n';
out += '  }\n';
out += '  return bytes;\n';
out += '}\n\n';
out += 'export const CALIBRI_REGULAR_BASE64 = "' + regB64 + '";\n';
out += 'export const CALIBRI_BOLD_BASE64 = "' + boldB64 + '";\n';
out += 'export const CALIBRI_ITALIC_BASE64 = "' + italicB64 + '";\n\n';
out += 'let cachedRegularBytes = null;\nlet cachedBoldBytes = null;\nlet cachedItalicBytes = null;\n\n';
out += 'export function getCalibriRegularBytes() {\n';
out += '  if (!cachedRegularBytes) {\n';
out += '    cachedRegularBytes = base64ToUint8Array(CALIBRI_REGULAR_BASE64);\n';
out += '  }\n';
out += '  return cachedRegularBytes;\n';
out += '}\n\n';
out += 'export function getCalibriBoldBytes() {\n';
out += '  if (!cachedBoldBytes) {\n';
out += '    cachedBoldBytes = base64ToUint8Array(CALIBRI_BOLD_BASE64);\n';
out += '  }\n';
out += '  return cachedBoldBytes;\n';
out += '}\n\n';
out += 'export function getCalibriItalicBytes() {\n';
out += '  if (!cachedItalicBytes) {\n';
out += '    cachedItalicBytes = base64ToUint8Array(CALIBRI_ITALIC_BASE64);\n';
out += '  }\n';
out += '  return cachedItalicBytes;\n';
out += '}\n';

fs.writeFileSync(path.join(fontsDir, 'calibri-fonts.js'), out);
console.log('Successfully generated worker/fonts/calibri-fonts.js (' + out.length + ' bytes)');
