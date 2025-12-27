import type {
  ContributionData,
  ContributionStats,
  GitHubContributionsResponse,
  GitHubUser,
  ThirdPartyContributionResponse,
} from './types.js'

const GITHUB_API_BASE = 'https://api.github.com'
const CONTRIBUTIONS_API = 'https://github-contributions-api.jogruber.de/v4'

export async function fetchGitHubUser(
  username: string,
  token?: string
): Promise<GitHubUser | null> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'github-contributions-mcp',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers,
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      login: string
      name: string | null
      avatar_url: string
      bio: string | null
      company: string | null
      location: string | null
      followers: number
      following: number
      public_repos: number
    }

    return {
      login: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      company: data.company,
      location: data.location,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
    }
  } catch {
    return null
  }
}

export async function fetchContributions(
  username: string
): Promise<ContributionData> {
  try {
    const response = await fetch(`${CONTRIBUTIONS_API}/${username}`)

    if (!response.ok) {
      return { totalContributions: 0, weeks: [] }
    }

    const data = (await response.json()) as ThirdPartyContributionResponse

    // Transform the data into our format
    const contributions = data.contributions || []
    const weeks: ContributionData['weeks'] = []

    // Group contributions by week (7 days per week)
    for (let i = 0; i < contributions.length; i += 7) {
      const weekDays = contributions.slice(i, i + 7)
      weeks.push({
        contributionDays: weekDays.map((day) => ({
          date: day.date,
          count: day.count,
          level: day.level,
        })),
      })
    }

    // Calculate total from the response
    const totalContributions = Object.values(data.total || {}).reduce(
      (sum, count) => sum + count,
      0
    )

    return {
      totalContributions,
      weeks,
    }
  } catch {
    return { totalContributions: 0, weeks: [] }
  }
}

export function calculateStats(contributions: ContributionData): ContributionStats {
  const allDays = contributions.weeks.flatMap((week) => week.contributionDays)

  if (allDays.length === 0) {
    return {
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      mostActiveDay: null,
      averagePerDay: 0,
    }
  }

  // Sort days by date (newest first for streak calculation)
  const sortedDays = [...allDays].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Calculate current streak (from today backwards)
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const day of sortedDays) {
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)

    // Skip future dates
    if (dayDate > today) continue

    // Check if this is consecutive
    const daysDiff = Math.floor(
      (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === currentStreak && day.count > 0) {
      currentStreak++
    } else if (daysDiff === currentStreak && day.count === 0) {
      break
    } else if (daysDiff > currentStreak) {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  const chronologicalDays = [...allDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const day of chronologicalDays) {
    if (day.count > 0) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Find most active day
  const mostActiveDay = allDays.reduce(
    (max, day) => (day.count > (max?.count || 0) ? day : max),
    allDays[0]
  )

  // Calculate average
  const totalDays = allDays.length
  const averagePerDay =
    totalDays > 0 ? contributions.totalContributions / totalDays : 0

  return {
    totalContributions: contributions.totalContributions,
    currentStreak,
    longestStreak,
    mostActiveDay: mostActiveDay?.date || null,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
  }
}

export async function getGitHubContributions(
  username: string,
  token?: string
): Promise<GitHubContributionsResponse> {
  try {
    const [user, contributions] = await Promise.all([
      fetchGitHubUser(username, token),
      fetchContributions(username),
    ])

    if (!user && contributions.weeks.length === 0) {
      return {
        user: null,
        contributions: { totalContributions: 0, weeks: [] },
        stats: {
          totalContributions: 0,
          currentStreak: 0,
          longestStreak: 0,
          mostActiveDay: null,
          averagePerDay: 0,
        },
        error: `User "${username}" not found`,
      }
    }

    const stats = calculateStats(contributions)

    return {
      user,
      contributions,
      stats,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      contributions: { totalContributions: 0, weeks: [] },
      stats: {
        totalContributions: 0,
        currentStreak: 0,
        longestStreak: 0,
        mostActiveDay: null,
        averagePerDay: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
