import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user.id as string;

    // Get all statistics
    const [
      totalJobs,
      totalApplications,
      totalCVs,
      totalInterviews,
      totalHackathons,
      totalFreelancerProjects,
      applications,
      jobs,
      cvs,
    ] = await Promise.all([
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
      db.jobApplication.findMany({
        where: {
          job: {
            employerId,
          },
        },
        select: {
          status: true,
        },
      }),
      db.job.findMany({
        where: { employerId },
        select: {
          status: true,
        },
      }),
      db.cV.findMany({
        select: {
          data: true,
        },
        take: 1000,
      }),
    ]);

    // Calculate applications by status
    const applicationsByStatus: Record<string, number> = {};
    applications.forEach((app: any) => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });

    // Calculate jobs by status
    const jobsByStatus: Record<string, number> = {};
    jobs.forEach((job: any) => {
      jobsByStatus[job.status] = (jobsByStatus[job.status] || 0) + 1;
    });

    // Extract top skills from CVs
    const skillsMap = new Map<string, number>();
    cvs.forEach((cv: any) => {
      const cvData = cv.data as any;
      const skills = cvData?.skills || [];
      if (Array.isArray(skills)) {
        skills.forEach((skill: any) => {
          const skillName = typeof skill === "string" ? skill : skill.name || skill.technology || "";
          if (skillName) {
            skillsMap.set(skillName, (skillsMap.get(skillName) || 0) + 1);
          }
        });
      }
    });

    const topSkills = Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({
      totalJobs,
      totalApplications,
      totalCVs,
      totalInterviews,
      totalHackathons,
      totalFreelancerProjects,
      applicationsByStatus,
      jobsByStatus,
      topSkills,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Analitik veriler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
