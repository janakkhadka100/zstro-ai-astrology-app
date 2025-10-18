"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ProfileQuickInfo() {
  const { profile, loading } = useUserProfile();
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-xl">
            <CardContent className="p-3">
              <div className="h-3 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!profile) return null;

  const rows = [
    { label: "नाम", value: profile.name },
    { label: "जन्म मिति", value: profile.birthDate || "—" },
    { label: "समय", value: profile.birthTime || "—" },
    { label: "स्थान", value: profile.birthPlace || "—" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {rows.map((r) => (
        <Card key={r.label} className="rounded-xl">
          <CardContent className="p-3">
            <div className="text-xs opacity-60">{r.label}</div>
            <div className="text-sm font-medium">{r.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
