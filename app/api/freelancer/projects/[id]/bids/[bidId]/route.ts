import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Check if project exists and belongs to employer
    const project = await db.freelancerProject.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }

    if (project.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if bid exists
    const bid = await db.freelancerBid.findUnique({
      where: { id: params.bidId },
    });

    if (!bid) {
      return NextResponse.json({ error: "Teklif bulunamadı" }, { status: 404 });
    }

    if (bid.projectId !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If accepting a bid, reject all other bids for this project
    if (status === "accepted") {
      await db.freelancerBid.updateMany({
        where: {
          projectId: params.id,
          id: { not: params.bidId },
          status: { not: "rejected" },
        },
        data: {
          status: "rejected",
        },
      });

      // Update project status
      await db.freelancerProject.update({
        where: { id: params.id },
        data: {
          status: "in_progress",
        },
      });
    }

    const updatedBid = await db.freelancerBid.update({
      where: { id: params.bidId },
      data: {
        status: status || bid.status,
      },
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
    });

    return NextResponse.json({ bid: updatedBid });
  } catch (error) {
    console.error("Error updating bid:", error);
    return NextResponse.json(
      { error: "Teklif güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
