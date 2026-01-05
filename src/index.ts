import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { z } from "zod";
import { getGitHubContributions } from "./github/api.js";
import { generateAppHtml } from "./app/template.js";

type Bindings = {
	GITHUB_TOKEN?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper function to get API base URL from request headers
function getApiBaseUrl(c: Context): string {
	const host = c.req.header("x-forwarded-host") || c.req.header("host");
	const forwardedProto = c.req.header("x-forwarded-proto");

	if (host) {
		const isLocalhost =
			host.startsWith("localhost") || host.startsWith("127.0.0.1");
		const protocol = forwardedProto || (isLocalhost ? "http" : "https");
		return `${protocol}://${host}`;
	}

	return new URL(c.req.url).origin;
}

// Enable CORS for all routes
app.use("*", cors());

// Home page - serve the app HTML
app.get("/", (c) => {
	const apiBaseUrl = getApiBaseUrl(c);
	const html = generateAppHtml({ apiBaseUrl });
	return c.html(html);
});

// API endpoint for fetching contributions
app.get("/api/contributions/:username", async (c) => {
	const username = c.req.param("username");
	const token = c.env.GITHUB_TOKEN;

	const data = await getGitHubContributions(username, token);
	return c.json(data);
});

// MCP endpoint using @hono/mcp StreamableHTTPTransport
app.all("/mcp", async (c) => {
	const apiBaseUrl = getApiBaseUrl(c);

	// Create MCP server for each request
	const mcpServer = new McpServer({
		name: "github-contributions-mcp",
		version: "0.0.1",
	});

	// Register the github_contributions tool
	mcpServer.tool(
		"github_contributions",
		"Display an interactive GitHub contributions widget that shows a contribution heatmap, statistics, and user profile. Returns an MCP App HTML component.",
		{
			username: z
				.string()
				.optional()
				.describe(
					"GitHub username to fetch contributions for. If not provided, an input field will be shown in the UI.",
				),
		},
		async ({ username }) => {
			const html = generateAppHtml({
				initialUsername: username,
				apiBaseUrl,
			});

			return {
				content: [
					{
						type: "resource" as const,
						resource: {
							uri: "app://github-contributions",
							mimeType: "text/html",
							text: html,
						},
					},
				],
			};
		},
	);

	const transport = new StreamableHTTPTransport();
	await mcpServer.connect(transport);
	return transport.handleRequest(c);
});

// Health check endpoint
app.get("/health", (c) => {
	return c.json({
		status: "ok",
	});
});

export default app;
