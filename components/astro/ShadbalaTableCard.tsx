"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ShadbalaData {
  total: number;
  sthana: number;
  dig: number;
  kala: number;
  chestha: number;
  naisargika: number;
}

interface PlanetRow {
  planet: string;
  shadbala: ShadbalaData | null;
}

interface ShadbalaTableCardProps {
  rows: PlanetRow[];
}

export function ShadbalaTableCard({ rows }: ShadbalaTableCardProps) {
  // Filter planets that have shadbala data
  const planetsWithShadbala = rows.filter(row => row.shadbala !== null);
  
  if (planetsWithShadbala.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            षड्बल विश्लेषण / Shadbala Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No shadbala data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          षड्बल विश्लेषण / Shadbala Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ग्रह / Planet</TableHead>
                <TableHead className="w-[80px]">कुल / Total</TableHead>
                <TableHead className="w-[80px]">स्थाना / Sthana</TableHead>
                <TableHead className="w-[80px]">दिग / Dig</TableHead>
                <TableHead className="w-[80px]">काल / Kala</TableHead>
                <TableHead className="w-[80px]">चेष्टा / Cheshta</TableHead>
                <TableHead className="w-[80px]">नैसर्गिक / Naisargika</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planetsWithShadbala.map((row, index) => {
                const shadbala = row.shadbala!;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {row.planet}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">
                        {shadbala.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {shadbala.sthana.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {shadbala.dig.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {shadbala.kala.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {shadbala.chestha.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {shadbala.naisargika.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Shadbala interpretation */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            षड्बल व्याख्या / Shadbala Interpretation
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>स्थाना (Sthana):</strong> Positional strength based on sign placement</p>
            <p><strong>दिग (Dig):</strong> Directional strength based on house placement</p>
            <p><strong>काल (Kala):</strong> Temporal strength based on time factors</p>
            <p><strong>चेष्टा (Cheshta):</strong> Motional strength based on movement</p>
            <p><strong>नैसर्गिक (Naisargika):</strong> Natural strength inherent to the planet</p>
            <p><strong>कुल (Total):</strong> Combined strength of all six components</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
