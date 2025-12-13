import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, you'd delete the ScheduledInterview record:
    // await db.scheduledInterview.delete({
    //   where: { id: params.id },
    // });

    // For now, return success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error cancelling interview:", error);
    return NextResponse.json(
      { error: "Failed to cancel interview" },
      { status: 500 }
    );
  }
}
