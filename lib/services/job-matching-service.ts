import { db } from "@/lib/db";
import { extractKeywords, calculateSkillsMatch, calculateExperienceMatch, calculateEducationMatch } from "@/lib/candidate-matcher";
import { batchAISemanticMatch } from "@/lib/candidate-matcher-ai";
import crypto from "crypto";

interface MatchResult {
  userId: string;
  cvId: string;
  matchScore: number;
  breakdown: {
    aiScore: number;
    keywordScore: number;
    interviewScore: number;
    testScore: number;
  };
}

interface UserStats {
  testStats: {
    averageScore: number;
    totalTests: number;
    highestScore: number;
  };
  interviewStats: {
    averageScore: number;
    totalInterviews: number;
    highestScore: number;
  };
  leaderboardStats: {
    points: number;
    averageScore: number;
    rank: number | null;
  };
}

/**
 * Generate cache key from job description and requirements
 */
function generateCacheKey(description: string, requirements: any): string {
  const content = `${description}${JSON.stringify(requirements)}`;
  return crypto.createHash("md5").update(content).digest("hex");
}

/**
 * Normalize test score to 0-100
 */
function normalizeTestScore(avgScore: number): number {
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Normalize interview score to 0-100
 */
function normalizeInterviewScore(avgScore: number): number {
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Get user stats (test, interview, leaderboard)
 */
async function getUserStats(userIds: string[]): Promise<Map<string, UserStats>> {
  const statsMap = new Map<string, UserStats>();

  // Initialize default stats
  userIds.forEach((userId: string) => {
    statsMap.set(userId, {
      testStats: { averageScore: 0, totalTests: 0, highestScore: 0 },
      interviewStats: { averageScore: 0, totalInterviews: 0, highestScore: 0 },
      leaderboardStats: { points: 0, averageScore: 0, rank: null },
    });
  });

  // Get test attempts
  const testAttempts = await db.testAttempt.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      metrics: true,
    },
  });

  // Process test attempts
  const testScoresMap = new Map<string, number[]>();
  testAttempts.forEach((attempt: any) => {
    const metrics = attempt.metrics as any;
    const score = metrics?.score || 0;
    if (!testScoresMap.has(attempt.userId)) {
      testScoresMap.set(attempt.userId, []);
    }
    testScoresMap.get(attempt.userId)!.push(score);
  });

  // Calculate test stats
  testScoresMap.forEach((scores: number[], userId: string) => {
    const stats = statsMap.get(userId)!;
    stats.testStats = {
      averageScore: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      totalTests: scores.length,
      highestScore: Math.max(...scores),
    };
  });

  // Get interview attempts
  const interviewAttempts = await db.interviewAttempt.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      aiScore: true,
    },
  });

  // Process interview attempts
  const interviewScoresMap = new Map<string, number[]>();
  interviewAttempts.forEach((attempt: any) => {
    const score = attempt.aiScore || 0;
    if (!interviewScoresMap.has(attempt.userId)) {
      interviewScoresMap.set(attempt.userId, []);
    }
    interviewScoresMap.get(attempt.userId)!.push(score);
  });

  // Calculate interview stats
  interviewScoresMap.forEach((scores: number[], userId: string) => {
    const stats = statsMap.get(userId)!;
    stats.interviewStats = {
      averageScore: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      totalInterviews: scores.length,
      highestScore: Math.max(...scores),
    };
  });

  // Get leaderboard entries (monthly)
  const now = new Date();
  const periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const leaderboardEntries = await db.leaderboardEntry.findMany({
    where: {
      userId: { in: userIds },
      period: "monthly",
      periodDate,
    },
    select: {
      userId: true,
      points: true,
      averageScore: true,
      rank: true,
    },
  });

  // Process leaderboard entries
  leaderboardEntries.forEach((entry: any) => {
    const stats = statsMap.get(entry.userId)!;
    stats.leaderboardStats = {
      points: entry.points,
      averageScore: entry.averageScore,
      rank: entry.rank,
    };
  });

  return statsMap;
}

/**
 * Calculate keyword match score for a CV
 */
function calculateKeywordMatch(
  keywords: ReturnType<typeof extractKeywords>,
  cvData: any
): number {
  const skillsMatch = calculateSkillsMatch(keywords, cvData);
  const experienceMatch = calculateExperienceMatch(keywords, cvData);
  const educationMatch = calculateEducationMatch(keywords, cvData);

  // Weighted average
  return Math.round(
    skillsMatch * 0.60 + experienceMatch * 0.30 + educationMatch * 0.10
  );
}

/**
 * Match candidates for a job
 */
