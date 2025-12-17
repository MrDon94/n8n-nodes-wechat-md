import MarkdownIt from 'markdown-it';
export declare function addFootnotes(md: MarkdownIt): void;
export declare function renderFootnotes(footnotes: Array<{
    id: number;
    url: string;
}>): string;
