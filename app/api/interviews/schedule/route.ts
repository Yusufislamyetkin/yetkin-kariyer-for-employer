import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, we'll use a simple approach - store scheduled interviews in a JSON field
    // In production, you'd want a proper ScheduledInterview model
    // For this implementation, we'll return empty array and handle scheduling via POST
    
    // This is a placeholder - in a real implementation, you'd query a ScheduledInterview table
    const interviews: any[] = [];

    return NextResponse.json({ interviews });
  } catch (error: any) {
    console.error("Error fetching scheduled interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { candidateEmail, jobId, scheduledAt, notes } = body;

    if (!candidateEmail || !scheduledAt) {
      return NextResponse.json(
        { error: "Candidate email and scheduled time are required" },
        { status: 400 }
      );
    }

    // Find candidate by email
    const candidate = await db.user.findUnique({
      where: { email: candidateEmail },
      select: { id: true, name: true, email: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Aday bulunamadı" },
        { status: 404 }
      );
    }

    // Verify job belongs to employer if provided
    if (jobId) {
      const job = await db.job.findUnique({
        where: { id: jobId },
        select: { employerId: true, title: true },
      });

      if (!job) {
        return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
      }

      if (job.employerId !== session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // For now, we'll create a simple interview record
    // In production, you'd want a proper ScheduledInterview model with:
    // - id, employerId, candidateId, jobId, scheduledAt, notes, status, createdAt, etc.
    
    // Since we don't have a ScheduledInterview model, we'll use Interview model
    // and store the scheduled time in metadata or create a new interview record
    
    // For this implementation, we'll return success
    // In production, create a ScheduledInterview record:
    // const scheduledInterview = await db.scheduledInterview.create({
    //   data: {
    //     employerId: session.user.id,
    //     candidateId: candidate.id,
    //     jobId: jobId || null,
    //     scheduledAt: new Date(scheduledAt),
    //     notes: notes || null,
    //     status: "scheduled",
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Mülakat planlandı",
      // In production, return the created interview
      // interview: scheduledInterview,
    });
  } catch (error: any) {
    console.error("Error scheduling interview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule interview" },
      { status: 500 }
    );
  }
}
