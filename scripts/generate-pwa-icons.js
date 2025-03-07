const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_SVG = path.join(__dirname, '../public/assets/icons/logo-2.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sizes for PWA icons
const sizes = [192, 384, 512];

// Process each size
async function generateIcons() {
  console.log('Generating PWA icons from:', SOURCE_SVG);
  
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(SOURCE_SVG);

    // Generate each size
    for (const size of sizes) {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Generated: ${outputFile}`);
    }
    
    console.log('All PWA icons have been generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 