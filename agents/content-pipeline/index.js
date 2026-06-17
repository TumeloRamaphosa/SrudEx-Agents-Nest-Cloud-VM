/**
 * StudEx Content Pipeline Agent
 * Polls War Room approvals queue — executes approved content jobs
 * Integrates Higgsfield for video generation
 */
const WAR_ROOM_URL = process.env.WAR_ROOM_URL || 'http://war-room:5000';
const HIGGSFIELD_KEY = process.env.HIGGSFIELD_API_KEY;
const POLL_INTERVAL = 5 * 60 * 1000; // 5 min

async function pollApprovals() {
  try {
    const res = await fetch(`${WAR_ROOM_URL}/api/content?status=approved`);
    const items = await res.json();
    if (items.length === 0) return;

    console.log(`[content-pipeline] ${items.length} approved items ready`);
    for (const item of items) {
      console.log(`[content-pipeline] Processing: ${item.title} (${item.platform})`);
      // Mark as processing
      await fetch(`${WAR_ROOM_URL}/api/content/${item.id}/process`, { method: 'POST' });
      // TODO: dispatch to Higgsfield / platform APIs
    }
  } catch (e) {
    console.error('[content-pipeline] Error:', e.message);
  }
}

console.log('[content-pipeline] Agent started');
pollApprovals();
setInterval(pollApprovals, POLL_INTERVAL);
