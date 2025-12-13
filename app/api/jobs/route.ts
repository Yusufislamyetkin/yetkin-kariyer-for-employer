import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { matchCandidatesForJob } from "@/lib/services/job-matching-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      employerId: session.user.id as string,
    };

    if (status) {
      where.status = status;
    }

    const jobs = await db.job.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            score: true,
            appliedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "İlanlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, requirements, location, salary, status } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Başlık ve açıklama gereklidir" },
        { status: 400 }
      );
    }

    const job = await db.job.create({
      data: {
        employerId: session.user.id as string,
        title,
        description,
        requirements: requirements || {},
        location: location || null,
        salary: salary || null,
        status: status || "draft",
      },
    });

    // Start matching in background if job is published
    if (job.status === "published") {
      matchCandidatesForJob(job.id).catch((error) => {
        console.error(`[JOB_API] Background matching failed for job ${job.id}:`, error);
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "İlan oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
