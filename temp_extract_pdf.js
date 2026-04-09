const fs = require('fs');
const path = require('path');

const pdfFile = process.argv[2];
const outFile = process.argv[3];

if (!pdfFile) {
    console.error('Usage: node temp_extract_pdf.js <PDF path> [output.txt]');
    process.exit(1);
}

(async () => {
    try {
        // Handle both default and named exports for pdf-parse
        let pdfParse = require('pdf-parse');
        if (pdfParse && pdfParse.default) pdfParse = pdfParse.default;

        const dataBuffer = fs.readFileSync(path.resolve(pdfFile));
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        if (outFile) {
            fs.writeFileSync(path.resolve(outFile), text, 'utf8');
            console.log('SUCCESS: Text saved to ' + outFile);
            console.log('Pages: ' + data.numpages);
            console.log('Chars: ' + text.length);
        } else {
            console.log(text);
        }
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
})();
