export interface IWeChatMarkdownConfig {
    theme?: 'default' | 'orange' | 'blue' | 'custom';
    fontFamily?: string;
    fontSize?: string;
    primaryColor?: string;
    customColor?: string;
    blockStyle?: 'default' | 'mac';
    lineNumbers?: boolean;
    textAlign?: 'left' | 'justify';
    textIndent?: string;
    codeTheme?: 'github' | 'github-dark' | 'monokai' | 'dracula';
    footnotes?: boolean;
}
export declare class StyleGenerator {
    private config;
    constructor(config: IWeChatMarkdownConfig);
    generateCss(): string;
    private getThemeColor;
    private getCodeBlockStyles;
    private isLightTheme;
    private getCodeThemeBackground;
}
