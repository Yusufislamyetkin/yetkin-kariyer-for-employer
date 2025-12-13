import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cv = await db.cV.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            createdAt: true,
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
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
        jobApplications: {
          select: {
            id: true,
            job: {
              select: {
                id: true,
                title: true,
              },
            },
            status: true,
            appliedAt: true,
          },
        },
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV bulunamadı" }, { status: 404 });
    }

    // Get user's test scores
    const testAttempts = await db.testAttempt.findMany({
      where: { userId: cv.userId },
      select: {
        metrics: true,
        completedAt: true,
        quiz: {
          select: {
            title: true,
            topic: true,
            level: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    // Get user's interview results
    const interviewAttempts = await db.interviewAttempt.findMany({
      where: { userId: cv.userId },
      select: {
        id: true,
        aiScore: true,
        aiFeedback: true,
        completedAt: true,
        interview: {
          select: {
            title: true,
            type: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      cv,
      testAttempts,
      interviewAttempts,
    });
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "CV yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
