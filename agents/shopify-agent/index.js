/**
 * StudEx Shopify Agent
 * Runs every hour — checks orders, inventory, flags issues
 * Part of StudEx Agents Nest | robusca-brain
 */
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'studexmeat.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const WAR_ROOM_URL = process.env.WAR_ROOM_URL || 'http://war-room:5000';

async function checkOrders() {
  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json?financial_status=paid&fulfillment_status=unfulfilled&limit=50`,
    { headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN } }
  );
  const { orders } = await res.json();
  console.log(`[shopify-agent] ${orders.length} unfulfilled paid orders`);

  // Flag oldest and highest value
  const oldest = orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
  const highest = orders.sort((a, b) => parseFloat(b.total_price) - parseFloat(a.total_price))[0];

  if (oldest) console.log(`[shopify-agent] OLDEST: #${oldest.order_number} (${oldest.created_at.slice(0,10)})`);
  if (highest) console.log(`[shopify-agent] HIGHEST VALUE: #${highest.order_number} R${highest.total_price}`);

  return { total: orders.length, oldest, highest };
}

async function run() {
  console.log('[shopify-agent] Starting check at', new Date().toISOString());
  try {
    const data = await checkOrders();
    console.log('[shopify-agent] Done:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[shopify-agent] Error:', e.message);
  }
}

// Run immediately then every hour
run();
setInterval(run, 60 * 60 * 1000);
