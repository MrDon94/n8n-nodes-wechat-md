import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token.mjs';

export function addFootnotes(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    md.renderer.rules.link_open = function (tokens: Token[], idx: number, options: any, env: any, self: any) {
        const token = tokens[idx];
        const href = token.attrGet('href');

        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
            // It's an external link
            if (!env.footnotes) {
                env.footnotes = [];
            }

            const footnoteId = env.footnotes.length + 1;
            env.footnotes.push({ id: footnoteId, url: href });

            // Add a reference number after the link text (this logic needs to be in link_close or handled carefully)
            // Actually, for WeChat, we usually want: [Link Text](URL) -> Link Text[1]
            // And then at the bottom: [1]: URL

            // We can attach the ID to the token to use in link_close
            token.meta = { footnoteId };
        }

        return defaultRender(tokens, idx, options, env, self);
    };

    const defaultClose = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    md.renderer.rules.link_close = function (tokens: Token[], idx: number, options: any, env: any, self: any) {

        // Better way: find the matching open token
        let openIdx = -1;
        for (let i = idx - 1; i >= 0; i--) {
            if (tokens[i].type === 'link_open') {
                openIdx = i;
                break;
            }
        }

        if (openIdx !== -1 && tokens[openIdx].meta && tokens[openIdx].meta.footnoteId) {
            const id = tokens[openIdx].meta.footnoteId;
            return `<sup class="footnote-ref">[${id}]</sup>` + defaultClose(tokens, idx, options, env, self);
        }

        return defaultClose(tokens, idx, options, env, self);
    };
}

export function renderFootnotes(footnotes: Array<{ id: number, url: string }>): string {
    if (!footnotes || footnotes.length === 0) return '';

    let html = '<div class="footnotes"><h3>References</h3><ol>';
    footnotes.forEach(note => {
        html += `<li>${note.url}</li>`;
    });
    html += '</ol></div>';
    return html;
}
