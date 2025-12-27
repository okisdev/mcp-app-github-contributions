import type { GitHubContributionsInput } from "./tools.js";
import { generateAppHtml } from "../app/template.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function handleGitHubContributionsTool(
	input: GitHubContributionsInput,
): CallToolResult {
	const html = generateAppHtml(input.username);

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
