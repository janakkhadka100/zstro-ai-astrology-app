import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/db/queries";

// Define the RouteParams interface correctly
interface RouteParams {
  params: Promise<{ email: string }>; // Use Promise for params
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { email } = await context.params; // Await the params to resolve the Promise
    console.log("Fetching user with email:", email);

    const user = await getUserRole(email);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}