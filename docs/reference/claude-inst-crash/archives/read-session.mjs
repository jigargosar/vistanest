import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const dir = join(process.env.USERPROFILE, '.claude', 'projects', 'C--Users-jigar-projects-vistanest');
const sessionId = process.argv[2];
const grepTerm = process.argv[3];

if (grepTerm) {
  // Search across all sessions for a term
  const files = readdirSync(dir).filter(f => f.endsWith('.jsonl')).sort((a, b) => {
    return statSync(join(dir, b)).mtimeMs - statSync(join(dir, a)).mtimeMs;
  });
  for (const f of files.slice(0, 15)) {
    const lines = readFileSync(join(dir, f), 'utf8').split('\n').filter(Boolean);
    let found = false;
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'human' || obj.type === 'assistant') {
          const c = obj.message?.content;
          let text = '';
          if (typeof c === 'string') text = c;
          else if (Array.isArray(c)) c.forEach(x => { if (x.type === 'text') text += x.text; });
          if (text.includes(grepTerm)) {
            if (!found) { console.log('\n=== ' + f.replace('.jsonl','').slice(0,8) + ' ==='); found = true; }
            const prefix = obj.type === 'human' ? 'USER' : 'ASST';
            const idx = text.indexOf(grepTerm);
            const snippet = text.slice(Math.max(0, idx - 100), idx + grepTerm.length + 200);
            console.log(prefix + ': ...' + snippet.replace(/\n/g, ' ').slice(0, 400) + '...');
          }
        }
      } catch {}
    }
  }
  process.exit(0);
}

if (!sessionId) {
  // List all sessions with first user message
  const files = readdirSync(dir).filter(f => f.endsWith('.jsonl')).sort((a, b) => {
    return statSync(join(dir, b)).mtimeMs - statSync(join(dir, a)).mtimeMs;
  });
  for (const f of files.slice(0, 15)) {
    const lines = readFileSync(join(dir, f), 'utf8').split('\n').filter(Boolean);
    let firstUser = '';
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'human') {
          const c = obj.message?.content;
          if (typeof c === 'string') { firstUser = c.slice(0, 120); break; }
          else if (Array.isArray(c)) {
            for (const x of c) {
              if (x.type === 'text' && x.text.trim()) { firstUser = x.text.slice(0, 120); break; }
            }
            if (firstUser) break;
          }
        }
      } catch {}
    }
    const stat = statSync(join(dir, f));
    const size = (stat.size / 1024).toFixed(0) + 'KB';
    console.log(f.replace('.jsonl','').slice(0,8) + '  ' + new Date(stat.mtimeMs).toLocaleString() + '  ' + size.padStart(6) + '  ' + firstUser);
  }
  process.exit(0);
}

const file = join(dir, sessionId + '.jsonl');

const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
const msgs = [];

for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'human' || obj.type === 'assistant') {
      const c = obj.message?.content;
      let text = '';
      if (typeof c === 'string') text = c.slice(0, 500);
      else if (Array.isArray(c)) {
        for (const x of c) {
          if (x.type === 'text') text += x.text.slice(0, 500) + ' ';
        }
      }
      if (text.trim()) {
        msgs.push((obj.type === 'human' ? 'USER' : 'ASST') + ': ' + text.trim());
      }
    }
  } catch {}
}

// Print last 40 messages
msgs.slice(-40).forEach(m => console.log(m));
console.log('\n--- Total messages:', msgs.length, '---');
