"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatMarkdown = void 0;
const markdown_it_1 = __importDefault(require("markdown-it"));
const highlight_js_1 = __importDefault(require("highlight.js"));
const juice_1 = __importDefault(require("juice"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const style_generator_1 = require("./style-generator");
const markdown_utils_1 = require("./markdown-utils");
class WeChatMarkdown {
    constructor() {
        this.description = {
            displayName: 'WeChat Markdown',
            name: 'weChatMarkdown',
            icon: 'fa:weixin',
            group: ['transform'],
            version: 1,
            description: 'Convert Markdown to WeChat Official Account compatible HTML',
            defaults: {
                name: 'WeChat Markdown',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Markdown Content',
                    name: 'markdownContent',
                    type: 'string',
                    default: '',
                    placeholder: '# Hello World',
                    description: 'The Markdown content to convert',
                    typeOptions: {
                        rows: 10,
                    },
                },
                {
                    displayName: 'Configuration (JSON)',
                    name: 'configJson',
                    type: 'json',
                    default: '{}',
                    description: 'Advanced configuration in JSON format. Overrides other settings.',
                    typeOptions: {
                        rows: 5,
                    },
                },
                {
                    displayName: 'Theme',
                    name: 'theme',
                    type: 'options',
                    options: [
                        {
                            name: 'Default (Green)',
                            value: 'default',
                        },
                        {
                            name: 'Orange',
                            value: 'orange',
                        },
                        {
                            name: 'Blue',
                            value: 'blue',
                        },
                        {
                            name: 'Custom CSS',
                            value: 'custom',
                        },
                    ],
                    default: 'default',
                    description: 'The CSS theme to apply',
                },
                {
                    displayName: 'Custom CSS',
                    name: 'customCss',
                    type: 'string',
                    default: '',
                    placeholder: 'h1 { color: red; }',
                    description: 'Custom CSS to apply',
                    displayOptions: {
                        show: {
                            theme: [
                                'custom',
                            ],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const themes = {};
        const themeFiles = {
            'default': 'default-theme.css',
            'orange': 'orange-theme.css',
            'blue': 'blue-theme.css',
        };
        for (const [key, filename] of Object.entries(themeFiles)) {
            try {
                const themePath = path.join(__dirname, filename);
                if (fs.existsSync(themePath)) {
                    themes[key] = fs.readFileSync(themePath, 'utf8');
                }
            }
            catch (error) {
                console.error(`Failed to load theme ${key}:`, error);
            }
        }
        const katexThemePath = path.join(__dirname, 'katex.css');
        let katexCss = '';
        try {
            if (fs.existsSync(katexThemePath)) {
                katexCss = fs.readFileSync(katexThemePath, 'utf8');
            }
        }
        catch (error) {
            console.error('Failed to load katex theme:', error);
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const markdownContent = this.getNodeParameter('markdownContent', i);
                const theme = this.getNodeParameter('theme', i);
                let configJsonStr = '{}';
                try {
                    configJsonStr = this.getNodeParameter('configJson', i);
                }
                catch (e) {
                }
                let config = {};
                try {
                    config = JSON.parse(configJsonStr);
                }
                catch (e) {
                    console.warn('Invalid JSON config', e);
                }
                let css = '';
                if (Object.keys(config).length > 0) {
                    const generator = new style_generator_1.StyleGenerator(config);
                    css = generator.generateCss();
                    const codeTheme = config.codeTheme || 'github';
                    const hljsThemePath = path.join(__dirname, '../../node_modules/highlight.js/styles', `${codeTheme}.css`);
                    try {
                        if (fs.existsSync(hljsThemePath)) {
                            css += '\n' + fs.readFileSync(hljsThemePath, 'utf8');
                        }
                        else {
                            const fallbackPath = path.join(__dirname, '../../node_modules/highlight.js/styles/github.css');
                            if (fs.existsSync(fallbackPath)) {
                                css += '\n' + fs.readFileSync(fallbackPath, 'utf8');
                            }
                        }
                    }
                    catch (e) {
                        console.warn('Failed to load highlight.js theme', e);
                    }
                }
                else {
                    if (theme === 'custom') {
                        css = this.getNodeParameter('customCss', i);
                    }
                    else {
                        css = themes[theme] || themes['default'] || '';
                    }
                }
                css += '\n' + katexCss;
                const env = {};
                const md = new markdown_it_1.default({
                    html: true,
                    breaks: true,
                    linkify: true,
                    highlight: (str, lang) => {
                        let highlighted = '';
                        if (lang && highlight_js_1.default.getLanguage(lang)) {
                            try {
                                highlighted = highlight_js_1.default.highlight(str, { language: lang, ignoreIllegals: true }).value;
                            }
                            catch (__) {
                                highlighted = md.utils.escapeHtml(str);
                            }
                        }
                        else {
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
                (0, markdown_utils_1.addFootnotes)(md);
                let rawHtml = md.render(markdownContent, env);
                if (env.footnotes && config.footnotes) {
                    rawHtml += (0, markdown_utils_1.renderFootnotes)(env.footnotes);
                }
                const htmlWithStyle = `<style>${css}</style><div class="wechat-content">${rawHtml}</div>`;
                const inlineHtml = (0, juice_1.default)(htmlWithStyle, {
                    inlinePseudoElements: true,
                    preserveImportant: true,
                });
                returnData.push({
                    json: {
                        html: inlineHtml,
                    },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.WeChatMarkdown = WeChatMarkdown;
//# sourceMappingURL=WeChatMarkdown.node.js.map