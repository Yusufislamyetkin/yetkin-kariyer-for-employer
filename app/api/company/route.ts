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

    const company = await db.company.findUnique({
      where: { employerId },
    });

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user?.id as string;
    const body = await request.json();

    // Check if company exists
    const existingCompany = await db.company.findUnique({
      where: { employerId },
    });

    let company;
    if (existingCompany) {
      // Update existing company
      company = await db.company.update({
        where: { employerId },
        data: {
          name: body.name,
          logo: body.logo || null,
          description: body.description || null,
          website: body.website || null,
          address: body.address || null,
          phone: body.phone || null,
          email: body.email || null,
          linkedin: body.linkedin || null,
          twitter: body.twitter || null,
          instagram: body.instagram || null,
        },
      });
    } else {
      // Create new company
      company = await db.company.create({
        data: {
          employerId,
          name: body.name,
          logo: body.logo || null,
          description: body.description || null,
          website: body.website || null,
          address: body.address || null,
          phone: body.phone || null,
          email: body.email || null,
          linkedin: body.linkedin || null,
          twitter: body.twitter || null,
          instagram: body.instagram || null,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}
