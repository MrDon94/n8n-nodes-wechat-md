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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        // Load themes (Legacy support)
        const themes: { [key: string]: string } = {};
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
            } catch {
                // console.error(`Failed to load theme ${key}:`, error);
            }
        }

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
                let configJsonStr = '{}';
                try {
                    configJsonStr = this.getNodeParameter('configJson', i) as string;
                } catch {
                    // Ignore if not present or invalid
                }

                let config: IWeChatMarkdownConfig = {};
                try {
                    config = JSON.parse(configJsonStr);
                } catch {
                    // console.warn('Invalid JSON config', e);
                }

                let css = '';

                // If config is provided, use StyleGenerator
                if (Object.keys(config).length > 0) {
                    const generator = new StyleGenerator(config);
                    css = generator.generateCss();

                    // Load Highlight.js CSS
                    const codeTheme = config.codeTheme || 'github';
                    const hljsThemePath = path.join(__dirname, '../../node_modules/highlight.js/styles', `${codeTheme}.css`);
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
                } else {
                    // Fallback to legacy theme logic
                    if (theme === 'custom') {
                        css = this.getNodeParameter('customCss', i) as string;
                    } else {
                        css = themes[theme] || themes['default'] || '';
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
