export const getStyles = (): string => `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f6f8fa;
    --bg-tertiary: #eaeef2;
    --text-primary: #1f2328;
    --text-secondary: #656d76;
    --text-muted: #8c959f;
    --border-color: #d0d7de;
    --border-light: #e1e4e8;
    --accent-color: #0969da;
    --accent-hover: #0550ae;
    --success-color: #1a7f37;
    --error-color: #cf222e;
    --error-bg: #ffebe9;
    --contribution-0: #ebedf0;
    --contribution-1: #9be9a8;
    --contribution-2: #40c463;
    --contribution-3: #30a14e;
    --contribution-4: #216e39;
    --shadow-sm: 0 1px 0 rgba(31, 35, 40, 0.04);
    --shadow-md: 0 3px 6px rgba(140, 149, 159, 0.15);
    --shadow-lg: 0 8px 24px rgba(140, 149, 159, 0.2);
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    --transition-fast: 150ms ease;
    --transition-normal: 200ms ease;
  }

  [data-theme="dark"] {
    --bg-primary: #0d1117;
    --bg-secondary: #161b22;
    --bg-tertiary: #21262d;
    --text-primary: #e6edf3;
    --text-secondary: #8d96a0;
    --text-muted: #6e7681;
    --border-color: #30363d;
    --border-light: #21262d;
    --accent-color: #58a6ff;
    --accent-hover: #79c0ff;
    --success-color: #3fb950;
    --error-color: #f85149;
    --error-bg: #3d1a1f;
    --contribution-0: #161b22;
    --contribution-1: #0e4429;
    --contribution-2: #006d32;
    --contribution-3: #26a641;
    --contribution-4: #39d353;
    --shadow-sm: 0 1px 0 rgba(0, 0, 0, 0.1);
    --shadow-md: 0 3px 6px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  body {
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
    background: var(--bg-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .header p {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .search-form {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .search-input {
    flex: 1;
    padding: 10px 14px;
    font-size: 14px;
    font-family: var(--font-sans);
    color: var(--text-primary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .search-input:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .search-button {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    font-family: var(--font-sans);
    color: #ffffff;
    background: var(--accent-color);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition-fast), transform var(--transition-fast);
    white-space: nowrap;
  }

  .search-button:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .search-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .search-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    gap: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .error {
    background: var(--error-bg);
    border: 1px solid var(--error-color);
    border-radius: var(--radius-md);
    padding: 16px;
    color: var(--error-color);
    text-align: center;
    margin-bottom: 24px;
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
  }

  .user-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--border-light);
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .user-login {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .user-bio {
    font-size: 13px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .user-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    text-align: center;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--accent-color);
    margin-bottom: 4px;
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .contributions-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 20px;
    overflow-x: auto;
  }

  .contributions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .contributions-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .contributions-total {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .contributions-graph {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .contributions-graph svg {
    display: block;
    min-width: 720px;
  }

  .contribution-cell {
    rx: 2;
    ry: 2;
    transition: opacity var(--transition-fast);
  }

  .contribution-cell:hover {
    stroke: var(--text-primary);
    stroke-width: 1;
    opacity: 0.8;
  }

  .month-label {
    font-size: 10px;
    fill: var(--text-secondary);
    font-family: var(--font-sans);
  }

  .day-label {
    font-size: 9px;
    fill: var(--text-muted);
    font-family: var(--font-sans);
  }

  .legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 12px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .legend-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .tooltip {
    position: fixed;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--text-primary);
    pointer-events: none;
    z-index: 1000;
    box-shadow: var(--shadow-md);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .tooltip.visible {
    opacity: 1;
  }

  .tooltip-count {
    font-weight: 600;
    color: var(--accent-color);
  }

  .tooltip-date {
    color: var(--text-secondary);
    margin-left: 4px;
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-secondary);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  @media (max-width: 600px) {
    .container {
      padding: 16px;
    }

    .search-form {
      flex-direction: column;
    }

    .user-card {
      flex-direction: column;
      text-align: center;
    }

    .user-meta {
      justify-content: center;
      flex-wrap: wrap;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`
