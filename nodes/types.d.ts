declare module 'markdown-it' {
    export default class MarkdownIt {
        constructor(options?: any);
        render(src: string, env?: any): string;
        use(plugin: any, ...params: any[]): MarkdownIt;
        utils: {
            escapeHtml(str: string): string;
        };
        renderer: {
            rules: {
                [key: string]: (tokens: any[], idx: number, options: any, env: any, self: any) => string;
            };
        };
    }
}

declare module 'markdown-it/lib/token' {
    export default class Token {
        type: string;
        tag: string;
        attrs: [string, string][];
        map: [number, number] | null;
        nesting: number;
        level: number;
        children: Token[] | null;
        content: string;
        markup: string;
        info: string;
        meta: any;
        block: boolean;
        hidden: boolean;

        attrIndex(name: string): number;
        attrPush(attrData: [string, string]): void;
        attrSet(name: string, value: string): void;
        attrGet(name: string): string | null;
        attrJoin(name: string, value: string): void;
    }
}

declare module 'highlight.js' {
    export function getLanguage(name: string): any;
    export function highlight(code: string, options: any): { value: string };
}

declare module 'juice' {
    export default function juice(html: string, options?: any): string;
}

declare module 'markdown-it-katex';
