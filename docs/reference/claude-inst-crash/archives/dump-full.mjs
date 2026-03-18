import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = join(process.env.USERPROFILE, '.claude', 'projects', 'C--Users-jigar-projects-vistanest');
const sessionId = process.argv[2];
const startMsg = parseInt(process.argv[3] || '220', 10);
const endMsg = parseInt(process.argv[4] || '265', 10);

const file = join(dir, sessionId + '.jsonl');
const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);

const out = [];
let msgNum = 0;

for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'human' || obj.type === 'assistant') {
      const c = obj.message?.content;
      let text = '';
      if (typeof c === 'string') {
        text = c;
      } else if (Array.isArray(c)) {
        for (const x of c) {
          if (x.type === 'text') text += x.text;
          else if (x.type === 'tool_use') text += '\n[tool: ' + x.name + '(' + JSON.stringify(x.input || {}).slice(0, 200) + ')]\n';
          else if (x.type === 'tool_result') {
            const content = x.content;
            if (typeof content === 'string') text += '\n[result: ' + content.slice(0, 200) + ']\n';
            else if (Array.isArray(content)) {
              for (const r of content) {
                if (r.type === 'text') text += '\n[result: ' + r.text.slice(0, 200) + ']\n';
              }
            }
          }
        }
      }
      if (text.trim()) {
        msgNum++;
        if (msgNum < startMsg || msgNum > endMsg) continue;
        const role = obj.type === 'human' ? 'USER' : 'ASSISTANT';
        out.push('');
        out.push('='.repeat(60));
        out.push('MSG #' + msgNum + ' [' + role + ']');
        out.push('='.repeat(60));
        out.push(text.trim());
      }
    }
  } catch {}
}

const outFile = 'session-range.txt';
writeFileSync(outFile, out.join('\n'), 'utf8');
console.log('Wrote msgs ' + startMsg + '-' + endMsg + ' to ' + outFile + ' (' + out.length + ' lines)');
