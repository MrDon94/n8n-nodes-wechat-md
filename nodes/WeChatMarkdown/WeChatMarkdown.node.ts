import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import juice from 'juice';
import * as fs from 'fs';
import * as path from 'path';
import { StyleGenerator, IWeChatMarkdownConfig } from './style-generator';
import { addFootnotes, renderFootnotes } from './markdown-utils';
import markdownItKatex from 'markdown-it-katex';

export class WeChatMarkdown implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'WeChat Markdown',
        name: 'weChatMarkdown',
        icon: 'file:wechat.svg',
        usableAsTool: true,
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
                displayName: 'Font Family',
                name: 'fontFamily',
                type: 'string',
                default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                description: 'The font family to use',
            },
            {
                displayName: 'Font Size',
                name: 'fontSize',
                type: 'string',
                default: '16px',
                description: 'The font size (e.g. 16px, 1em)',
            },
            {
                displayName: 'Custom Color',
                name: 'customColor',
                type: 'color',
                default: '#000000',
                description: 'Custom primary color',
                displayOptions: {
                    show: {
                        theme: [
                            'custom',
                        ],
                    },
                },
            },
            {
                displayName: 'Block Style',
                name: 'blockStyle',
                type: 'options',
                options: [
                    {
                        name: 'Default',
                        value: 'default',
                    },
                    {
                        name: 'Mac',
                        value: 'mac',
                    },
                ],
                default: 'default',
                description: 'The style of code blocks',
            },
            {
                displayName: 'Line Numbers',
                name: 'lineNumbers',
                type: 'boolean',
                default: false,
                description: 'Whether to show line numbers in code blocks',
            },
            {
                displayName: 'Text Align',
                name: 'textAlign',
                type: 'options',
                options: [
                    {
                        name: 'Left',
                        value: 'left',
                    },
                    {
                        name: 'Justify',
                        value: 'justify',
                    },
                ],
                default: 'left',
                description: 'Text alignment',
            },
            {
                displayName: 'Text Indent',
                name: 'textIndent',
                type: 'string',
                default: '0em',
                description: 'Text indentation (e.g. 2em)',
            },
            {
                displayName: 'Code Theme',
                name: 'codeTheme',
                type: 'options',
                options: [
                    {
                        name: 'GitHub',
                        value: 'github',
                    },
                    {
                        name: 'GitHub Dark',
                        value: 'github-dark',
                    },
                    {
                        name: 'Monokai',
                        value: 'monokai',
                    },
                    {
                        name: 'Dracula',
                        value: 'dracula',
                    },
                ],
                default: 'github-dark',
                description: 'The theme for code syntax highlighting',
            },
            {
                displayName: 'Footnotes',
                name: 'footnotes',
                type: 'boolean',
                default: false,
                description: 'Whether to enable footnotes support',
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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];



        // Load KaTeX CSS
        const katexThemePath = path.join(__dirname, 'katex.css');
        let katexCss = '';
        try {
            if (fs.existsSync(katexThemePath)) {
                katexCss = fs.readFileSync(katexThemePath, 'utf8');
            }
        } catch {
            // console.error('Failed to load katex theme:', error);
        }

        for (let i = 0; i < items.length; i++) {
            try {
                const markdownContent = this.getNodeParameter('markdownContent', i) as string;
                const theme = this.getNodeParameter('theme', i) as string;
                const fontFamily = this.getNodeParameter('fontFamily', i) as string;
                const fontSize = this.getNodeParameter('fontSize', i) as string;
                // customColor only exists when theme === 'custom', so get it conditionally with a fallback
                const customColor = theme === 'custom'
                    ? (this.getNodeParameter('customColor', i) as string)
                    : '#000000';
                const blockStyle = this.getNodeParameter('blockStyle', i) as 'default' | 'mac';
                const lineNumbers = this.getNodeParameter('lineNumbers', i) as boolean;
                const textAlign = this.getNodeParameter('textAlign', i) as 'left' | 'justify';
                const textIndent = this.getNodeParameter('textIndent', i) as string;
                const codeTheme = this.getNodeParameter('codeTheme', i) as 'github' | 'github-dark' | 'monokai' | 'dracula';
                const footnotes = this.getNodeParameter('footnotes', i) as boolean;

                const config: IWeChatMarkdownConfig = {
                    theme: theme as 'default' | 'orange' | 'blue' | 'custom',
                    fontFamily,
                    fontSize,
                    customColor,
                    blockStyle,
                    lineNumbers,
                    textAlign,
                    textIndent,
                    codeTheme,
                    footnotes,
                };

                let css = '';

                // Use StyleGenerator
                const generator = new StyleGenerator(config);
                css = generator.generateCss();

                // Load Highlight.js CSS
                // Map code theme to actual file paths
                const getHljsThemePath = (themeValue: string): string => {
                    const stylesDir = path.join(__dirname, '../../node_modules/highlight.js/styles');
                    if (themeValue === 'dracula') {
                        return path.join(stylesDir, 'base16/dracula.css');
                    }
                    if (themeValue === 'monokai') {
                        const monokaiPath = path.join(stylesDir, 'monokai.css');
                        if (fs.existsSync(monokaiPath)) {
                            return monokaiPath;
                        }
                        return path.join(stylesDir, 'monokai-sublime.css');
                    }
                    if (themeValue === 'github-dark') {
                        return path.join(stylesDir, 'github-dark.css');
                    }
                    return path.join(stylesDir, 'github.css');
                };

                const hljsThemePath = getHljsThemePath(config.codeTheme || 'github');
                try {
                    if (fs.existsSync(hljsThemePath)) {
                        css += '\n' + fs.readFileSync(hljsThemePath, 'utf8');
                    } else {
                        // Fallback to github.css if theme not found
                        const fallbackPath = path.join(__dirname, '../../node_modules/highlight.js/styles/github.css');
                        if (fs.existsSync(fallbackPath)) {
                            css += '\n' + fs.readFileSync(fallbackPath, 'utf8');
                        }
                    }
                } catch {
                    // console.warn('Failed to load highlight.js theme', e);
                }

                // Append Custom CSS if applicable
                if (theme === 'custom') {
                    try {
                        const customCss = this.getNodeParameter('customCss', i) as string;
                        if (customCss) {
                            css += '\n' + customCss;
                        }
                    } catch {
                        // Ignore
                    }
                }

                // Append KaTeX CSS
                css += '\n' + katexCss;

                // Prepare environment for footnotes
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const env: any = {};

                // Initialize MarkdownIt with per-item config
                const md = new MarkdownIt({
                    html: true,
                    breaks: true,
                    linkify: true,
                    highlight: (str: string, lang: string) => {
                        let highlighted = '';
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
                            } catch {
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

                // Use KaTeX
                md.use(markdownItKatex);

                // Add Footnotes support
                addFootnotes(md);

                // 1. Convert Markdown to HTML
                let rawHtml = md.render(markdownContent, env);

                // Append footnotes if any
                if (env.footnotes && config.footnotes) {
                    rawHtml += renderFootnotes(env.footnotes);
                }

                // 2. Inline CSS using juice
                const htmlWithStyle = `<style>${css}</style><div class="wechat-content">${rawHtml}</div>`;

                const inlineHtml = juice(htmlWithStyle, {
                    inlinePseudoElements: true,
                    preserveImportant: true,
                });

                returnData.push({
                    json: {
                        html: inlineHtml,
                    },
                });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: (error as Error).message,
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
