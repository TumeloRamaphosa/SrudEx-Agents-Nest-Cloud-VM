/**
 * StudEx Approval Bot
 * Listens for Discord/Slack webhooks — routes approvals to War Room
 * RULE: NEVER auto-post. Only records approval, does not publish.
 */
const http = require('http');
const { warRoomPost, createAgentLogger } = require('../shared/api-client');

const log = createAgentLogger('approval-bot');

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

        await warRoomPost(`/api/content/${content_id}/${action}`, {
          approved_by,
          timestamp: new Date().toISOString(),
        });

        log.info(`${action} recorded for content ${content_id} by ${approved_by}`);
        res.writeHead(200); res.end('OK');
      } catch (e) {
        log.error('Request processing failed', e);
        res.writeHead(500); res.end('Error');
      }
    });
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(3002, () => log.info('Listening on :3002'));
