import { WeChatMarkdown } from './nodes/WeChatMarkdown/WeChatMarkdown.node';
import { IExecuteFunctions } from 'n8n-workflow';
import * as fs from 'fs';
import * as path from 'path';

// Mock IExecuteFunctions
const mockExecuteFunctions = {
    getInputData: () => [{ json: {} }],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getNodeParameter: (name: string, _index: number) => {
        const params: Record<string, string | boolean> = {
            markdownContent: fs.readFileSync(path.join(__dirname, 'test.md'), 'utf8'),
            theme: 'default',// 'default', 'orange', 'blue', 'custom'
            fontFamily: 'sans-serif',
            fontSize: '16px',
            customColor: '#c24019ff',// Custom purple color
            blockStyle: 'mac',// 'mac' or 'default'
            lineNumbers: true,
            textAlign: 'justify',
            textIndent: '2em',
            codeTheme: 'github',// 'github', 'github-dark', 'monokai', 'dracula'
            footnotes: false,
        };
        return params[name];
    },
    continueOnFail: () => false,
} as unknown as IExecuteFunctions;

async function run() {
    const node = new WeChatMarkdown();
    try {
        const result = await node.execute.call(mockExecuteFunctions);
        const html = result[0][0].json.html as string;
        fs.writeFileSync(path.join(__dirname, 'test.html'), html);
        // eslint-disable-next-line no-console
        console.log('Successfully generated test.html');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error executing node:', error);
    }
}

run();
