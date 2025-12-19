import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// NextAuth v5 uses AUTH_SECRET or NEXTAUTH_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

// Warn if secret is missing, but don't throw during build
if (!authSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "⚠️  AUTH_SECRET or NEXTAUTH_SECRET environment variable is required in production. Please set it in your Vercel project settings."
    );
  } else {
    console.warn("⚠️  AUTH_SECRET or NEXTAUTH_SECRET not set. Using temporary secret for development only.");
  }
}

// Get secret with proper error handling
function getAuthSecretForConfig(): string {
  if (authSecret) {
    return authSecret;
  }
  // Allow build to proceed with temporary secret
  return "temp-dev-secret-change-in-production-please-set-auth-secret";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: getAuthSecretForConfig(),
  useSecureCookies: process.env.NODE_ENV === "production",
  // Ensure NEXTAUTH_URL is set in production
  ...(process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL
    ? { basePath: process.env.NEXTAUTH_URL }
    : {}),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const { db } = await import("@/lib/db");
          let user;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:authorize',message:'Before db.user.findUnique (login)',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          try {
            user = await db.user.findUnique({
              where: { email },
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:authorize',message:'After db.user.findUnique - success (login)',data:{foundUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          } catch (dbError: any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:authorize',message:'db.user.findUnique failed (login)',data:{errorName:dbError?.name,errorMessage:dbError?.message,errorCode:dbError?.code,errorMeta:JSON.stringify(dbError?.meta||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.error("Database connection error:", dbError);
            throw new Error("Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
          }

          if (!user) {
            return null;
          }

          // EMPLOYER-ONLY: Only allow employer role to login
          if (user.role !== "employer") {
            return null;
          }

          // Check if user has a password (OAuth users might not have one)
          if (!user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error("Auth error:", error);
          if (error.message && error.message.includes("Veritabanı")) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) {
            console.error("Google OAuth: User email is missing");
            return false;
          }

          if (!account.providerAccountId) {
            console.error("Google OAuth: Provider account ID is missing");
            return false;
          }

          const { db } = await import("@/lib/db");
          
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // EMPLOYER-ONLY: Only allow employer role to login
            if (existingUser.role !== "employer") {
              return false;
            }

            try {
              const existingAccount = await db.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: account.providerAccountId,
                  },
                },
              });

              if (!existingAccount) {
                await db.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type || "oauth",
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refresh_token: account.refresh_token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                });
              }
            } catch (accountError: any) {
              console.warn("Account model error (might need migration):", accountError);
            }
          } else {
            // Don't create new users via OAuth in employer portal
            // They must be created manually with employer role
            console.warn("Google OAuth: User not found and new user creation is disabled for employer portal");
            return false;
          }

          return true;
        } catch (error: any) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
      } else if (token.email && !token.id) {
        try {
          const { db } = await import("@/lib/db");
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            // EMPLOYER-ONLY: Verify user is still employer
            if (dbUser.role !== "employer") {
              throw new Error("User role changed");
            }
            token.id = dbUser.id;
            token.role = dbUser.role;
          } else {
            console.error("JWT callback: User not found in database:", {
              email: token.email,
            });
          }
        } catch (error) {
          console.error("Error fetching user by email in jwt callback:", error);
        }
      } else if (account?.provider === "google" && token.email && token.id) {
        try {
          const { db } = await import("@/lib/db");
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser && dbUser.role !== "employer") {
            throw new Error("User is not an employer");
          }
          if (dbUser && dbUser.id !== token.id) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error verifying user ID in jwt callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        // EMPLOYER-ONLY: Ensure role is employer
        if (token.role !== "employer") {
          throw new Error("Unauthorized: Only employers can access this portal");
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15,
      },
    },
  },
});
