const fs = require('fs');

async function fetchPage() {
    try {
        const response = await fetch('https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/2.rna-seq/2.1.expression-matrix');
        const text = await response.text();
        fs.writeFileSync('temp_expression_matrix.html', text);
        console.log('Page downloaded successfully. Length:', text.length);
    } catch (e) {
        console.error(e);
    }
}
fetchPage();
