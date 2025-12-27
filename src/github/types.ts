export interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
	contributionDays: ContributionDay[];
}

export interface ContributionData {
	totalContributions: number;
	weeks: ContributionWeek[];
}

export interface GitHubUser {
	login: string;
	name: string | null;
	avatarUrl: string;
	bio: string | null;
	company: string | null;
	location: string | null;
	followers: number;
	following: number;
	publicRepos: number;
}

export interface ContributionStats {
	totalContributions: number;
	currentStreak: number;
	longestStreak: number;
	mostActiveDay: string | null;
	averagePerDay: number;
}

export interface GitHubContributionsResponse {
	user: GitHubUser | null;
	contributions: ContributionData;
	stats: ContributionStats;
	error: string | null;
}

export interface ThirdPartyContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export interface ThirdPartyContributionResponse {
	total: Record<string, number>;
	contributions: ThirdPartyContributionDay[];
}
