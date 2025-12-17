"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFootnotes = addFootnotes;
exports.renderFootnotes = renderFootnotes;
function addFootnotes(md) {
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const href = token.attrGet('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
            if (!env.footnotes) {
                env.footnotes = [];
            }
            const footnoteId = env.footnotes.length + 1;
            env.footnotes.push({ id: footnoteId, url: href });
            token.meta = { footnoteId };
        }
        return defaultRender(tokens, idx, options, env, self);
    };
    const defaultClose = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
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
function renderFootnotes(footnotes) {
    if (!footnotes || footnotes.length === 0)
        return '';
    let html = '<div class="footnotes"><h3>References</h3><ol>';
    footnotes.forEach(note => {
        html += `<li>${note.url}</li>`;
    });
    html += '</ol></div>';
    return html;
}
//# sourceMappingURL=markdown-utils.js.map