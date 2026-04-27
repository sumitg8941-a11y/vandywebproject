const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Add watermark to PDF
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @returns {Promise<Buffer>} - Watermarked PDF buffer
 */
async function addWatermarkToPDF(pdfBuffer) {
    try {
        // Load the PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Get all pages
        const pages = pdfDoc.getPages();
        
        // Watermark text
        const watermarkText = 'DealNamaa Offers';
        const fontSize = 40;
        const textColor = rgb(0.86, 0.15, 0.15); // Red color #dc2626
        const opacity = 0.15; // 15% opacity
        
        // Add watermark to each page
        for (const page of pages) {
            const { width, height } = page.getSize();
            
            // Calculate text dimensions
            const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            const textHeight = fontSize;
            
            // Position: center of page, rotated 45 degrees
            const x = (width - textWidth) / 2;
            const y = (height - textHeight) / 2;
            
            // Draw watermark (diagonal)
            page.drawText(watermarkText, {
                x: x,
                y: y,
                size: fontSize,
                font: font,
                color: textColor,
                opacity: opacity,
                rotate: { angle: 45, type: 'degrees' },
            });
            
            // Add small watermark at bottom right corner
            page.drawText('dealnamaa.com', {
                x: width - 120,
                y: 20,
                size: 10,
                font: font,
                color: textColor,
                opacity: 0.5,
            });
        }
        
        // Save the modified PDF
        const watermarkedPdfBytes = await pdfDoc.save();
        return Buffer.from(watermarkedPdfBytes);
        
    } catch (error) {
        console.error('❌ Error adding watermark to PDF:', error);
        throw error;
    }
}

/**
 * Check if file is a PDF
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
function isPDF(mimeType) {
    return mimeType === 'application/pdf';
}

module.exports = {
    addWatermarkToPDF,
    isPDF,
};
