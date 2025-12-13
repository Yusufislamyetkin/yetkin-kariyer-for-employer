import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const jobId = params.id;
    const body = await request.json();
    const { applicationIds, status } = body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: "Application IDs are required" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "reviewing", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    // Verify job belongs to employer
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { employerId: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify all applications belong to this job
    const applications = await db.jobApplication.findMany({
      where: {
        id: { in: applicationIds },
        jobId: jobId,
      },
      select: { id: true },
    });

    if (applications.length !== applicationIds.length) {
      return NextResponse.json(
        { error: "Some applications not found or don't belong to this job" },
        { status: 400 }
      );
    }

    // Update all applications
    await db.jobApplication.updateMany({
      where: {
        id: { in: applicationIds },
        jobId: jobId,
      },
      data: {
        status: status as any,
      },
    });

    return NextResponse.json({
      success: true,
      updated: applications.length,
    });
  } catch (error: any) {
    console.error("Error performing bulk update:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update applications" },
      { status: 500 }
    );
  }
}
