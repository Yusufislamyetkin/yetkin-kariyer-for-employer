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

    const interviewAttempt = await db.interviewAttempt.findUnique({
      where: { id: params.id },
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
            description: true,
            type: true,
            difficulty: true,
            questions: true,
          },
        },
      },
    });

    if (!interviewAttempt) {
      return NextResponse.json({ error: "Mülakat sonucu bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ interviewAttempt });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Mülakat sonucu yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
