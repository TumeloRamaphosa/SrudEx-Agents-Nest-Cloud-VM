/**
 * StudEx Shopify Agent
 * Runs every hour — checks orders, inventory, flags issues
 * Part of StudEx Agents Nest | robusca-brain
 */
const { createAgentLogger } = require('../shared/api-client');

const log = createAgentLogger('shopify-agent');
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'studexmeat.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function checkOrders() {
  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json?financial_status=paid&fulfillment_status=unfulfilled&limit=50`,
    { headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN } }
  );
  const { orders } = await res.json();
  log.info(`${orders.length} unfulfilled paid orders`);

  const oldest = orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
  const highest = orders.sort((a, b) => parseFloat(b.total_price) - parseFloat(a.total_price))[0];

  if (oldest) log.info(`OLDEST: #${oldest.order_number} (${oldest.created_at.slice(0,10)})`);
  if (highest) log.info(`HIGHEST VALUE: #${highest.order_number} R${highest.total_price}`);

  return { total: orders.length, oldest, highest };
}

async function run() {
  log.info(`Starting check at ${new Date().toISOString()}`);
  try {
    const data = await checkOrders();
    log.info(`Done: ${JSON.stringify(data, null, 2)}`);
  } catch (e) {
    log.error('Check failed', e);
  }
}

// Run immediately then every hour
run();
setInterval(run, 60 * 60 * 1000);
