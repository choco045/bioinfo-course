const fs = require('fs');

const html = fs.readFileSync('temp_expression_matrix.html', 'utf8');

// Extract the main content area
// GitBook typically has content in article or main tags
let content = html;

// Remove script tags
content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
// Remove style tags
content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

// Try to find the main article content
const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
const sectionMatch = content.match(/class="[^"]*page-inner[^"]*"[^>]*>([\s\S]*?)<\/section>/i);

let mainContent = '';
if (articleMatch) {
    mainContent = articleMatch[1];
    console.log('Found article tag');
} else if (mainMatch) {
    mainContent = mainMatch[1];
    console.log('Found main tag');
} else if (sectionMatch) {
    mainContent = sectionMatch[1];
    console.log('Found section.page-inner');
} else {
    // Try to find content between body tags
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        mainContent = bodyMatch[1];
        console.log('Found body tag');
    }
}

// Convert HTML to text
function htmlToText(html) {
    let text = html;
    
    // Handle code blocks first - preserve them
    text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
        const cleanCode = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]+>/g, '');
        return '\n```\n' + cleanCode + '\n```\n';
    });
    
    // Handle inline code
    text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, code) => {
        const cleanCode = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]+>/g, '');
        return '`' + cleanCode + '`';
    });
    
    // Handle headings
    text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
    text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
    text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
    text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
    text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
    
    // Handle paragraphs
    text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
    
    // Handle lists
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
    text = text.replace(/<ul[^>]*>/gi, '\n');
    text = text.replace(/<\/ul>/gi, '\n');
    text = text.replace(/<ol[^>]*>/gi, '\n');
    text = text.replace(/<\/ol>/gi, '\n');
    
    // Handle table elements
    text = text.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, ' | $1');
    text = text.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, ' | $1');
    text = text.replace(/<tr[^>]*>/gi, '\n');
    text = text.replace(/<\/tr>/gi, ' |');
    text = text.replace(/<table[^>]*>/gi, '\n');
    text = text.replace(/<\/table>/gi, '\n');
    text = text.replace(/<thead[^>]*>/gi, '');
    text = text.replace(/<\/thead>/gi, '');
    text = text.replace(/<tbody[^>]*>/gi, '');
    text = text.replace(/<\/tbody>/gi, '');
    
    // Handle line breaks
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Handle bold/italic
    text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
    text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
    
    // Handle links
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
    
    // Handle blockquotes
    text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&#x27;/g, "'");
    text = text.replace(/&#x2F;/g, '/');
    text = text.replace(/&apos;/g, "'");
    
    // Clean up excessive whitespace
    text = text.replace(/\n{4,}/g, '\n\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    
    return text.trim();
}

const textContent = htmlToText(mainContent);
fs.writeFileSync('temp_expression_matrix_text.txt', textContent);
console.log('Text extracted. Length:', textContent.length);
console.log('\n--- First 3000 chars ---\n');
console.log(textContent.substring(0, 3000));
