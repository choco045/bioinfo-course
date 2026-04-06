const fs = require('fs');
const html = fs.readFileSync('temp_page.html', 'utf8');

// look for something that contains "wget" or similar commands since bedtools is mentioned
const preBlocks = html.match(/<pre[\s\S]*?<\/pre>/gi);
console.log(`Found ${preBlocks ? preBlocks.length : 0} pre blocks.`);

if (preBlocks) {
    preBlocks.slice(0, 3).forEach((c, i) => console.log(`Block ${i}:\n${c}\n`));
} else {
    // maybe div with class containing code or something
    const codeDivs = html.match(/<div[^>]*class="[^"]*code[^"]*"[^>]*>[\s\S]*?<\/div>/gi);
    console.log(`Found ${codeDivs ? codeDivs.length : 0} code divs.`);
    if (codeDivs) {
        codeDivs.slice(0, 3).forEach((c, i) => console.log(`Div ${i}:\n${c}\n`));
    }
}
