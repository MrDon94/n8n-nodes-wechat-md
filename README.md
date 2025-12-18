# n8n-nodes-wechat-md

This is an n8n community node that allows you to convert Markdown to WeChat Official Account compatible HTML. It includes features like syntax highlighting, math formula support, and customizable themes.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n documentation.

1.  Go to **Settings > Community Nodes**.
2.  Select **Install**.
3.  Enter `n8n-nodes-wechat-md` in the **npm Package Name** field.
4.  Agree to the risks and select **Install**.

## Usage

This node converts Markdown input into HTML with inline styles, ready to be pasted into the WeChat Official Account editor or pushed via API.

### Features
*   **Markdown to HTML**: Standard Markdown support.
*   **Syntax Highlighting**: Supports multiple languages with `highlight.js`.
*   **Math Support**: Renders LaTeX formulas using `KaTeX`.
*   **Themes**: Built-in themes (Default Green, Orange, Blue) and Custom CSS support.
*   **WeChat Optimizations**:
    *   Inline CSS styles (essential for WeChat).
    *   Converts external links to footnotes (WeChat restriction).
    *   Mac-style code block window controls.

### Configuration

The node provides individual configuration options in the UI:

| Option | Description | Default |
| --- | --- | --- |
| **Theme** | Color theme: Default (Green), Orange, Blue, or Custom | `default` |
| **Font Family** | Font family for the content | System fonts |
| **Font Size** | Font size (e.g., `16px`, `1em`) | `16px` |
| **Custom Color** | Primary color (only when Theme is Custom) | `#000000` |
| **Block Style** | Code block style: Default or Mac (with window controls) | `default` |
| **Line Numbers** | Show line numbers in code blocks | `false` |
| **Text Align** | Text alignment: Left or Justify | `left` |
| **Text Indent** | Paragraph indentation (e.g., `2em`) | `0em` |
| **Code Theme** | Syntax highlighting theme: GitHub, GitHub Dark, Monokai, Dracula | `github-dark` |
| **Footnotes** | Convert external links to footnotes | `false` |
| **Custom CSS** | Additional CSS (only when Theme is Custom) | - |

### Development

Run the test script to generate sample output:

```bash
npx ts-node --transpile-only test-run.ts
```

This reads `test.md` and generates `test.html` in the project root.

## License

MIT License

Copyright (c) 2025 MrDon94

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

