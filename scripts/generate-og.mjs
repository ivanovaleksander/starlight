/**
 * Генерира public/og.png (1200×630) и public/apple-touch-icon.png от SVG чрез sharp.
 * Стартиране: npm run og
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#122035"/>
      <stop offset="1" stop-color="#070d18"/>
    </linearGradient>
    <pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="#c9a66b" stroke-opacity="0.14" stroke-width="1"/>
    </pattern>
    <linearGradient id="pg" x1="0" x2="1">
      <stop offset="0" stop-color="#c9a66b" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#c9a66b"/>
      <stop offset="1" stop-color="#c9a66b" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <path d="M-20 520 L260 520 L400 400 L700 400 L840 280 L1100 280 L1240 160" fill="none" stroke="url(#pg)" stroke-width="2"/>
  <g fill="#c9a66b">
    <circle cx="260" cy="520" r="5"/><circle cx="400" cy="400" r="5"/><circle cx="700" cy="400" r="5"/><circle cx="840" cy="280" r="5"/><circle cx="1100" cy="280" r="5"/>
  </g>
  <rect x="80" y="92" width="40" height="2" fill="#c9a66b"/>
  <text x="136" y="100" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="5" fill="#c9a66b">АДВОКАТ ТОДОР ХИНКОВ</text>
  <text x="80" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="84" font-weight="600" letter-spacing="10" fill="#f7f4ee">HINKOV LAW</text>
  <text x="80" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#f7f4ee">Правна защита с ясна стратегия</text>
  <text x="80" y="342" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#f7f4ee">и последователни действия.</text>
  <text x="80" y="410" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#c3cad6">Правни консултации и процесуално представителство за граждани и бизнес</text>
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="4" fill="#c9a66b">ПЛОВДИВ, БЪЛГАРИЯ</text>
</svg>`;

const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0c1626"/>
  <path d="M18 16v32M18 32h14M32 16v32" fill="none" stroke="#c9a66b" stroke-width="4" stroke-linecap="square"/>
  <path d="M40 48h10M40 16v32" fill="none" stroke="#f7f4ee" stroke-width="4" stroke-linecap="square"/>
</svg>`;

await writeFile('public/og.png', await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toBuffer());
await writeFile(
	'public/apple-touch-icon.png',
	await sharp(Buffer.from(icon)).resize(180, 180).png().toBuffer(),
);
console.log('✓ public/og.png, public/apple-touch-icon.png');