export async function matchCandidatesForJob(jobId: string): Promise<void> {
  try {
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      console.error(`[JOB_MATCHING] Job not found: ${jobId}`);
      return;
    }

    // Skip draft jobs
    if (job.status === "draft") {
      return;
    }

    // Check cache
    const cacheKey = generateCacheKey(job.description, job.requirements);
    if (job.cacheKey === cacheKey && job.matchedCandidatesCache) {
      console.log(`[JOB_MATCHING] Using cache for job ${jobId}`);
      return;
    }

    // Update status to processing
    await db.job.update({
      where: { id: jobId },
      data: { matchingStatus: "processing" },
    });

    // Get all CVs (limit to 300 for performance)
    const allCvs = await db.cV.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      take: 300,
    });

    if (allCvs.length === 0) {
      await db.job.update({
        where: { id: jobId },
        data: {
          matchedCandidatesCache: [],
          cacheKey,
          lastMatchedAt: new Date(),
          matchingStatus: "completed",
        },
      });
      return;
    }

    // Extract keywords from job
    const keywords = extractKeywords(job.description);

    // Tier 1: Keyword filtering
    const keywordMatches = allCvs
      .map((cv: any) => ({
        cv,
        keywordScore: calculateKeywordMatch(keywords, cv.data),
      }))
      .filter((m: any) => m.keywordScore > 20) // Minimum threshold
      .sort((a: any, b: any) => b.keywordScore - a.keywordScore)
      .slice(0, 50); // Top 50

    console.log(
      `[JOB_MATCHING] Job ${jobId}: ${allCvs.length} CVs -> ${keywordMatches.length} keyword matches`
    );

    if (keywordMatches.length === 0) {
      await db.job.update({
        where: { id: jobId },
        data: {
          matchedCandidatesCache: [],
          cacheKey,
          lastMatchedAt: new Date(),
          matchingStatus: "completed",
        },
      });
      return;
    }

    // Tier 2: AI batch processing (sadece top 50)
    let aiScores: Record<string, number> = {};
    try {
      aiScores = await batchAISemanticMatch(
        job.description,
        keywordMatches.map((m: any) => m.cv)
      );
    } catch (error) {
      console.error(`[JOB_MATCHING] AI matching failed for job ${jobId}:`, error);
      // Fallback: Use keyword scores only
      keywordMatches.forEach((m: any) => {
        aiScores[m.cv.id] = m.keywordScore;
      });
    }

    // Get user stats for final scoring
    const userIds = keywordMatches.map((m: any) => m.cv.userId);
    const userStatsMap = await getUserStats(userIds);

    // Final scoring
    const finalMatches: MatchResult[] = keywordMatches.map(({ cv, keywordScore }: any) => {
      const aiScore = aiScores[cv.id] || keywordScore;
      const userStats = userStatsMap.get(cv.userId)!;

      const interviewScore = normalizeInterviewScore(
        userStats.interviewStats.averageScore
      );
      const testScore = normalizeTestScore(userStats.testStats.averageScore);

      // Final score: Mülakat %70 + Diğerleri %30
      // Diğerleri: AI %15 + Keyword %10 + Test %5
      const otherFactorsScore =
        (aiScore * 0.15 + keywordScore * 0.10 + testScore * 0.05) / 0.30;

      const finalScore = Math.round(
        interviewScore * 0.70 + otherFactorsScore * 0.30
      );

      return {
        userId: cv.userId,
        cvId: cv.id,
        matchScore: Math.min(100, Math.max(0, finalScore)),
        breakdown: {
          aiScore: Math.round(aiScore),
          keywordScore: Math.round(keywordScore),
          interviewScore: Math.round(interviewScore),
          testScore: Math.round(testScore),
        },
      };
    });

    // Sort by match score and take top 20
    finalMatches.sort((a: MatchResult, b: MatchResult) => b.matchScore - a.matchScore);
    const topMatches = finalMatches.slice(0, 20);

    // Enrich with user data
    const enrichedMatches = topMatches.map((match: MatchResult) => {
      const cv = keywordMatches.find((m: any) => m.cv.id === match.cvId)!.cv;
      return {
        ...match,
        user: cv.user,
      };
    });

    // Save to cache
    await db.job.update({
      where: { id: jobId },
      data: {
        matchedCandidatesCache: enrichedMatches,
        cacheKey,
        lastMatchedAt: new Date(),
        matchingStatus: "completed",
      },
    });

    console.log(
      `[JOB_MATCHING] Job ${jobId}: Matching completed, ${topMatches.length} candidates matched`
    );
  } catch (error) {
    console.error(`[JOB_MATCHING] Error matching candidates for job ${jobId}:`, error);
    await db.job.update({
      where: { id: jobId },
      data: { matchingStatus: "failed" },
    });
  }
}
