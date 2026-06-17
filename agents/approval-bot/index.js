/**
 * StudEx Approval Bot
 * Listens for Discord/Slack webhooks — routes approvals to War Room
 * RULE: NEVER auto-post. Only records approval, does not publish.
 */
const http = require('http');
const WAR_ROOM_URL = process.env.WAR_ROOM_URL || 'http://war-room:5000';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { content_id, action, approved_by } = payload;

        if (!content_id || !action) {
          res.writeHead(400); res.end('Missing content_id or action'); return;
        }

        // Record in War Room
        await fetch(`${WAR_ROOM_URL}/api/content/${content_id}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved_by, timestamp: new Date().toISOString() })
        });

        console.log(`[approval-bot] ${action} recorded for content ${content_id} by ${approved_by}`);
        res.writeHead(200); res.end('OK');
      } catch (e) {
        console.error('[approval-bot] Error:', e.message);
        res.writeHead(500); res.end('Error');
      }
    });
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(3002, () => console.log('[approval-bot] Listening on :3002'));
