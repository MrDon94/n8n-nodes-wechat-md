const { StyleGenerator } = require('./dist/nodes/WeChatMarkdown/style-generator');
const { addFootnotes, renderFootnotes } = require('./dist/nodes/WeChatMarkdown/markdown-utils');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const juice = require('juice');
const fs = require('fs');
const path = require('path');

// 1. Define your test configuration here
const config = {
    theme: 'default',           // 'default', 'orange', 'blue', 'custom'
    primaryColor: '#c24019ff',    // Custom purple color
    fontFamily: '"Times New Roman", serif',
    fontSize: '17px',
    blockStyle: 'mac',          // 'mac' or 'default'
    lineNumbers: true,
    textAlign: 'justify',
    textIndent: '2em',
    footnotes: false,
    codeTheme: 'github'        // 'github', 'github-dark', 'monokai', 'dracula'
};

console.log('Testing with config:', config);

// 2. Initialize MarkdownIt
const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight: (str, lang) => {
        let highlighted = '';
        if (lang && hljs.getLanguage(lang)) {
            try {
                highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
            } catch (__) {
                highlighted = md.utils.escapeHtml(str);
            }
        } else {
            highlighted = md.utils.escapeHtml(str);
        }

        if (config.lineNumbers) {
            const lines = str.trim().split('\n');
            let lineNumbersHtml = '';
            for (let j = 1; j <= lines.length; j++) {
                lineNumbersHtml += `<div>${j}</div>`;
            }

            return `<div class="code-with-line-numbers">
                <div class="code-line-numbers">${lineNumbersHtml}</div>
                <div class="code-content"><pre class="hljs"><code>${highlighted}</code></pre></div>
            </div>`;
        }

        return '<pre class="hljs"><code>' + highlighted + '</code></pre>';
    },
});

md.use(require('markdown-it-katex'));
addFootnotes(md);

// 3. Generate CSS
const generator = new StyleGenerator(config);
const css = generator.generateCss();

// 4. Load KaTeX CSS
const katexCss = fs.readFileSync(path.join(__dirname, 'nodes/WeChatMarkdown/katex.css'), 'utf8');
const fullCss = css + '\n' + katexCss;

// 5. Render Markdown
console.log('Reading Markdown from test.md...');
const markdownPath = path.join(__dirname, 'test.md');
let markdownContent = '';
try {
    markdownContent = fs.readFileSync(markdownPath, 'utf8');
} catch (err) {
    console.error('Error reading test.md:', err);
    process.exit(1);
}

const env = {};
let rawHtml = md.render(markdownContent, env);

if (env.footnotes && config.footnotes) {
    rawHtml += renderFootnotes(env.footnotes);
}

// 6. Inline CSS
const htmlWithStyle = `<style>${fullCss}</style><div class="wechat-content">${rawHtml}</div>`;
const inlineHtml = juice(htmlWithStyle, {
    inlinePseudoElements: true,
    preserveImportant: true,
});

// 7. Save to file
const outputPath = path.join(__dirname, 'test-config.html');
fs.writeFileSync(outputPath, inlineHtml);

console.log(`Successfully generated HTML at: ${outputPath}`);
console.log('Open this file in your browser to verify the styles.');
