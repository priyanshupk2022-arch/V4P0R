import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function syncHashes() {
  const statePath = path.join(ROOT, 'orchestration', 'state.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  let updatedCount = 0;

  for (const [id, entry] of Object.entries(state.nodes)) {
    if (entry.status === 'PASS' && entry.evidence) {
      const fullEvPath = path.resolve(ROOT, entry.evidence);
      if (fs.existsSync(fullEvPath)) {
        const diskHash = crypto.createHash('sha256').update(fs.readFileSync(fullEvPath)).digest('hex');
        if (entry.evidence_hash !== diskHash) {
          entry.evidence_hash = diskHash;
          updatedCount++;
        }
      }
    }
  }

  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
  console.log(`Synced evidence hashes for ${updatedCount} nodes in orchestration/state.json.`);
}

syncHashes();
