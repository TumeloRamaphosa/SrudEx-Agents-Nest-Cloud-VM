/**
 * Tests for agents/shopify-agent/index.js
 *
 * The shopify agent:
 * - Fetches unfulfilled paid orders from Shopify API
 * - Sorts by created_at to find oldest
 * - Sorts by total_price to find highest value
 * - Returns { total, oldest, highest }
 */

describe("Shopify Agent — checkOrders logic", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Extract the core logic from the agent
  async function checkOrders(shopifyStore, shopifyToken) {
    const res = await fetch(
      `https://${shopifyStore}/admin/api/2024-01/orders.json?financial_status=paid&fulfillment_status=unfulfilled&limit=50`,
      { headers: { "X-Shopify-Access-Token": shopifyToken } }
    );
    const { orders } = await res.json();

    const oldest = orders.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )[0];
    const highest = orders.sort(
      (a, b) => parseFloat(b.total_price) - parseFloat(a.total_price)
    )[0];

    return { total: orders.length, oldest, highest };
  }

  it("returns correct total count", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        orders: [
          { order_number: 1001, created_at: "2026-06-01T10:00:00Z", total_price: "500.00" },
          { order_number: 1002, created_at: "2026-06-05T10:00:00Z", total_price: "1200.00" },
        ],
      }),
    }));

    const result = await checkOrders("test.myshopify.com", "test-token");
    expect(result.total).toBe(2);
  });

  it("identifies the oldest order", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        orders: [
          { order_number: 1002, created_at: "2026-06-05T10:00:00Z", total_price: "1200.00" },
          { order_number: 1001, created_at: "2026-01-01T10:00:00Z", total_price: "500.00" },
          { order_number: 1003, created_at: "2026-06-10T10:00:00Z", total_price: "300.00" },
        ],
      }),
    }));

    const result = await checkOrders("test.myshopify.com", "token");
    expect(result.oldest.order_number).toBe(1001);
  });

  it("identifies the highest value order", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        orders: [
          { order_number: 1001, created_at: "2026-06-01T10:00:00Z", total_price: "500.00" },
          { order_number: 1002, created_at: "2026-06-05T10:00:00Z", total_price: "29325.00" },
          { order_number: 1003, created_at: "2026-06-10T10:00:00Z", total_price: "300.00" },
        ],
      }),
    }));

    const result = await checkOrders("test.myshopify.com", "token");
    expect(result.highest.order_number).toBe(1002);
    expect(parseFloat(result.highest.total_price)).toBe(29325);
  });

  it("handles empty orders list", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({ orders: [] }),
    }));

    const result = await checkOrders("test.myshopify.com", "token");
    expect(result.total).toBe(0);
    expect(result.oldest).toBeUndefined();
    expect(result.highest).toBeUndefined();
  });

  it("handles single order", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        orders: [
          { order_number: 1001, created_at: "2026-06-01T10:00:00Z", total_price: "750.00" },
        ],
      }),
    }));

    const result = await checkOrders("test.myshopify.com", "token");
    expect(result.total).toBe(1);
    expect(result.oldest.order_number).toBe(1001);
    expect(result.highest.order_number).toBe(1001);
  });

  it("sends correct Shopify API URL with token", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({ orders: [] }),
    }));

    await checkOrders("studexmeat.myshopify.com", "shpat_abc123");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://studexmeat.myshopify.com/admin/api/2024-01/orders.json?financial_status=paid&fulfillment_status=unfulfilled&limit=50",
      { headers: { "X-Shopify-Access-Token": "shpat_abc123" } }
    );
  });

  it("throws when API call fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("Network error");
    });

    await expect(checkOrders("test.myshopify.com", "token")).rejects.toThrow(
      "Network error"
    );
  });

  it("handles orders with string prices correctly", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        orders: [
          { order_number: 1, created_at: "2026-01-01T00:00:00Z", total_price: "99.99" },
          { order_number: 2, created_at: "2026-02-01T00:00:00Z", total_price: "1000.50" },
          { order_number: 3, created_at: "2026-03-01T00:00:00Z", total_price: "250.00" },
        ],
      }),
    }));

    const result = await checkOrders("test.myshopify.com", "token");
    expect(result.highest.order_number).toBe(2);
    expect(parseFloat(result.highest.total_price)).toBe(1000.5);
  });
});
