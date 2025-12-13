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
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
            cv: {
              select: {
                id: true,
                data: true,
              },
            },
          },
          orderBy: { appliedAt: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    // Check if job belongs to employer
    if (job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "İlan yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if job exists and belongs to employer
    const existingJob = await db.job.findUnique({
      where: { id: params.id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    if (existingJob.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if description or requirements changed
    const descriptionChanged =
      body.description !== undefined && body.description !== existingJob.description;
    const requirementsChanged =
      body.requirements !== undefined &&
      JSON.stringify(body.requirements) !== JSON.stringify(existingJob.requirements);
    const statusChangedToPublished =
      body.status === "published" && existingJob.status !== "published";

    const job = await db.job.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        requirements: body.requirements,
        location: body.location,
        salary: body.salary,
        status: body.status,
      },
    });

    // Start matching if description/requirements changed or status changed to published
    if (
      (descriptionChanged || requirementsChanged || statusChangedToPublished) &&
      job.status === "published"
    ) {
      matchCandidatesForJob(job.id).catch((error) => {
        console.error(`[JOB_API] Background matching failed for job ${job.id}:`, error);
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "İlan güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    });

    if (!job) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    if (job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "İlan silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
