import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/app/dashboard/layout-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error: any) {
    console.error("Auth error in dashboard layout:", error);
    redirect("/login?error=auth_failed");
  }

  if (!session) {
    redirect("/login");
  }

  // EMPLOYER-ONLY: Check if user is employer
  const userRole = (session.user as any)?.role;
  if (userRole !== "employer") {
    redirect("/login");
  }

  return <DashboardLayoutClient session={session}>{children}</DashboardLayoutClient>;
}

