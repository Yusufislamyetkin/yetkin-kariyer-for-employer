import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all candidates who have applied to employer's jobs
    const applications = await db.jobApplication.findMany({
      where: {
        job: {
          employerId: session.user?.id as string,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      distinct: ["userId"],
    });

    const candidates = applications.map((app: any) => app.user);

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
