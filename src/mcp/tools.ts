import { z } from 'zod'

export const TOOL_NAME = 'github_contributions'

export const GitHubContributionsInputSchema = z.object({
  username: z
    .string()
    .optional()
    .describe(
      'GitHub username to fetch contributions for. If not provided, an input field will be shown in the UI.'
    ),
})

export type GitHubContributionsInput = z.infer<typeof GitHubContributionsInputSchema>

export const toolDefinition = {
  name: TOOL_NAME,
  description:
    'Display an interactive GitHub contributions widget that shows a contribution heatmap, statistics, and user profile. Returns an MCP App HTML component.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      username: {
        type: 'string',
        description:
          'GitHub username to fetch contributions for. If not provided, an input field will be shown in the UI.',
      },
    },
    required: [] as string[],
  },
}
