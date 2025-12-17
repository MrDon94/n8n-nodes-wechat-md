"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleGenerator = void 0;
class StyleGenerator {
    constructor(config) {
        this.config = config;
    }
    generateCss() {
        const { theme = 'default', fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontSize = '16px', primaryColor = '#009874', customColor, blockStyle = 'default', textAlign = 'left', textIndent = '0em', codeTheme = 'github-dark' } = this.config;
        const mainColor = theme === 'custom' && customColor ? customColor : this.getThemeColor(theme, primaryColor);
        let css = `
            .wechat-content {
                font-family: ${fontFamily};
                font-size: ${fontSize};
                color: #3f3f3f;
                line-height: 1.6;
                text-align: ${textAlign};
            }
            
            h1, h2, h3, h4, h5, h6 {
                margin-top: 1.5em;
                margin-bottom: 1em;
                font-weight: bold;
                color: #3f3f3f;
            }

            h1 {
                font-size: 1.6em;
                text-align: center;
                border-bottom: 2px solid ${mainColor};
                padding-bottom: 0.5em;
            }

            h2 {
                font-size: 1.4em;
                border-left: 4px solid ${mainColor};
                padding-left: 10px;
                margin-bottom: 20px;
            }

            h3 {
                font-size: 1.2em;
                color: ${mainColor};
                margin-bottom: 15px;
            }
            
            p {
                margin: 1em 0;
                text-indent: ${textIndent};
            }

            a {
                color: ${mainColor};
                text-decoration: none;
                border-bottom: 1px solid ${mainColor};
            }

            blockquote {
                margin: 1em 0;
                padding: 1em;
                background-color: #f8f8f8;
                border-left: 4px solid ${mainColor};
                color: #666;
            }

            ul, ol {
                margin: 1em 0;
                padding-left: 2em;
            }
            
            li {
                margin: 0.5em 0;
            }

            img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1em auto;
                border-radius: 4px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
            }

            th, td {
                border: 1px solid #dfe2e5;
                padding: 0.6em 1em;
            }

            th {
                background-color: #f8f8f8;
                font-weight: bold;
                color: ${mainColor};
            }
            
            /* Footnotes */
            .footnote-word {
                color: ${mainColor};
                font-weight: bold;
            }
            
            .footnote-ref {
                color: ${mainColor};
                margin-left: 2px;
                text-decoration: none;
                font-size: 0.8em;
            }
            
            .footnotes {
                margin-top: 2em;
                padding-top: 1em;
                border-top: 1px solid #eee;
                font-size: 0.9em;
                color: #666;
            }
        `;
        css += this.getCodeBlockStyles(blockStyle, codeTheme);
        return css;
    }
    getThemeColor(theme, defaultColor) {
        switch (theme) {
            case 'orange': return '#ff9800';
            case 'blue': return '#2196f3';
            case 'default': return '#009874';
            default: return defaultColor;
        }
    }
    getCodeBlockStyles(style, theme) {
        const themeBg = this.getCodeThemeBackground(theme);
        let css = `
            pre {
                margin: 1em 0;
                padding: 1em;
                border-radius: 4px;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                line-height: 1.5;
                position: relative;
            }
            
            code {
                font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
                font-size: 14px;
            }
        `;
        if (style === 'mac' && !this.config.lineNumbers) {
            css += `
                pre {
                    padding-top: 2.5em;
                    background-color: ${themeBg};
                }
                
                pre::before {
                    content: ' ';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 12px;
                    height: 12px;
                    background: #fc625d;
                    border-radius: 50%;
                    box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
                    z-index: 10;
                }
            `;
        }
        css += `
            p code, li code { 
                background-color: rgba(27, 31, 35, 0.05); 
                color: #d63200;
                padding: 2px 4px;
                border-radius: 2px;
            }
        `;
        if (this.config.lineNumbers) {
            css += `
                .code-with-line-numbers {
                    display: flex;
                    overflow: hidden;
                }
                
                .code-line-numbers {
                    text-align: right;
                    padding: 1em 0.5em 1em 1em;
                    border-right: 1px solid rgba(0,0,0,0.1);
                    color: rgba(0,0,0,0.3);
                    user-select: none;
                    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .code-content {
                    padding: 1em;
                    overflow-x: auto;
                    flex: 1;
                }
                
                .code-content pre {
                    margin: 0;
                    padding: 0;
                    background: transparent;
                    border-radius: 0;
                }
            `;
            if (style === 'mac') {
                const isLight = this.isLightTheme(theme);
                const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
                const textColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
                css += `
                    .code-with-line-numbers {
                        padding-top: 2.5em;
                        position: relative;
                        background-color: ${themeBg};
                        border-radius: 4px;
                    }
                    
                    .code-with-line-numbers::before {
                        content: ' ';
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        width: 12px;
                        height: 12px;
                        background: #fc625d;
                        border-radius: 50%;
                        box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
                        z-index: 10;
                    }
                    
                    .code-line-numbers {
                        border-right: 1px solid ${borderColor};
                        color: ${textColor};
                    }
                `;
            }
        }
        return css;
    }
    isLightTheme(theme) {
        return theme === 'github' || theme === 'github-light';
    }
    getCodeThemeBackground(theme) {
        switch (theme) {
            case 'github': return '#f8f8f8';
            case 'monokai': return '#272822';
            case 'dracula': return '#282a36';
            case 'github-dark':
            default: return '#0d1117';
        }
    }
}
exports.StyleGenerator = StyleGenerator;
//# sourceMappingURL=style-generator.js.map