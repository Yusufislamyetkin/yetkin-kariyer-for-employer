import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const category = searchParams.get("category") || "all";
    const minScore = searchParams.get("minScore");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === "daily") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      // monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get leaderboard entries
    const periodDate = period === "daily"
      ? now.toISOString().split("T")[0]
      : period === "weekly"
      ? `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const leaderboardEntries = await db.leaderboardEntry.findMany({
      where: {
        period: period as any,
        periodDate,
      },
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
      orderBy: [
        { points: "desc" },
        { averageScore: "desc" },
      ],
      take: limit,
    });

    // Filter by category and minScore
    let filteredEntries = leaderboardEntries;

    if (category !== "all") {
      // For category filtering, we'd need to check test attempts
      // For now, we'll use the averageScore from leaderboard
    }

    if (minScore) {
      const minScoreNum = parseInt(minScore);
      filteredEntries = filteredEntries.filter(
        (entry: any) => entry.averageScore >= minScoreNum
      );
    }

    // Get user badges for top users
    const userIds = filteredEntries.map((entry: any) => entry.userId);
    const userBadges = await db.userBadge.findMany({
      where: {
        userId: { in: userIds },
        isDisplayed: true,
      },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            rarity: true,
          },
        },
      },
      orderBy: { earnedAt: "desc" },
    });

    const badgesMap = new Map<string, typeof userBadges>();
    userBadges.forEach((ub: any) => {
      if (!badgesMap.has(ub.userId)) {
        badgesMap.set(ub.userId, []);
      }
      const badges = badgesMap.get(ub.userId)!;
      if (badges.length < 3) {
        badges.push(ub);
      }
    });

    const topUsers = filteredEntries.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.userId,
      user: entry.user,
      points: entry.points,
      averageScore: entry.averageScore,
      highestScore: entry.highestScore,
      quizCount: entry.quizCount,
      displayedBadges: (badgesMap.get(entry.userId) || []).map((ub: any) => ub.badge),
    }));

    return NextResponse.json({ topUsers, period, periodDate });
  } catch (error) {
    console.error("Error fetching top users:", error);
    return NextResponse.json(
      { error: "Başarılı kullanıcılar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
