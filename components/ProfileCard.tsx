"use client";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfileCard() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="pb-2">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-44 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="pb-2">
          <div className="text-sm opacity-70">Not signed in</div>
        </CardHeader>
        <CardContent>
          <div className="text-sm">कृपया Login/Signup गर्नुहोस्।</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <div className="size-9 rounded-full bg-gradient-to-tr from-indigo-300 to-rose-300 flex items-center justify-center text-white font-semibold text-sm">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="font-medium">{profile.name}</div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div><span className="opacity-60">Email:</span> {profile.email}</div>
        {profile.birthDate && (
          <div><span className="opacity-60">जन्म मिति:</span> {profile.birthDate}</div>
        )}
        {profile.birthTime && (
          <div><span className="opacity-60">समय:</span> {profile.birthTime}</div>
        )}
        {profile.birthPlace && (
          <div><span className="opacity-60">स्थान:</span> {profile.birthPlace}</div>
        )}
        {profile.lang && (
          <div><span className="opacity-60">Language:</span> {profile.lang.toUpperCase()}</div>
        )}
      </CardContent>
    </Card>
  );
}
