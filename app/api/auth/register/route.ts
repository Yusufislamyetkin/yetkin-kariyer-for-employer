import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check database connection
    let existingUser;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/register/route.ts:POST',message:'Before db.user.findUnique',data:{email:validatedData.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/register/route.ts:POST',message:'After db.user.findUnique - success',data:{foundUser:!!existingUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } catch (dbError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a8c809a5-2e2a-4594-9201-a710299032db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/register/route.ts:POST',message:'db.user.findUnique failed',data:{errorName:dbError?.name,errorMessage:dbError?.message,errorCode:dbError?.code,errorMeta:JSON.stringify(dbError?.meta||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    let user;
    try {
      user = await db.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role || "employer", // Default to employer for YTK Career
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    } catch (createError: any) {
      console.error("User creation error:", createError);
      // Handle unique constraint violations
      if (createError.code === "P2002") {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Kullanıcı oluşturulurken bir hata oluştu" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
