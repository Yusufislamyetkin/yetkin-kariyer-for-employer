import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const jobId = params.id;
    const applicationId = params.applicationId;

    // Verify job belongs to employer
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { employerId: true },
    });

    if (!job || job.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get notes (include private notes only if created by current employer)
    const notes = await db.applicationNote.findMany({
      where: {
        applicationId,
        jobId,
        OR: [
          { isPrivate: false },
          { employerId, isPrivate: true },
        ],
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const jobId = params.id;
    const applicationId = params.applicationId;
    const body = await request.json();
    const { content, category, isPrivate } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify job belongs to employer
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { employerId: true },
    });

    if (!job || job.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify application belongs to job
    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      select: { jobId: true },
    });

    if (!application || application.jobId !== jobId) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Create note
    const note = await db.applicationNote.create({
      data: {
        applicationId,
        jobId,
        employerId,
        content: content.trim(),
        category: category || null,
        isPrivate: isPrivate || false,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create note" },
      { status: 500 }
    );
  }
}
