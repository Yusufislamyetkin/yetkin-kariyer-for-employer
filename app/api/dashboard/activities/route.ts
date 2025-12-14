import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user.id as string;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const activities: any[] = [];

    // 1. Job Applications - Kim hangi işe başvurmuş
    const jobApplications = await db.jobApplication.findMany({
      where: {
        job: {
          employerId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });

    for (const app of jobApplications) {
      activities.push({
        id: `application-${app.id}`,
        type: "application",
        title: `${app.user.name} "${app.job.title}" pozisyonuna başvurdu`,
        date: app.appliedAt,
        timeAgo: formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: tr }),
        userId: app.user.id,
        user: app.user,
        link: `/dashboard/jobs/${app.job.id}/applications`,
        icon: "💼",
      });
    }

    // 2. Interview Attempts - Kim hangi şirket ile mülakata girmiş, kim AI mülakatına girmiş
    // Interview'ler CV'ye bağlı, CV'ler user'a bağlı. İşveren için tüm interview attempt'leri gösteriyoruz
    const interviewAttempts = await db.interviewAttempt.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        interview: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: limit * 2, // Get more to filter
    });

    for (const attempt of interviewAttempts) {
      const isAIInterview = attempt.interview.type === "ai" || attempt.interview.type === "ai_mock" || attempt.interview.type === "ai_mock";
      activities.push({
        id: `interview-${attempt.id}`,
        type: isAIInterview ? "ai_interview" : "interview",
        title: isAIInterview
          ? `${attempt.user.name} AI mülakatına girdi`
          : `${attempt.user.name} "${attempt.interview.title}" mülakatına girdi`,
        date: attempt.completedAt,
        timeAgo: formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true, locale: tr }),
        userId: attempt.user.id,
        user: attempt.user,
        score: attempt.aiScore || undefined,
        link: `/dashboard/interviews/${attempt.interview.id}`,
        icon: isAIInterview ? "🤖" : "💬",
      });
    }

    // 3. Jobs Created - Hangi işveren ne ilanı yayınlamış
    const jobsCreated = await db.job.findMany({
      where: {
        employerId,
        status: "published",
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    for (const job of jobsCreated) {
      activities.push({
        id: `job-${job.id}`,
        type: "job_created",
        title: `"${job.title}" iş ilanı yayınlandı`,
        date: job.createdAt,
        timeAgo: formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: tr }),
        userId: job.employerId,
        user: job.employer,
        link: `/dashboard/jobs/${job.id}`,
        icon: "📋",
      });
    }

    // 4. Hackathons Created - Hangi işveren hackathon yayınlamış
    const hackathonsCreated = await db.hackathon.findMany({
      where: {
        organizerId: employerId,
        phase: { not: "draft" },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    for (const hackathon of hackathonsCreated) {
      activities.push({
        id: `hackathon-${hackathon.id}`,
        type: "hackathon_created",
        title: `"${hackathon.title}" hackathon'u yayınlandı`,
        date: hackathon.createdAt,
        timeAgo: formatDistanceToNow(new Date(hackathon.createdAt), { addSuffix: true, locale: tr }),
        userId: hackathon.organizerId,
        user: hackathon.organizer,
        link: `/dashboard/hackathons/${hackathon.id}`,
        icon: "🏆",
      });
    }

    // 5. Freelancer Projects Created - Hangi işveren freelancer projesi yayınlamış
    const freelancerProjectsCreated = await db.freelancerProject.findMany({
      where: {
        createdBy: employerId,
        status: "open",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    for (const project of freelancerProjectsCreated) {
      activities.push({
        id: `project-${project.id}`,
        type: "freelancer_project_created",
        title: `"${project.title}" freelancer projesi yayınlandı`,
        date: project.createdAt,
        timeAgo: formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: tr }),
        userId: project.createdBy,
        user: project.creator,
        link: `/dashboard/freelancer/projects/${project.id}`,
        icon: "💻",
      });
    }

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Take only the most recent ones
    const recentActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: recentActivities,
      hasMore: activities.length > limit,
    });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
