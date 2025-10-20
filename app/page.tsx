import HomeDashboard from "./view/HomeDashboard";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // avoid static cache on Vercel

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return <HomeDashboard user={session.user} />;
}