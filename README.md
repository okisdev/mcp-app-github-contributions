# GitHub Contributions MCP Server

A Model Context Protocol (MCP) server that displays interactive GitHub contribution heatmaps, statistics, and user profiles. Built with [Hono](https://hono.dev) and deployed on [Cloudflare Workers](https://workers.cloudflare.com).

## Features

- Interactive contribution heatmap (similar to GitHub profile)
- Contribution statistics (total, streaks, daily average)
- User profile display with followers and repos count
- Dark/Light theme support
- Year-by-year contribution breakdown
- Responsive design

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Server runs at `http://localhost:8787`

## Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Set GitHub token (optional, for higher API rate limits)
npx wrangler secret put GITHUB_TOKEN
```

## MCP Client Configuration

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "github-contributions": {
      "url": "https://your-worker.workers.dev/mcp"
    }
  }
}
```

With authentication:

```json
{
  "mcpServers": {
    "github-contributions": {
      "url": "https://your-worker.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer ${env:MCP_AUTH_TOKEN}"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "github-contributions": {
      "url": "https://your-worker.workers.dev/mcp"
    }
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Interactive web UI |
| `/mcp` | ALL | MCP Streamable HTTP Transport endpoint |
| `/api/contributions/:username` | GET | REST API for contribution data |
| `/health` | GET | Health check |

## MCP Tool

### `github_contributions`

Display an interactive GitHub contributions widget.

**Parameters:**
- `username` (string, optional): GitHub username to fetch contributions for. If not provided, an input field will be shown in the UI.

**Returns:** MCP App HTML component with contribution heatmap and statistics.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub personal access token for higher API rate limits | No (recommended) |

## Transport Protocol

This server uses **Streamable HTTP Transport** via `@hono/mcp`:

- Single endpoint (`/mcp`) for all MCP operations
- Stateless request handling
- SSE streaming support
- Compatible with modern MCP clients (Cursor, Claude Desktop, etc.)

## License

MIT
