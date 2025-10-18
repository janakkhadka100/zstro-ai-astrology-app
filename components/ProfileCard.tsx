"use client";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfileCard() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-4 w-44 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="text-sm opacity-70">Not signed in</div>
        </CardHeader>
        <CardContent className="text-sm">Login/Signup गर्नुस्।</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex items-center gap-3 pb-2">
        {profile.image ? (
          <Image src={profile.image} alt={profile.name} width={36} height={36} className="rounded-full" />
        ) : <div className="size-9 rounded-full bg-gradient-to-tr from-indigo-300 to-rose-300" />}
        <div className="font-medium">{profile.name}</div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div><span className="opacity-60">Email:</span> {profile.email}</div>
        {profile.birthDate && <div><span className="opacity-60">जन्म मिति:</span> {profile.birthDate}</div>}
        {profile.birthTime && <div><span className="opacity-60">समय:</span> {profile.birthTime}</div>}
        {profile.birthPlace && <div><span className="opacity-60">स्थान:</span> {profile.birthPlace}</div>}
      </CardContent>
    </Card>
  );
}