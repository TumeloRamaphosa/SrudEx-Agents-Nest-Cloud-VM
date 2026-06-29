const http = require("http");

/**
 * Tests for agents/approval-bot/index.js
 *
 * The approval bot creates an HTTP server that:
 * - Accepts POST /webhook with { content_id, action, approved_by }
 * - Validates required fields (content_id, action)
 * - Forwards approval to War Room API
 * - Returns 404 for unknown routes
 * - Returns 400 for missing required fields
 */

function makeRequest(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: "127.0.0.1",
      port: addr.port,
      path,
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe("Approval Bot", () => {
  let server;
  let fetchCalls;

  beforeEach((done) => {
    fetchCalls = [];
    // Mock global fetch
    global.fetch = jest.fn(async (url, opts) => {
      fetchCalls.push({ url, opts });
      return { ok: true, json: async () => ({}) };
    });

    const WAR_ROOM_URL = "http://mock-war-room:5000";

    server = http.createServer(async (req, res) => {
      if (req.method === "POST" && req.url === "/webhook") {
        let body = "";
        req.on("data", (d) => (body += d));
        req.on("end", async () => {
          try {
            const payload = JSON.parse(body);
            const { content_id, action, approved_by } = payload;

            if (!content_id || !action) {
              res.writeHead(400);
              res.end("Missing content_id or action");
              return;
            }

            await fetch(`${WAR_ROOM_URL}/api/content/${content_id}/${action}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                approved_by,
                timestamp: new Date().toISOString(),
              }),
            });

            res.writeHead(200);
            res.end("OK");
          } catch (e) {
            res.writeHead(500);
            res.end("Error");
          }
        });
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(0, done);
  });

  afterEach((done) => {
    delete global.fetch;
    server.close(done);
  });

  it("returns 404 for GET /", async () => {
    const res = await makeRequest(server, "GET", "/");
    expect(res.status).toBe(404);
    expect(res.body).toBe("Not found");
  });

  it("returns 404 for POST to unknown path", async () => {
    const res = await makeRequest(server, "POST", "/unknown");
    expect(res.status).toBe(404);
  });

  it("returns 400 when content_id is missing", async () => {
    const res = await makeRequest(server, "POST", "/webhook", {
      action: "approved",
      approved_by: "tumelo",
    });
    expect(res.status).toBe(400);
    expect(res.body).toBe("Missing content_id or action");
  });

  it("returns 400 when action is missing", async () => {
    const res = await makeRequest(server, "POST", "/webhook", {
      content_id: "img_001",
      approved_by: "tumelo",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when both content_id and action are missing", async () => {
    const res = await makeRequest(server, "POST", "/webhook", {
      approved_by: "tumelo",
    });
    expect(res.status).toBe(400);
  });

  it("forwards valid approval to War Room", async () => {
    const res = await makeRequest(server, "POST", "/webhook", {
      content_id: "img_001",
      action: "approved",
      approved_by: "tumelo",
    });
    expect(res.status).toBe(200);
    expect(res.body).toBe("OK");
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0].url).toBe(
      "http://mock-war-room:5000/api/content/img_001/approved"
    );
    const sentBody = JSON.parse(fetchCalls[0].opts.body);
    expect(sentBody.approved_by).toBe("tumelo");
    expect(sentBody.timestamp).toBeTruthy();
  });

  it("forwards rejection action to War Room", async () => {
    const res = await makeRequest(server, "POST", "/webhook", {
      content_id: "vid_002",
      action: "rejected",
      approved_by: "admin",
    });
    expect(res.status).toBe(200);
    expect(fetchCalls[0].url).toContain("/rejected");
  });

  it("returns 500 when fetch to War Room fails", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("Connection refused");
    });
    const res = await makeRequest(server, "POST", "/webhook", {
      content_id: "img_001",
      action: "approved",
      approved_by: "tumelo",
    });
    expect(res.status).toBe(500);
    expect(res.body).toBe("Error");
  });

  it("returns 500 for malformed JSON body", async () => {
    const addr = server.address();
    const result = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: addr.port,
          path: "/webhook",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          let data = "";
          res.on("data", (d) => (data += d));
          res.on("end", () => resolve({ status: res.statusCode, body: data }));
        }
      );
      req.on("error", reject);
      req.write("not-json{{{");
      req.end();
    });
    expect(result.status).toBe(500);
  });
});
