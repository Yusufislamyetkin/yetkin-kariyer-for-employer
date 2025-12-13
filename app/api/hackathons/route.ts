import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createHackathonSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(2000).optional(),
  bannerUrl: z.string().url().optional(),
  visibility: z.enum(["public", "invite_only", "private"]).default("public"),
  applicationOpensAt: z.string().transform((str) => new Date(str)),
  applicationClosesAt: z.string().transform((str) => new Date(str)),
  submissionOpensAt: z.string().transform((str) => new Date(str)),
  submissionClosesAt: z.string().transform((str) => new Date(str)),
  judgingOpensAt: z.string().transform((str) => new Date(str)).optional(),
  judgingClosesAt: z.string().transform((str) => new Date(str)).optional(),
  timezone: z.string().default("UTC"),
  maxParticipants: z.number().int().positive().optional(),
  minTeamSize: z.number().int().min(1).max(10).default(1),
  maxTeamSize: z.number().int().min(1).max(10).default(4),
  tags: z.array(z.string()).default([]),
  requirements: z.any().optional(),
  prizesSummary: z.string().max(500).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get("organizerId");
    const phase = searchParams.get("phase");

    const where: any = {};

    // Employer can see all hackathons or filter by organizer
    if (organizerId === "me") {
      where.organizerId = session.user.id as string;
    }

    if (phase) {
      where.phase = phase;
    }

    const hackathons = await db.hackathon.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            applications: true,
            teams: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ hackathons });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return NextResponse.json(
      { error: "Hackathon'lar yüklenirken bir hata oluştu" },
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
    const data = createHackathonSchema.parse(body);

    // Validate dates
    if (data.applicationOpensAt >= data.applicationClosesAt) {
      return NextResponse.json(
        { error: "Başvuru bitiş tarihi başlangıç tarihinden sonra olmalıdır." },
        { status: 400 }
      );
    }

    if (data.applicationClosesAt > data.submissionOpensAt) {
      return NextResponse.json(
        { error: "Başvuru dönemi, proje teslim döneminden önce kapanmalıdır." },
        { status: 400 }
      );
    }

    if (data.submissionOpensAt >= data.submissionClosesAt) {
      return NextResponse.json(
        { error: "Teslim bitiş tarihi teslim başlangıç tarihinden sonra olmalıdır." },
        { status: 400 }
      );
    }

    if (data.minTeamSize > data.maxTeamSize) {
      return NextResponse.json(
        { error: "Minimum takım üyesi sayısı maksimumdan büyük olamaz." },
        { status: 400 }
      );
    }

    const hackathon = await db.hackathon.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        bannerUrl: data.bannerUrl,
        visibility: data.visibility as any,
        applicationOpensAt: data.applicationOpensAt,
        applicationClosesAt: data.applicationClosesAt,
        submissionOpensAt: data.submissionOpensAt,
        submissionClosesAt: data.submissionClosesAt,
        judgingOpensAt: data.judgingOpensAt,
        judgingClosesAt: data.judgingClosesAt,
        timezone: data.timezone,
        maxParticipants: data.maxParticipants,
        minTeamSize: data.minTeamSize,
        maxTeamSize: data.maxTeamSize,
        tags: data.tags.map((tag) => tag.toLowerCase()),
        requirements: data.requirements || {},
        prizesSummary: data.prizesSummary,
        organizerId: session.user.id as string,
        phase: "draft",
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
    });

    return NextResponse.json({ hackathon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    if ((error as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor." },
        { status: 409 }
      );
    }

    console.error("Error creating hackathon:", error);
    return NextResponse.json(
      { error: "Hackathon oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
