const fs = require('fs');
const html = fs.readFileSync('temp_page.html', 'utf8');
const codeBlocks = html.match(/<code[\s\S]*?<\/code>/gi);
console.log(`Found ${codeBlocks ? codeBlocks.length : 0} code blocks.`);
if (codeBlocks) {
    codeBlocks.slice(0, 5).forEach((c, i) => console.log(`Block ${i}:\n${c}\n`));
}
