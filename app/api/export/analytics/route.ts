import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Get analytics data
    const [jobsCount, applicationsCount, cvsCount, interviewsCount, hackathonsCount, freelancerProjectsCount] =
      await Promise.all([
        db.job.count({ where: { employerId } }),
        db.jobApplication.count({
          where: {
            job: {
              employerId,
            },
          },
        }),
        db.cV.count(),
        db.interviewAttempt.count(),
        db.hackathon.count({ where: { organizerId: employerId } }),
        db.freelancerProject.count({ where: { createdBy: employerId } }),
      ]);

    const applicationsByStatus = await db.jobApplication.groupBy({
      by: ["status"],
      where: {
        job: {
          employerId,
        },
      },
      _count: true,
    });

    const jobsByStatus = await db.job.groupBy({
      by: ["status"],
      where: { employerId },
      _count: true,
    });

    const analyticsData = {
      summary: {
        totalJobs: jobsCount,
        totalApplications: applicationsCount,
        totalCVs: cvsCount,
        totalInterviews: interviewsCount,
        totalHackathons: hackathonsCount,
        totalFreelancerProjects: freelancerProjectsCount,
      },
      applicationsByStatus: applicationsByStatus.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      jobsByStatus: jobsByStatus.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      exportedAt: new Date().toISOString(),
    };

    if (format === "csv") {
      // Generate CSV
      const rows: string[][] = [
        ["Metrik", "Değer"],
        ["Toplam İş İlanı", jobsCount.toString()],
        ["Toplam Başvuru", applicationsCount.toString()],
        ["CV Havuzu", cvsCount.toString()],
        ["Mülakat Sonuçları", interviewsCount.toString()],
        ["Hackathon'lar", hackathonsCount.toString()],
        ["Freelancer Projeler", freelancerProjectsCount.toString()],
        [],
        ["Başvuru Durumları", ""],
        ...applicationsByStatus.map((item: any) => [
          item.status === "accepted"
            ? "Kabul"
            : item.status === "rejected"
            ? "Reddedildi"
            : item.status === "reviewing"
            ? "İnceleniyor"
            : "Beklemede",
          item._count.toString(),
        ]),
        [],
        ["İlan Durumları", ""],
        ...jobsByStatus.map((item: any) => [
          item.status === "published"
            ? "Yayında"
            : item.status === "closed"
            ? "Kapalı"
            : "Taslak",
          item._count.toString(),
        ]),
      ];

      const csvContent = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    );
  }
}
