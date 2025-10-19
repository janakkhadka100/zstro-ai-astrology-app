"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanetRow {
  planet: string;
  signId: number;
  signLabel: string;
  degree: number | null;
  house: number | null;
  safeHouse: number;
  shadbala: {
    total: number;
    sthana: number;
    dig: number;
    kala: number;
    chestha: number;
    naisargika: number;
  } | null;
}

interface PlanetTableCardProps {
  rows: PlanetRow[];
}

export function PlanetTableCard({ rows }: PlanetTableCardProps) {
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            ग्रह स्थिति / Planet Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No planet data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          ग्रह स्थिति / Planet Positions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ग्रह / Planet</TableHead>
                <TableHead className="w-[120px]">राशि / Sign</TableHead>
                <TableHead className="w-[80px]">घर / House</TableHead>
                <TableHead className="w-[100px]">डिग्री / Degree</TableHead>
                <TableHead className="w-[120px]">षड्बल / Shadbala</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {row.planet}
                  </TableCell>
                  <TableCell>
                    {row.signLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{row.safeHouse}</span>
                      {row.house !== null && row.house !== row.safeHouse && (
                        <span className="text-xs text-gray-500">
                          (API: {row.house})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.degree !== null ? `${row.degree.toFixed(2)}°` : "—"}
                  </TableCell>
                  <TableCell>
                    {row.shadbala ? (
                      <div className="text-sm">
                        <div className="font-medium">{row.shadbala.total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          S: {row.shadbala.sthana.toFixed(1)} | D: {row.shadbala.dig.toFixed(1)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not available</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Notes about house corrections */}
        {rows.some(row => row.house !== null && row.house !== row.safeHouse) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Some houses were corrected using derived calculations from ascendant. 
              API house values are shown in parentheses where they differ.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
