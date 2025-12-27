import type { GitHubContributionsInput } from "./tools.js";
import { generateAppHtml } from "../app/template.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface HandleToolOptions {
	input: GitHubContributionsInput;
	apiBaseUrl?: string;
}

export function handleGitHubContributionsTool(
	options: HandleToolOptions,
): CallToolResult {
	const { input, apiBaseUrl } = options;
	const html = generateAppHtml({
		initialUsername: input.username,
		apiBaseUrl,
	});

	return {
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
	};
}
