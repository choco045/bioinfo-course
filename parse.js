const fs = require('fs');

const html = fs.readFileSync('temp_page.html', 'utf8');

let contentMatch = html.match(/<main[\s\S]*?<\/main>/i);
if (!contentMatch) {
    contentMatch = html.match(/<article[\s\S]*?<\/article>/i);
}
let content = contentMatch ? contentMatch[0] : html;

// Remove unwanted things
content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
content = content.replace(/<svg[\s\S]*?<\/svg>/gi, '');
content = content.replace(/<nav[\s\S]*?<\/nav>/gi, '');
content = content.replace(/<header[\s\S]*?<\/header>/gi, '');
content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');

// Convert pre/code blocks
content = content.replace(/<pre[\s\S]*?<\/pre>/gi, match => {
    // strip all tags inside pre
    let text = match.replace(/<[^>]+>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    // unescape entities
    text = text.replace(/</g, '<').replace(/>/g, '>').replace(/&/g, '&').replace(/"/g, '"').replace(/'/g, "'");
    // Some lines have # which should not be separated by lots of spaces
    return `\n\`\`\`bash\n${text.trim()}\n\`\`\`\n`;
});

// Convert headings
content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

// Convert inline code
content = content.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

// Paragraphs
content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

// Clean all remaining tags
content = content.replace(/<[^>]+>/g, '');

// Unescape remaining entities
content = content.replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/&/g, '&')
                .replace(/"/g, '"')
                .replace(/'/g, "'")
                .replace(/&nbsp;/g, ' ');

// Clean up empty lines
content = content.split('\n').map(l => l.trimRight()).filter(l => l.trim() !== '' || l === '').join('\n');
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync('temp_extracted.md', content);
console.log("Extracted to temp_extracted.md");
