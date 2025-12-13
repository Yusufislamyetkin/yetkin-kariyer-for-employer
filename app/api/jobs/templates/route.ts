import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;

    const templates = await db.jobTemplate.findMany({
      where: { employerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const body = await request.json();
    const { name, title, description, requirements, location, salary } = body;

    if (!name || !title || !description) {
      return NextResponse.json(
        { error: "Name, title, and description are required" },
        { status: 400 }
      );
    }

    const template = await db.jobTemplate.create({
      data: {
        employerId,
        name,
        title,
        description,
        requirements: requirements || {},
        location: location || null,
        salary: salary || null,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 }
    );
  }
}
