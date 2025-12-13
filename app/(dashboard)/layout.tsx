import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
