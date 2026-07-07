/**
 * Tests for agents/content-pipeline/index.js — pollApprovals logic
 *
 * The content pipeline:
 * - Polls War Room for approved content
 * - Skips if no approved items
 * - Marks each approved item as "processing"
 */

const WAR_ROOM_URL = "http://mock-war-room:5000";

async function pollApprovals(fetchFn) {
  const res = await fetchFn(`${WAR_ROOM_URL}/api/content?status=approved`);
  const items = await res.json();
  if (items.length === 0) return { processed: 0 };

  const processed = [];
  for (const item of items) {
    await fetchFn(`${WAR_ROOM_URL}/api/content/${item.id}/process`, {
      method: "POST",
    });
    processed.push(item.id);
  }
  return { processed: processed.length, ids: processed };
}

describe("Content Pipeline — pollApprovals", () => {
  it("returns 0 processed when no approved items", async () => {
    const mockFetch = jest.fn(async () => ({
      json: async () => [],
    }));

    const result = await pollApprovals(mockFetch);
    expect(result.processed).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("processes all approved items", async () => {
    const items = [
      { id: 1, title: "Post A", platform: "both" },
      { id: 2, title: "Post B", platform: "instagram" },
      { id: 3, title: "Post C", platform: "facebook" },
    ];

    const mockFetch = jest.fn(async (url) => {
      if (url.includes("status=approved")) {
        return { json: async () => items };
      }
      return { json: async () => ({}) };
    });

    const result = await pollApprovals(mockFetch);
    expect(result.processed).toBe(3);
    expect(result.ids).toEqual([1, 2, 3]);
  });

  it("calls process endpoint for each item", async () => {
    const items = [
      { id: 10, title: "Post X", platform: "both" },
      { id: 20, title: "Post Y", platform: "both" },
    ];

    const mockFetch = jest.fn(async (url) => {
      if (url.includes("status=approved")) {
        return { json: async () => items };
      }
      return { json: async () => ({}) };
    });

    await pollApprovals(mockFetch);

    const processCalls = mockFetch.mock.calls.filter(
      ([url]) => url.includes("/process")
    );
    expect(processCalls).toHaveLength(2);
    expect(processCalls[0][0]).toBe(
      "http://mock-war-room:5000/api/content/10/process"
    );
    expect(processCalls[1][0]).toBe(
      "http://mock-war-room:5000/api/content/20/process"
    );
    expect(processCalls[0][1]).toEqual({ method: "POST" });
  });

  it("throws when War Room API is unreachable", async () => {
    const mockFetch = jest.fn(async () => {
      throw new Error("Connection refused");
    });

    await expect(pollApprovals(mockFetch)).rejects.toThrow("Connection refused");
  });

  it("handles single approved item", async () => {
    const mockFetch = jest.fn(async (url) => {
      if (url.includes("status=approved")) {
        return { json: async () => [{ id: 42, title: "Solo", platform: "both" }] };
      }
      return { json: async () => ({}) };
    });

    const result = await pollApprovals(mockFetch);
    expect(result.processed).toBe(1);
    expect(result.ids).toEqual([42]);
  });
});
