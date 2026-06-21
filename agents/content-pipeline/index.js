/**
 * StudEx Content Pipeline Agent
 * Polls War Room approvals queue — executes approved content jobs
 * Integrates Higgsfield for video generation
 */
const { warRoomGet, warRoomPost, createAgentLogger } = require('../shared/api-client');

const log = createAgentLogger('content-pipeline');
const HIGGSFIELD_KEY = process.env.HIGGSFIELD_API_KEY;
const POLL_INTERVAL = 5 * 60 * 1000; // 5 min

async function pollApprovals() {
  try {
    const items = await warRoomGet('/api/content?status=approved');
    if (items.length === 0) return;

    log.info(`${items.length} approved items ready`);
    for (const item of items) {
      log.info(`Processing: ${item.title} (${item.platform})`);
      await warRoomPost(`/api/content/${item.id}/process`, {});
      // TODO: dispatch to Higgsfield / platform APIs
    }
  } catch (e) {
    log.error('Poll failed', e);
  }
}

log.info('Agent started');
pollApprovals();
setInterval(pollApprovals, POLL_INTERVAL);
