import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  budget: z.number().positive().optional().nullable(),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Geçersiz tarih formatı" }
    ),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const createdBy = searchParams.get("createdBy");

    const where: any = {};
    
    // Employer can see all projects or filter by their own
    if (createdBy === "me") {
      where.createdBy = session.user.id as string;
    }

    if (status) {
      where.status = status;
    }

    const projects = await db.freelancerProject.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching freelancer projects:", error);
    return NextResponse.json(
      { error: "Projeler yüklenirken bir hata oluştu" },
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

    const userId = session.user.id as string;
    const body = await request.json();
    
    const validated = projectSchema.parse(body);

    let deadlineDate: Date | null = null;
    if (validated.deadline) {
      try {
        deadlineDate = new Date(validated.deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json(
            { error: "Geçersiz tarih formatı" },
            { status: 400 }
          );
        }
      } catch (dateError) {
        return NextResponse.json(
          { error: "Geçersiz tarih formatı" },
          { status: 400 }
        );
      }
    }

    const project = await db.freelancerProject.create({
      data: {
        title: validated.title.trim(),
        description: validated.description.trim(),
        budget: validated.budget || null,
        deadline: deadlineDate,
        createdBy: userId,
        status: "open",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Geçersiz veri", 
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    console.error("Error creating freelancer project:", error);
    return NextResponse.json(
      { error: "Proje oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
