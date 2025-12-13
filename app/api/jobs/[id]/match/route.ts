import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { matchCandidatesForJob } from "@/lib/services/job-matching-service";

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

    const job = await db.job.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        employerId: true,
        matchedCandidatesCache: true,
        matchingStatus: true,
        lastMatchedAt: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    // Check if job belongs to employer
    if (job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      matches: job.matchedCandidatesCache || [],
      status: job.matchingStatus || "idle",
      lastMatchedAt: job.lastMatchedAt,
    });
  } catch (error) {
    console.error("Error fetching match results:", error);
    return NextResponse.json(
      { error: "Eşleştirme sonuçları yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await db.job.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        employerId: true,
        status: true,
        matchingStatus: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    // Check if job belongs to employer
    if (job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Skip if already processing
    if (job.matchingStatus === "processing") {
      return NextResponse.json({
        status: "processing",
        message: "Eşleştirme zaten devam ediyor",
      });
    }

    // Skip draft jobs
    if (job.status === "draft") {
      return NextResponse.json({
        status: "draft",
        message: "Taslak ilanlar için eşleştirme yapılamaz",
      });
    }

    // Start matching in background (don't await)
    matchCandidatesForJob(params.id).catch((error) => {
      console.error(`[JOB_MATCH_API] Background matching failed:`, error);
    });

    return NextResponse.json({
      status: "processing",
      message: "Eşleştirme başlatıldı",
    });
  } catch (error) {
    console.error("Error starting match:", error);
    return NextResponse.json(
      { error: "Eşleştirme başlatılırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
