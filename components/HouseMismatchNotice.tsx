"use client";

export function HouseMismatchNotice({ mismatches }: { mismatches: {planet: string; apiHouse?: number|null; derivedHouse: number}[] }) {
  if (!mismatches?.length) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-900 dark:text-amber-200">
      <div className="font-medium mb-1">API house mismatch detected:</div>
      <ul className="list-disc ml-5">
        {mismatches.map(m => (
          <li key={m.planet}>
            {m.planet}: API={m.apiHouse ?? "—"} vs Derived={m.derivedHouse} — using Derived.
          </li>
        ))}
      </ul>
    </div>
  );
}
