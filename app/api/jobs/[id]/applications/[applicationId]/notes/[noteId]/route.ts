import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string; noteId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const noteId = params.noteId;
    const body = await request.json();

    // Verify note belongs to employer
    const note = await db.applicationNote.findUnique({
      where: { id: noteId },
      select: { employerId: true },
    });

    if (!note || note.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update note
    const updated = await db.applicationNote.update({
      where: { id: noteId },
      data: {
        content: body.content,
        category: body.category || null,
        isPrivate: body.isPrivate || false,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ note: updated });
  } catch (error: any) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string; noteId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const noteId = params.noteId;

    // Verify note belongs to employer
    const note = await db.applicationNote.findUnique({
      where: { id: noteId },
      select: { employerId: true },
    });

    if (!note || note.employerId !== employerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete note
    await db.applicationNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
