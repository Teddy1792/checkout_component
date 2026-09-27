import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const VALID_BOOK_IDS = new Set([
  "civilwarland-in-bad-decline",
  "americanah",
  "tales-from-earthsea",
]);

function sendJson(
  response: ServerResponse,
  status: number,
  payload: Record<string, unknown>,
) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 16_384) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(buffer);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function checkoutHandler(
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  if (requestUrl.pathname !== "/api/checkout") {
    next();
    return;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    sendJson(response, 415, { error: "Expected a JSON request." });
    return;
  }

  void readJsonBody(request)
    .then((body: unknown) => {
      if (
        typeof body !== "object" ||
        body === null ||
        !("bookIds" in body) ||
        !Array.isArray(body.bookIds) ||
        body.bookIds.length < 1 ||
        body.bookIds.length > 4 ||
        new Set(body.bookIds).size !== body.bookIds.length ||
        !body.bookIds.every(
          (id) => typeof id === "string" && VALID_BOOK_IDS.has(id),
        )
      ) {
        sendJson(response, 400, { error: "Your book selection is invalid." });
        return;
      }

      const estimatedShipDate = new Date();
      estimatedShipDate.setDate(estimatedShipDate.getDate() + 3);

      // Keep the mock pending long enough to exercise the real loading UI.
      setTimeout(() => {
        if (response.destroyed || response.writableEnded) return;

        if (requestUrl.searchParams.get("simulateError") === "1") {
          sendJson(response, 500, {
            error: "We couldn’t place your order. No charge was made—please try again.",
          });
          return;
        }

        sendJson(response, 200, {
          orderId: `BOTM-${randomUUID().slice(0, 8).toUpperCase()}`,
          estimatedShipDate: estimatedShipDate.toISOString().slice(0, 10),
        });
      }, 2_000);
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error && error.message === "PAYLOAD_TOO_LARGE"
          ? "Request is too large."
          : "We couldn't read that request.";
      sendJson(response, 400, { error: message });
    });
}

function mockCheckoutApi(): Plugin {
  const register = (middlewares: {
    use: (handler: typeof checkoutHandler) => void;
  }) => middlewares.use(checkoutHandler);

  return {
    name: "mock-checkout-api",
    configureServer(server) {
      register(server.middlewares);
    },
    configurePreviewServer(server) {
      register(server.middlewares);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mockCheckoutApi()],
});
