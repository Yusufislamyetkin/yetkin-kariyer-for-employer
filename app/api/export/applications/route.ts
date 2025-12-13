import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const format = searchParams.get("format") || "csv";

    // Build query
    const where: any = {
      job: {
        employerId,
      },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    // Fetch applications
    const applications = await db.jobApplication.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Başvuru ID",
        "İlan Başlığı",
        "Aday Adı",
        "E-posta",
        "Durum",
        "Skor",
        "Başvuru Tarihi",
        "Notlar",
      ];

      const rows = applications.map((app: any) => [
        app.id,
        app.job.title,
        app.user.name || "İsimsiz",
        app.user.email,
        app.status === "accepted"
          ? "Kabul"
          : app.status === "rejected"
          ? "Reddedildi"
          : app.status === "reviewing"
          ? "İnceleniyor"
          : "Beklemede",
        app.score?.toString() || "",
        new Date(app.appliedAt).toLocaleDateString("tr-TR"),
        app.notes || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: any[]) =>
          row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="basvurular_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else if (format === "json") {
      return NextResponse.json({
        applications: applications.map((app: any) => ({
          id: app.id,
          jobTitle: app.job.title,
          candidateName: app.user.name,
          candidateEmail: app.user.email,
          status: app.status,
          score: app.score,
          appliedAt: app.appliedAt,
          notes: app.notes,
        })),
      });
    }

    return NextResponse.json(
      { error: "Invalid format. Use 'csv' or 'json'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error exporting applications:", error);
    return NextResponse.json(
      { error: "Failed to export applications" },
      { status: 500 }
    );
  }
}
