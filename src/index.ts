import { serve } from "@hono/node-server";
import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { createMCPServer } from "./mcp/server.js";
import { getGitHubContributions } from "./github/api.js";
import { generateAppHtml } from "./app/template.js";

const app = new Hono();

// Helper function to get API base URL from request headers
function getApiBaseUrl(c: Context): string {
	const host = c.req.header("x-forwarded-host") || c.req.header("host");
	const forwardedProto = c.req.header("x-forwarded-proto");

	if (host) {
		// Use x-forwarded-proto if available (production behind proxy)
		// Otherwise, detect if it's localhost/local dev and use http
		const isLocalhost =
			host.startsWith("localhost") || host.startsWith("127.0.0.1");
		const protocol = forwardedProto || (isLocalhost ? "http" : "https");
		return `${protocol}://${host}`;
	}

	// Fallback to request URL origin
	return new URL(c.req.url).origin;
}

// Enable CORS for all routes
app.use("*", cors());

// Store active SSE connections
interface SSEConnection {
	id: string;
	send: (data: string) => void;
	close: () => void;
}

const connections = new Map<string, SSEConnection>();
const mcpServers = new Map<string, ReturnType<typeof createMCPServer>>();

// Generate unique connection ID
function generateConnectionId(): string {
	return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Home page - serve the app HTML
app.get("/", (c) => {
	const apiBaseUrl = getApiBaseUrl(c);
	const html = generateAppHtml({ apiBaseUrl });
	return c.html(html);
});

// API endpoint for fetching contributions
app.get("/api/contributions/:username", async (c) => {
	const username = c.req.param("username");
	const token = process.env.GITHUB_TOKEN;

	const data = await getGitHubContributions(username, token);
	return c.json(data);
});

// SSE endpoint for MCP
app.get("/sse", async (c) => {
	const connectionId = generateConnectionId();

	return streamSSE(c, async (stream) => {
		// Create MCP server for this connection
		const mcpServer = createMCPServer();
		mcpServers.set(connectionId, mcpServer);

		// Send initial connection event with endpoint URL
		const baseUrl = new URL(c.req.url).origin;
		await stream.writeSSE({
			event: "endpoint",
			data: `${baseUrl}/message?connectionId=${connectionId}`,
		});

		// Store connection
		const connection: SSEConnection = {
			id: connectionId,
			send: async (data: string) => {
				await stream.writeSSE({
					event: "message",
					data,
				});
			},
			close: () => {
				connections.delete(connectionId);
				mcpServers.delete(connectionId);
			},
		};

		connections.set(connectionId, connection);

		// Keep connection alive with heartbeat
		const heartbeatInterval = setInterval(async () => {
			try {
				await stream.writeSSE({
					event: "ping",
					data: "",
				});
			} catch {
				clearInterval(heartbeatInterval);
			}
		}, 30000);

		// Handle stream close
		stream.onAbort(() => {
			clearInterval(heartbeatInterval);
			connection.close();
		});

		// Keep the stream open
		await new Promise<void>(() => {
			// Stream stays open until aborted
		});
	});
});

// Message endpoint for MCP
app.post("/message", async (c) => {
	const connectionId = c.req.query("connectionId");

	if (!connectionId) {
		return c.json({ error: "Missing connectionId" }, 400);
	}

	const connection = connections.get(connectionId);
	const mcpServer = mcpServers.get(connectionId);

	if (!connection || !mcpServer) {
		return c.json({ error: "Connection not found" }, 404);
	}

	try {
		const body = await c.req.json();
		const apiBaseUrl = getApiBaseUrl(c);

		// Process the MCP message
		const response = await processMessage(mcpServer, body, apiBaseUrl);

		// Send response via SSE
		connection.send(JSON.stringify(response));

		return c.json({ success: true });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return c.json({ error: errorMessage }, 500);
	}
});

// Process MCP messages
async function processMessage(
	_server: ReturnType<typeof createMCPServer>,
	message: Record<string, unknown>,
	apiBaseUrl: string,
): Promise<Record<string, unknown>> {
	const method = message.method as string;
	const id = message.id as string | number | undefined;
	const params = (message.params || {}) as Record<string, unknown>;

	if (method === "initialize") {
		return {
			jsonrpc: "2.0",
			id,
			result: {
				protocolVersion: "2024-11-05",
				capabilities: {
					tools: {},
				},
				serverInfo: {
					name: "github-contributions-mcp",
					version: "0.0.1",
				},
			},
		};
	}

	if (method === "notifications/initialized") {
		// This is a notification, no response needed
		return {
			jsonrpc: "2.0",
			id: null,
			result: null,
		};
	}

	if (method === "tools/list") {
		return {
			jsonrpc: "2.0",
			id,
			result: {
				tools: [
					{
						name: "github_contributions",
						description:
							"Display an interactive GitHub contributions widget that shows a contribution heatmap, statistics, and user profile. Returns an MCP App HTML component.",
						inputSchema: {
							type: "object",
							properties: {
								username: {
									type: "string",
									description:
										"GitHub username to fetch contributions for. If not provided, an input field will be shown in the UI.",
								},
							},
							required: [],
						},
					},
				],
			},
		};
	}

	if (method === "tools/call") {
		const toolName = params.name as string;
		const toolArgs = (params.arguments || {}) as Record<string, unknown>;

		if (toolName === "github_contributions") {
			const username = toolArgs.username as string | undefined;
			const html = generateAppHtml({
				initialUsername: username,
				apiBaseUrl,
			});

			return {
				jsonrpc: "2.0",
				id,
				result: {
					content: [
						{
							type: "resource",
							resource: {
								uri: "app://github-contributions",
								mimeType: "text/html",
								text: html,
							},
						},
					],
				},
			};
		}

		return {
			jsonrpc: "2.0",
			id,
			error: {
				code: -32601,
				message: `Unknown tool: ${toolName}`,
			},
		};
	}

	return {
		jsonrpc: "2.0",
		id,
		error: {
			code: -32601,
			message: `Method not found: ${method}`,
		},
	};
}

// Health check endpoint
app.get("/health", (c) => {
	return c.json({
		status: "ok",
		connections: connections.size,
	});
});

// Start server
const PORT = parseInt(process.env.PORT || "3001", 10);

console.log(`Starting GitHub Contributions MCP Server...`);
console.log(`Server running at http://localhost:${PORT}`);
console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
console.log(
	`API endpoint: http://localhost:${PORT}/api/contributions/:username`,
);

serve({
	fetch: app.fetch,
	port: PORT,
});

export default app;
