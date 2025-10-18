"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function YogDoshGrid({ yogas, doshas, loading }:{
  yogas: { label:string; factors:string[] }[];
  doshas: { label:string; factors:string[] }[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({length:4}).map((_,i)=>
          <Card key={i} className="rounded-2xl shadow-sm"><CardContent className="h-16 bg-muted rounded"/></Card>
        )}
      </div>
    );
  }
  const Item = ({title, sub}:{title:string; sub:string}) => (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-1 font-medium">{title}</CardHeader>
      <CardContent className="text-xs opacity-80">{sub}</CardContent>
    </Card>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {yogas?.map((y,i)=> <Item key={`y-${i}`} title={`✅ ${y.label}`} sub={(y.factors||[]).join(", ") || "—"} />)}
      {doshas?.map((d,i)=> <Item key={`d-${i}`} title={`⚠️ ${d.label}`} sub={(d.factors||[]).join(", ") || "—"} />)}
    </div>
  );
}
