const fs = require('fs');

async function fetchPage() {
    try {
        const response = await fetch('https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/1.mapping/1.2-bedtools-samtools');
        const text = await response.text();
        fs.writeFileSync('temp_page.html', text);
        console.log('Page downloaded successfully.');
    } catch (e) {
        console.error(e);
    }
}
fetchPage();
