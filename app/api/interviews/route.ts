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
    const userId = searchParams.get("userId");
    const minScore = searchParams.get("minScore");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (minScore) {
      where.aiScore = { gte: parseInt(minScore) };
    }

    if (dateFrom || dateTo) {
      where.completedAt = {};
      if (dateFrom) {
        where.completedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.completedAt.lte = new Date(dateTo);
      }
    }

    const interviewAttempts = await db.interviewAttempt.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        interview: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ interviewAttempts });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Mülakat sonuçları yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
