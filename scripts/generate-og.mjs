/**
 * Генерира растерните икони и OG изображението от монограма чрез sharp:
 * public/og.png (1200×630), apple-touch-icon.png (180), favicon-32/192/512.png, images/logo.png (512).
 * Стартиране: npm run og
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

/** Монограмът „TH“ (viewBox 560×560) като група с подаден цвят. */
const mark = (fill) =>
	`<g fill="${fill}"><rect width="560" height="40"/><rect width="40" height="560"/><rect y="520" width="560" height="40"/><rect x="520" width="40" height="210"/><rect x="80" y="80" width="400" height="50"/><rect x="255" y="80" width="50" height="390"/><rect x="130" y="175" width="50" height="295"/><rect x="375" y="175" width="50" height="295"/><rect x="180" y="300" width="195" height="45"/></g>`;

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
  <g transform="translate(1000 80) scale(0.2)">${mark('#c9a66b')}</g>
  <rect x="80" y="92" width="40" height="2" fill="#c9a66b"/>
  <text x="136" y="100" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="5" fill="#c9a66b">АДВОКАТ ТОДОР ХИНКОВ</text>
  <text x="80" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="84" font-weight="600" letter-spacing="10" fill="#f7f4ee">HINKOV LAW</text>
  <text x="80" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#f7f4ee">Правна защита с ясна стратегия</text>
  <text x="80" y="342" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="#f7f4ee">и последователни действия.</text>
  <text x="80" y="410" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#c3cad6">Правни консултации и процесуално представителство за граждани и бизнес</text>
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="4" fill="#c9a66b">ПЛОВДИВ, БЪЛГАРИЯ</text>
</svg>`;

const icon = (size, radius = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="#0c1626"/>
  <g transform="translate(10 10) scale(0.07857)">${mark('#f7f4ee')}</g>
</svg>`;

const logo = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0c1626"/>
  <g transform="translate(10 10) scale(0.07857)">${mark('#c9a66b')}</g>
</svg>`;

await writeFile('public/og.png', await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toBuffer());
await writeFile('public/apple-touch-icon.png', await sharp(Buffer.from(icon(180))).png().toBuffer());
await writeFile('public/favicon-32.png', await sharp(Buffer.from(icon(32, 6))).png().toBuffer());
await writeFile('public/favicon-192.png', await sharp(Buffer.from(icon(192, 20))).png().toBuffer());
await writeFile('public/favicon-512.png', await sharp(Buffer.from(icon(512, 0))).png().toBuffer());
await writeFile('public/images/logo.png', await sharp(Buffer.from(logo)).png().toBuffer());
console.log('✓ og.png, apple-touch-icon.png, favicon-32/192/512.png, images/logo.png');
