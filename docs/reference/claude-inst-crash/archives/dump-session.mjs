import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = join(process.env.USERPROFILE, '.claude', 'projects', 'C--Users-jigar-projects-vistanest');
const sessionId = process.argv[2];
if (!sessionId) { console.error('Usage: node dump-session.mjs <session-id>'); process.exit(1); }

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
          if (x.type === 'tool_use') text += '\n[tool_use: ' + x.name + ']\n';
          if (x.type === 'tool_result') text += '\n[tool_result]\n';
        }
      }
      if (text.trim()) {
        msgNum++;
        const role = obj.type === 'human' ? 'USER' : 'ASSISTANT';
        out.push('='.repeat(60));
        out.push('MSG #' + msgNum + ' [' + role + ']');
        out.push('='.repeat(60));
        out.push(text.trim());
        out.push('');
      }
    }
  } catch {}
}

const outFile = 'session-dump.txt';
writeFileSync(outFile, out.join('\n'), 'utf8');
console.log('Wrote ' + msgNum + ' messages to ' + outFile);
