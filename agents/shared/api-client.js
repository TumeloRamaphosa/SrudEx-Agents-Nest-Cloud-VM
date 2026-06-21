// Shared API client for War Room communication
const { WAR_ROOM_URL } = require('./config');

async function warRoomPost(path, data) {
  const res = await fetch(`${WAR_ROOM_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res;
}

async function warRoomGet(path) {
  const res = await fetch(`${WAR_ROOM_URL}${path}`);
  return res.json();
}

function createAgentLogger(agentName) {
  return {
    info: (msg) => console.log(`[${agentName}] ${msg}`),
    error: (msg, err) => console.error(`[${agentName}] Error:`, err?.message ?? msg),
  };
}

module.exports = { warRoomPost, warRoomGet, createAgentLogger, WAR_ROOM_URL };
