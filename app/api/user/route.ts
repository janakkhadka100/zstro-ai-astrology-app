import { getAllUsers } from "@/lib/db/queries";


export async function GET(): Promise<Response>  {
  const users = await getAllUsers();

  if (!users) {
    return new Response("No users found", { status: 404 });
  }

  return new Response(JSON.stringify(users), { status: 200 });
}