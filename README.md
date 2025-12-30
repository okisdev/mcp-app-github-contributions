# GitHub Contributions MCP Server

A Model Context Protocol (MCP) server that provides an interactive UI tool for querying and displaying GitHub user contribution data.

## Features

- 📊 Interactive contribution heatmap (similar to GitHub profile)
- 📈 Contribution statistics (total, streaks, daily average)
- 👤 User profile display
- 🌓 Dark/Light theme support
- 📱 Responsive design for iframe embedding

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) or npm

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

```

Server runs at `http://localhost:3001`

## MCP Client Configuration

Connect to this server using SSE transport:

```json
{
  "mcpServers": {
    "github-contributions": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Interactive web UI |
| `GET /sse` | MCP SSE endpoint |
| `POST /message` | MCP message endpoint |
| `GET /api/contributions/:username` | REST API for contribution data |
| `GET /health` | Health check |

## MCP Tool

### `github_contributions`

Display an interactive GitHub contributions widget.

**Parameters:**
- `username` (string, optional): GitHub username to fetch contributions for

**Returns:** MCP App HTML component with contribution heatmap and statistics.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `GITHUB_TOKEN` | GitHub API token for higher rate limits | No |

## License

MIT
