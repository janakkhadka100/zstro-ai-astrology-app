import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

export async function GET() {
  try {
    // Get session using the auth function
    const session = await auth();
    
    // Extract user from session
    const user = session?.user as any | undefined;

    // Map to the fields you want shown in UI
    const profile = user
      ? {
          id: user.id ?? "",
          name: user.name ?? "",
          email: user.email ?? "",
          avatar: user.image ?? "",
          // Domain-specific astrology fields saved at signup:
          birthDate: user.birthDate ?? "",   // e.g., "1990-05-15"
          birthTime: user.birthTime ?? "",   // e.g., "10:30"
          birthPlace: user.birthPlace ?? "", // e.g., "Kathmandu"
          lang: user.lang ?? "ne",
        }
      : null;

    return NextResponse.json({ ok: true, profile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ ok: false, profile: null }, { status: 500 });
  }
}
