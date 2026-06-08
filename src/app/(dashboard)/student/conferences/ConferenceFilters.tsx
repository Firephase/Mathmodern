"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FIELD_LABELS } from "@/types";

const FIELDS = Object.entries(FIELD_LABELS);
const TIERS = ["A*", "A", "B"];

interface Props {
  selected: { field?: string; tier?: string };
}

export function ConferenceFilters({ selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "field" && selected.field) params.set("field", selected.field);
    if (key !== "tier" && selected.tier) params.set("tier", selected.tier);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clear = () => router.push(pathname);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex gap-2 flex-wrap">
        <Button variant={!selected.field ? "default" : "outline"} size="sm" onClick={clear}>Все области</Button>
        {FIELDS.map(([key, label]) => (
          <Button
            key={key}
            variant={selected.field === key ? "default" : "outline"}
            size="sm"
            onClick={() => update("field", selected.field === key ? "" : key)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {TIERS.map(t => (
          <Button
            key={t}
            variant={selected.tier === t ? "default" : "outline"}
            size="sm"
            onClick={() => update("tier", selected.tier === t ? "" : t)}
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}
