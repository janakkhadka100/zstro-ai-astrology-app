"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/useLang";
import { strings } from "@/utils/strings";

export default function PDFButtonCard({ onClick }:{ onClick?:()=>void }) {
  const { lang } = useLang(); const t = strings[lang];
  return (
    <Card className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 rounded-2xl shadow-md">
      <CardHeader className="text-center font-semibold text-violet-800">{t.pdf}</CardHeader>
      <CardContent className="text-center">
        <Button onClick={onClick} className="bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90">
          {t.pdf}
        </Button>
      </CardContent>
    </Card>
  );
}