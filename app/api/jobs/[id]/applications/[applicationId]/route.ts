import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, score, notes } = body;

    // Check if job exists and belongs to employer
    const application = await db.jobApplication.findUnique({
      where: { id: params.applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
    }

    if (application.job.employerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedApplication = await db.jobApplication.update({
      where: { id: params.applicationId },
      data: {
        status: status || application.status,
        score: score !== undefined ? score : application.score,
        notes: notes !== undefined ? notes : application.notes,
      },
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Başvuru güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
