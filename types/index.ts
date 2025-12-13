export type UserRole = "candidate" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string | null;
}
