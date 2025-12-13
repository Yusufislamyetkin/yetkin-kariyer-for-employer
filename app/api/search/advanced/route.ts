import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, filters } = body;

    if (type === "cv") {
      // Advanced CV search
      const { skills, minExperience, education, location, minScore } = filters || {};

      const cvs = await db.cv.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          template: {
            select: {
              name: true,
            },
          },
        },
        take: 100,
      });

      // Filter CVs based on criteria
      let filteredCVs = cvs;

      if (skills && Array.isArray(skills) && skills.length > 0) {
        filteredCVs = filteredCVs.filter((cv: any) => {
          const cvData = cv.data as any;
          const cvSkills = cvData?.skills || [];
          const skillNames = cvSkills.map((s: any) =>
            typeof s === "string" ? s.toLowerCase() : (s.name || s.technology || "").toLowerCase()
          );
          return skills.some((skill: string) =>
            skillNames.some((cvSkill: string) => cvSkill.includes(skill.toLowerCase()))
          );
        });
      }

      if (minExperience) {
        filteredCVs = filteredCVs.filter((cv: any) => {
          const cvData = cv.data as any;
          const experience = cvData?.experience || [];
          return experience.length >= parseInt(minExperience);
        });
      }

      if (education) {
        filteredCVs = filteredCVs.filter((cv: any) => {
          const cvData = cv.data as any;
          const educationData = cvData?.education || [];
          return educationData.some((edu: any) =>
            (edu.degree || edu.school || "").toLowerCase().includes(education.toLowerCase())
          );
        });
      }

      return NextResponse.json({ results: filteredCVs, count: filteredCVs.length });
    } else if (type === "application") {
      // Advanced application search
      const { jobId, status, minScore, dateFrom, dateTo, candidateName } = filters || {};

      const where: any = {
        job: {
          employerId: session.user?.id as string,
        },
      };

      if (jobId) {
        where.jobId = jobId;
      }

      if (status) {
        where.status = status;
      }

      if (minScore) {
        where.score = { gte: parseInt(minScore) };
      }

      if (dateFrom || dateTo) {
        where.appliedAt = {};
        if (dateFrom) {
          where.appliedAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.appliedAt.lte = new Date(dateTo);
        }
      }

      const applications = await db.jobApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
        orderBy: {
          appliedAt: "desc",
        },
        take: 100,
      });

      // Filter by candidate name if provided
      let filteredApplications = applications;
      if (candidateName) {
        filteredApplications = applications.filter((app: any) =>
          app.user.name?.toLowerCase().includes(candidateName.toLowerCase()) ||
          app.user.email.toLowerCase().includes(candidateName.toLowerCase())
        );
      }

      return NextResponse.json({
        results: filteredApplications,
        count: filteredApplications.length,
      });
    }

    return NextResponse.json(
      { error: "Invalid search type. Use 'cv' or 'application'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error performing advanced search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
