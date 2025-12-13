import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const candidateId = params.candidateId;

    // For now, we'll use a simple approach - create a direct message thread
    // In production, you'd want a proper DirectMessage model
    // For this implementation, we'll use ChatGroup with private visibility
    
    // Find or create a private chat group between employer and candidate
    let chatGroup = await db.chatGroup.findFirst({
      where: {
        visibility: "private",
        memberships: {
          every: {
            userId: { in: [employerId, candidateId] },
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    // If no group exists, create one
    if (!chatGroup) {
      const slug = `direct-${employerId}-${candidateId}`;
      chatGroup = await db.chatGroup.create({
        data: {
          name: "Direct Message",
          slug,
          visibility: "private",
          createdById: employerId,
          memberships: {
            create: [
              { userId: employerId, role: "admin" },
              { userId: candidateId, role: "member" },
            ],
          },
        },
        include: {
          memberships: true,
        },
      });
    }

    // Get messages
    const messages = await db.chatMessage.findMany({
      where: {
        groupId: chatGroup.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to simple message format
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content || "",
      senderId: msg.userId,
      receiverId: msg.userId === employerId ? candidateId : employerId,
      createdAt: msg.createdAt.toISOString(),
      sender: msg.user,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { candidateId: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const candidateId = params.candidateId;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Find or create chat group
    let chatGroup = await db.chatGroup.findFirst({
      where: {
        visibility: "private",
        memberships: {
          every: {
            userId: { in: [employerId, candidateId] },
          },
        },
      },
    });

    if (!chatGroup) {
      const slug = `direct-${employerId}-${candidateId}`;
      chatGroup = await db.chatGroup.create({
        data: {
          name: "Direct Message",
          slug,
          visibility: "private",
          createdById: employerId,
          memberships: {
            create: [
              { userId: employerId, role: "admin" },
              { userId: candidateId, role: "member" },
            ],
          },
        },
      });
    }

    // Create message
    const message = await db.chatMessage.create({
      data: {
        groupId: chatGroup.id,
        userId: employerId,
        type: "text",
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Create receipt for sender
    await db.chatMessageReceipt.create({
      data: {
        messageId: message.id,
        userId: employerId,
      },
    });

    // Update last seen
    await db.chatGroupMembership.update({
      where: {
        groupId_userId: {
          groupId: chatGroup.id,
          userId: employerId,
        },
      },
      data: {
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content || "",
        senderId: message.userId,
        receiverId: candidateId,
        createdAt: message.createdAt.toISOString(),
        sender: message.user,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
