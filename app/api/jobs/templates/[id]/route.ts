import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const templateId = params.id;
    const body = await request.json();

    // Verify template belongs to employer
    const template = await db.jobTemplate.findUnique({
      where: { id: templateId },
      select: { employerId: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update template
    const updated = await db.jobTemplate.update({
      where: { id: templateId },
      data: {
        name: body.name,
        title: body.title,
        description: body.description,
        requirements: body.requirements || {},
        location: body.location || null,
        salary: body.salary || null,
      },
    });

    return NextResponse.json({ template: updated });
  } catch (error: any) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const templateId = params.id;

    // Verify template belongs to employer
    const template = await db.jobTemplate.findUnique({
      where: { id: templateId },
      select: { employerId: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete template
    await db.jobTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
