import { updateUserCoins } from "@/lib/db/queries";
import type { NextRequest } from "next/server";

// Define the RouteParams interface correctly
interface RouteParams {
  params: Promise<{ id: string }>; // Use Promise for params
}

export const POST = async (req: NextRequest, context: RouteParams): Promise<Response> => {
  const { id } = await context.params; // Await the params to resolve the Promise
  const { coinsToAdd } = await req.json();

  await updateUserCoins(id, coinsToAdd);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};