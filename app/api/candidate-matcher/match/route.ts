import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/candidate-matcher";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MatchRequestSchema = z.object({
  jobText: z.string().min(10, "İş ilanı metni en az 10 karakter olmalıdır"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobText } = MatchRequestSchema.parse(body);

    // Get all CVs with user data
    const cvs = await db.cV.findMany({
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
      take: 100, // Limit to 100 CVs for performance
    });

    if (cvs.length === 0) {
      return NextResponse.json({
        matches: [],
        totalCandidates: 0,
        matchedCandidates: 0,
      });
    }

    const userIds = cvs.map((cv: any) => cv.userId);

    // Get test attempts for all users
    const testAttempts = await db.testAttempt.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        metrics: true,
      },
    });

    // Get interview attempts for all users
    const interviewAttempts = await db.interviewAttempt.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        aiScore: true,
      },
    });

    // Get leaderboard entries for all users (monthly)
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

    // Calculate stats per user
    const testStatsMap = new Map<string, { averageScore: number; totalTests: number; highestScore: number }>();
    const interviewStatsMap = new Map<string, { averageScore: number; totalInterviews: number; highestScore: number }>();
    const leaderboardStatsMap = new Map<string, { points: number; averageScore: number; rank: number | null }>();

    // Process test attempts
      testAttempts.forEach((attempt: any) => {
      const metrics = attempt.metrics as any;
      const score = metrics?.score || 0;
      
      if (!testStatsMap.has(attempt.userId)) {
        testStatsMap.set(attempt.userId, {
          averageScore: 0,
          totalTests: 0,
          highestScore: 0,
        });
      }
      
      const stats = testStatsMap.get(attempt.userId)!;
      stats.totalTests++;
      stats.highestScore = Math.max(stats.highestScore, score);
    });

    // Calculate averages for test stats
    testStatsMap.forEach((stats, userId) => {
      const userAttempts = testAttempts.filter((a: any) => a.userId === userId);
      const scores = userAttempts
        .map((a: any) => {
          const metrics = a.metrics as any;
          return metrics?.score || 0;
        })
        .filter((s: number) => s > 0);
      
      stats.averageScore = scores.length > 0
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0;
    });

    // Process interview attempts
    interviewAttempts.forEach((attempt: any) => {
      const score = attempt.aiScore || 0;
      
      if (!interviewStatsMap.has(attempt.userId)) {
        interviewStatsMap.set(attempt.userId, {
          averageScore: 0,
          totalInterviews: 0,
          highestScore: 0,
        });
      }
      
      const stats = interviewStatsMap.get(attempt.userId)!;
      stats.totalInterviews++;
      stats.highestScore = Math.max(stats.highestScore, score);
    });

    // Calculate averages for interview stats
    interviewStatsMap.forEach((stats, userId) => {
      const userAttempts = interviewAttempts.filter((a: any) => a.userId === userId);
      const scores = userAttempts
        .map((a: any) => a.aiScore || 0)
        .filter((s: number) => s > 0);
      
      stats.averageScore = scores.length > 0
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0;
    });

    // Process leaderboard entries
    leaderboardEntries.forEach((entry: any) => {
      leaderboardStatsMap.set(entry.userId, {
        points: entry.points,
        averageScore: entry.averageScore,
        rank: entry.rank,
      });
    });

    // Calculate match scores for each CV
    const matches = cvs.map((cv: any) => {
      const testStats = testStatsMap.get(cv.userId) || {
        averageScore: 0,
        totalTests: 0,
        highestScore: 0,
      };

      const interviewStats = interviewStatsMap.get(cv.userId) || {
        averageScore: 0,
        totalInterviews: 0,
        highestScore: 0,
      };

      const leaderboardStats = leaderboardStatsMap.get(cv.userId) || {
        points: 0,
        averageScore: 0,
        rank: null,
      };

      const matchResult = calculateMatchScore(
        jobText,
        cv.data as any,
        testStats,
        interviewStats,
        leaderboardStats
      );

      return {
        userId: cv.userId,
        user: cv.user,
        cv: {
          id: cv.id,
          data: cv.data,
        },
        matchScore: matchResult.matchScore,
        breakdown: matchResult.breakdown,
        testStats,
        interviewStats,
        leaderboardStats,
      };
    });

    // Sort by match score (descending)
    matches.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Filter matches with score > 0
    const matchedCandidates = matches.filter((m: any) => m.matchScore > 0);

    return NextResponse.json({
      matches: matches.slice(0, 50), // Return top 50 matches
      totalCandidates: cvs.length,
      matchedCandidates: matchedCandidates.length,
    });
  } catch (error) {
    console.error("Error matching candidates:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Aday eşleştirme sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
