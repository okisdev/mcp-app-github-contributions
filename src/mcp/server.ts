import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
	toolDefinition,
	TOOL_NAME,
	GitHubContributionsInputSchema,
} from "./tools.js";
import { handleGitHubContributionsTool } from "./handlers.js";

export function createMCPServer(): Server {
	const server = new Server(
		{
			name: "github-contributions-mcp",
			version: "0.0.1",
		},
		{
			capabilities: {
				tools: {},
			},
		},
	);

	// Handle tools/list request
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: [toolDefinition],
		};
	});

	// Handle tools/call request
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		if (name === TOOL_NAME) {
			const parsed = GitHubContributionsInputSchema.safeParse(args);

			if (!parsed.success) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Invalid arguments: ${parsed.error.message}`,
						},
					],
					isError: true,
				};
			}

			return handleGitHubContributionsTool({ input: parsed.data });
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `Unknown tool: ${name}`,
				},
			],
			isError: true,
		};
	});

	return server;
}

export async function runStdioServer(): Promise<void> {
	const server = createMCPServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
