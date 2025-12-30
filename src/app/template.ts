import { getStyles } from "./styles.js";

export interface GenerateAppHtmlOptions {
	initialUsername?: string;
	apiBaseUrl?: string;
}

export function generateAppHtml(options: GenerateAppHtmlOptions = {}): string {
	const { initialUsername, apiBaseUrl } = options;
	const styles = getStyles();

	// Use the provided apiBaseUrl or fall back to window.location.origin
	const apiBaseScript = apiBaseUrl
		? `const API_BASE = '${apiBaseUrl}';`
		: `const API_BASE = window.location.origin;`;

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Contributions</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container" id="app">
    <div class="header">
      <h1>
        <svg height="28" viewBox="0 0 16 16" width="28" fill="currentColor">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
        </svg>
        GitHub Contributions
      </h1>
      <p>View contribution activity for any GitHub user</p>
    </div>

    <form class="search-form" id="searchForm">
      <input
        type="text"
        class="search-input"
        id="usernameInput"
        placeholder="Enter GitHub username"
        value="${initialUsername || ""}"
        autocomplete="off"
        spellcheck="false"
      />
      <button type="submit" class="search-button" id="searchBtn">
        Search
      </button>
    </form>

    <div id="content">
      ${
				initialUsername
					? `
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <div class="loading-text">Loading contributions...</div>
        </div>
      `
					: `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">Enter a GitHub username</div>
          <p>Search for any GitHub user to see their contribution activity</p>
        </div>
      `
			}
    </div>

    <div class="tooltip" id="tooltip"></div>
  </div>

  <script>
    (function() {
      // Theme detection
      function detectTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      }

      detectTheme();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectTheme);

      // Also listen for parent theme changes via MCP Apps
      if (window.parent !== window) {
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'theme-change') {
            document.documentElement.setAttribute('data-theme', event.data.theme);
          }
        });
      }

      // Auto-resize for iframe
      function notifyResize() {
        const height = document.body.scrollHeight;
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'resize', height: height }, '*');
        }
      }

      const resizeObserver = new ResizeObserver(notifyResize);
      resizeObserver.observe(document.body);

      // API endpoint (injected from server or fallback to window.location.origin)
      ${apiBaseScript}

      // DOM elements
      const form = document.getElementById('searchForm');
      const input = document.getElementById('usernameInput');
      const content = document.getElementById('content');
      const searchBtn = document.getElementById('searchBtn');
      const tooltip = document.getElementById('tooltip');

      // Fetch contributions
      async function fetchContributions(username) {
        const response = await fetch(API_BASE + '/api/contributions/' + encodeURIComponent(username));
        if (!response.ok) {
          throw new Error('Failed to fetch contributions');
        }
        return response.json();
      }

      // Render results
      function renderResults(data) {
        if (data.error) {
          content.innerHTML = '<div class="error">' + escapeHtml(data.error) + '</div>';
          return;
        }

        let html = '';

        // User card
        if (data.user) {
          html += renderUserCard(data.user);
        }

        // Stats grid
        html += renderStatsGrid(data.stats);

        // Contributions graph
        html += renderContributionsSection(data.contributions);

        content.innerHTML = html;

        // Setup tooltip handlers
        setupTooltips();

        // Notify resize
        setTimeout(notifyResize, 100);
      }

      function renderUserCard(user) {
        return '<div class="user-card fade-in">' +
          '<img class="user-avatar" src="' + user.avatarUrl + '" alt="' + escapeHtml(user.login) + '" loading="lazy" />' +
          '<div class="user-info">' +
            '<div class="user-name">' + escapeHtml(user.name || user.login) + '</div>' +
            '<div class="user-login">@' + escapeHtml(user.login) + '</div>' +
            (user.bio ? '<div class="user-bio">' + escapeHtml(user.bio) + '</div>' : '') +
          '</div>' +
          '<div class="user-meta">' +
            '<span>👥 ' + formatNumber(user.followers) + ' followers</span>' +
            '<span>📦 ' + formatNumber(user.publicRepos) + ' repos</span>' +
          '</div>' +
        '</div>';
      }

      function renderStatsGrid(stats) {
        return '<div class="stats-grid fade-in" style="animation-delay: 0.1s;">' +
          '<div class="stat-card"><div class="stat-value">' + formatNumber(stats.totalContributions) + '</div><div class="stat-label">Contributions</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + stats.currentStreak + '</div><div class="stat-label">Current Streak</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + stats.longestStreak + '</div><div class="stat-label">Longest Streak</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + stats.averagePerDay + '</div><div class="stat-label">Avg Per Day</div></div>' +
        '</div>';
      }

      function renderContributionsSection(contributions) {
        // Group weeks by year
        const yearGroups = groupWeeksByYear(contributions.weeks);
        const years = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a)); // Sort descending (newest first)

        let html = '<div class="contributions-section fade-in" style="animation-delay: 0.2s;">' +
          '<div class="contributions-header">' +
            '<span class="contributions-title">Contribution Activity</span>' +
            '<span class="contributions-total">' + formatNumber(contributions.totalContributions) + ' contributions total</span>' +
          '</div>';

        // Render each year
        years.forEach(function(year, index) {
          const yearData = yearGroups[year];
          const yearContributions = yearData.weeks.reduce(function(sum, week) {
            return sum + week.contributionDays.reduce(function(s, d) { return s + d.count; }, 0);
          }, 0);

          html += '<div class="year-section' + (index > 0 ? ' collapsed' : '') + '" data-year="' + year + '">' +
            '<div class="year-header" onclick="toggleYear(this)">' +
              '<span class="year-title">' +
                '<svg class="year-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">' +
                  '<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"/>' +
                '</svg>' +
                year +
              '</span>' +
              '<span class="year-total">' + formatNumber(yearContributions) + ' contributions</span>' +
            '</div>' +
            '<div class="year-content">' +
              '<div class="contributions-graph">' + generateContributionsSVG(yearData.weeks) + '</div>' +
            '</div>' +
          '</div>';
        });

        // Legend (only once at the bottom)
        html += '<div class="legend">' +
          '<span>Less</span>' +
          '<div class="legend-cell" style="background: var(--contribution-0);"></div>' +
          '<div class="legend-cell" style="background: var(--contribution-1);"></div>' +
          '<div class="legend-cell" style="background: var(--contribution-2);"></div>' +
          '<div class="legend-cell" style="background: var(--contribution-3);"></div>' +
          '<div class="legend-cell" style="background: var(--contribution-4);"></div>' +
          '<span>More</span>' +
        '</div>';

        html += '</div>';
        return html;
      }

      function groupWeeksByYear(weeks) {
        if (!weeks || weeks.length === 0) return {};

        const yearGroups = {};

        weeks.forEach(function(week) {
          if (!week.contributionDays || week.contributionDays.length === 0) return;

          // Use the first day of the week to determine the year
          const firstDay = week.contributionDays[0];
          const year = new Date(firstDay.date).getFullYear().toString();

          if (!yearGroups[year]) {
            yearGroups[year] = { weeks: [] };
          }
          yearGroups[year].weeks.push(week);
        });

        return yearGroups;
      }

      function generateContributionsSVG(weeks) {
        if (!weeks || weeks.length === 0) return '';

        const CELL_SIZE = 10;
        const CELL_GAP = 3;
        const WEEK_WIDTH = CELL_SIZE + CELL_GAP;
        const MONTH_LABEL_HEIGHT = 18;
        const DAY_LABEL_WIDTH = 28;

        const viewBoxWidth = weeks.length * WEEK_WIDTH + DAY_LABEL_WIDTH + 10;
        const viewBoxHeight = 7 * (CELL_SIZE + CELL_GAP) + MONTH_LABEL_HEIGHT + 5;

        const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

        // Generate month labels
        const monthLabels = [];
        let currentMonth = '';

        weeks.forEach(function(week, weekIndex) {
          if (week.contributionDays && week.contributionDays.length > 0) {
            const firstDay = week.contributionDays[0];
            const date = new Date(firstDay.date);
            const month = date.toLocaleDateString('en-US', { month: 'short' });

            if (month !== currentMonth) {
              currentMonth = month;
              monthLabels.push({ month: month, x: DAY_LABEL_WIDTH + weekIndex * WEEK_WIDTH });
            }
          }
        });

        // Generate cells
        let cells = '';
        weeks.forEach(function(week, weekIndex) {
          if (!week.contributionDays) return;
          week.contributionDays.forEach(function(day, dayIndex) {
            const x = DAY_LABEL_WIDTH + weekIndex * WEEK_WIDTH;
            const y = MONTH_LABEL_HEIGHT + dayIndex * (CELL_SIZE + CELL_GAP);
            const color = getContributionColor(day.level);

            cells += '<rect class="contribution-cell" x="' + x + '" y="' + y + '" width="' + CELL_SIZE + '" height="' + CELL_SIZE + '" fill="' + color + '" data-date="' + day.date + '" data-count="' + day.count + '" />';
          });
        });

        // Generate month label elements
        let monthLabelElements = '';
        monthLabels.forEach(function(item) {
          monthLabelElements += '<text class="month-label" x="' + item.x + '" y="10">' + item.month + '</text>';
        });

        // Generate day label elements
        let dayLabelElements = '';
        dayLabels.forEach(function(label, index) {
          const y = MONTH_LABEL_HEIGHT + index * (CELL_SIZE + CELL_GAP) + 8;
          dayLabelElements += '<text class="day-label" x="0" y="' + y + '">' + label + '</text>';
        });

        // Use 100% width to fill container, viewBox controls the aspect ratio
        return '<svg class="contribution-svg" viewBox="0 0 ' + viewBoxWidth + ' ' + viewBoxHeight + '" preserveAspectRatio="xMinYMin meet">' +
          monthLabelElements +
          dayLabelElements +
          cells +
        '</svg>';
      }

      // Toggle year section collapse/expand
      window.toggleYear = function(header) {
        const section = header.parentElement;
        section.classList.toggle('collapsed');
        setTimeout(notifyResize, 300);
      };

      function getContributionColor(level) {
        const colors = {
          0: 'var(--contribution-0)',
          1: 'var(--contribution-1)',
          2: 'var(--contribution-2)',
          3: 'var(--contribution-3)',
          4: 'var(--contribution-4)'
        };
        return colors[level] || colors[0];
      }

      function setupTooltips() {
        const cells = document.querySelectorAll('.contribution-cell');
        cells.forEach(function(cell) {
          cell.addEventListener('mouseenter', function(e) {
            const date = cell.getAttribute('data-date');
            const count = cell.getAttribute('data-count');
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            tooltip.innerHTML = '<span class="tooltip-count">' + count + ' contribution' + (count !== '1' ? 's' : '') + '</span><span class="tooltip-date">on ' + formattedDate + '</span>';
            tooltip.classList.add('visible');

            const rect = cell.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
          });

          cell.addEventListener('mouseleave', function() {
            tooltip.classList.remove('visible');
          });
        });
      }

      function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      function formatNumber(num) {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M';
        }
        if (num >= 1000) {
          return (num / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
        }
        return num.toString();
      }

      // Form submission
      form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = input.value.trim();
        if (!username) return;

        // Show loading
        content.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Loading contributions...</div></div>';
        searchBtn.disabled = true;

        try {
          const data = await fetchContributions(username);
          renderResults(data);
        } catch (error) {
          content.innerHTML = '<div class="error">Failed to fetch contributions. Please try again.</div>';
        } finally {
          searchBtn.disabled = false;
        }
      });

      // Auto-load if username is provided
      const initialUsername = '${initialUsername || ""}';
      if (initialUsername) {
        form.dispatchEvent(new Event('submit'));
      }
    })();
  </script>
</body>
</html>`;
}
