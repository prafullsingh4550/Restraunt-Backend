// generateTableQRCodes.js
import QRCode from "qrcode";
import fs from "fs-extra";
import PDFDocument from "pdfkit";

const FRONTEND_URL = "https://restaurant-crm-frontend.vercel.app/menu?table="; // 🔧 change this
const NUM_TABLES = 20; // total number of tables
const OUTPUT_DIR = "./qrcodes";

// Ensure output directory exists
await fs.ensureDir(OUTPUT_DIR);

console.log(`🧾 Generating ${NUM_TABLES} QR codes...`);

// Step 1: Generate QR PNGs
for (let i = 1; i <= NUM_TABLES; i++) {
  const url = `${FRONTEND_URL}${i}`;
  const filePath = `${OUTPUT_DIR}/table-${i}.png`;
  await QRCode.toFile(filePath, url, { width: 400 });
  console.log(`✅ Table ${i} → ${url}`);
}

// Step 2: Create printable PDF
const pdfPath = `${OUTPUT_DIR}/Table_QRs.pdf`;
const doc = new PDFDocument({ margin: 50 });
const pageWidth = doc.page.width;
const qrSize = 200;
let x = 50;
let y = 70;
let count = 0;

doc.fontSize(22).text("Restaurant Table QR Codes", { align: "center" });
doc.moveDown(1.5);

for (let i = 1; i <= NUM_TABLES; i++) {
  const filePath = `${OUTPUT_DIR}/table-${i}.png`;

  // Draw label
  doc.fontSize(16).text(`Table ${i}`, x, y - 25);
  // Draw QR image
  doc.image(filePath, x, y, { fit: [qrSize, qrSize] });

  count++;
  x += qrSize + 70;

  // Move to next row
  if (count % 3 === 0) {
    x = 50;
    y += qrSize + 100;
  }

  // Add new page if full
  if (y > 700) {
    doc.addPage();
    y = 70;
    x = 50;
  }
}

doc.end();
doc.pipe(fs.createWriteStream(pdfPath));

console.log(`📄 PDF created: ${pdfPath}`);
console.log("✅ All QR codes generated successfully!");