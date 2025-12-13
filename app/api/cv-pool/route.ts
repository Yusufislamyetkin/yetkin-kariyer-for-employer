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
    const search = searchParams.get("search");
    const technology = searchParams.get("technology");
    const minScore = searchParams.get("minScore");

    const where: any = {};

    // Search filter (name, email)
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const cvs = await db.cV.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        uploads: {
          select: {
            id: true,
            url: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 CVs per request
    });

    // Filter by technology and score if needed
    let filteredCVs = cvs;

    if (technology) {
      filteredCVs = filteredCVs.filter((cv: any) => {
        const data = cv.data as any;
        const skills = data?.skills || [];
        const technologies = Array.isArray(skills)
          ? skills.map((s: any) => (typeof s === "string" ? s : s.name || s.technology))
          : [];
        return technologies.some((tech: string) =>
          tech.toLowerCase().includes(technology.toLowerCase())
        );
      });
    }

    if (minScore) {
      const minScoreNum = parseInt(minScore);
      // Get user scores from test attempts
      const userIds = filteredCVs.map((cv: any) => cv.userId);
      const testAttempts = await db.testAttempt.findMany({
        where: {
          userId: { in: userIds },
        },
        select: {
          userId: true,
          metrics: true,
        },
      });

      const userScores = new Map<string, number[]>();
      testAttempts.forEach((attempt: any) => {
        const metrics = attempt.metrics as any;
        const score = metrics?.score || 0;
        if (!userScores.has(attempt.userId)) {
          userScores.set(attempt.userId, []);
        }
        userScores.get(attempt.userId)!.push(score);
      });

      filteredCVs = filteredCVs.filter((cv: any) => {
        const scores = userScores.get(cv.userId) || [];
        const avgScore = scores.length > 0
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
          : 0;
        return avgScore >= minScoreNum;
      });
    }

    return NextResponse.json({ cvs: filteredCVs });
  } catch (error) {
    console.error("Error fetching CV pool:", error);
    return NextResponse.json(
      { error: "CV havuzu yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
