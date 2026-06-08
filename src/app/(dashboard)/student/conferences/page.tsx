import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateShort } from "@/lib/utils";
import { FIELD_LABELS, TIER_COLORS } from "@/types";
import { MapPin, Calendar, ExternalLink, Star } from "lucide-react";
import { ConferenceFilters } from "./ConferenceFilters";

export default async function ConferencesPage({
  searchParams,
}: {
  searchParams: { field?: string; tier?: string };
}) {
  const conferences = await prisma.conference.findMany({
    where: {
      ...(searchParams.field ? { field: searchParams.field } : {}),
      ...(searchParams.tier ? { tier: searchParams.tier } : {}),
    },
    orderBy: [{ isTop: "desc" }, { startDate: "asc" }],
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Конференции & Симпозиумы</h1>
        <p className="text-muted-foreground mt-1">
          Топ мировые конференции по математике, физике, биологии и CS
        </p>
      </div>

      <ConferenceFilters selected={searchParams} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Всего конференций", value: conferences.length },
          { label: "Уровня A*", value: conferences.filter(c => c.tier === "A*").length },
          { label: "Топ-конференции", value: conferences.filter(c => c.isTop).length },
          { label: "Стран", value: new Set(conferences.map(c => c.country)).size },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conference grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conferences.map((conf) => (
          <Card key={conf.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  {conf.shortName && (
                    <span className="text-xs font-bold text-primary mr-2">{conf.shortName}</span>
                  )}
                  {conf.isTop && <Star className="w-3.5 h-3.5 text-amber-400 inline" />}
                </div>
                <div className="flex gap-1">
                  <Badge className={`${TIER_COLORS[conf.tier]} border-0 text-xs`}>
                    {conf.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {FIELD_LABELS[conf.field] ?? conf.field}
                  </Badge>
                </div>
              </div>

              <h3 className="font-semibold text-sm leading-tight">{conf.name}</h3>
              {conf.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{conf.description}</p>
              )}

              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {conf.city}, {conf.country}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {formatDateShort(conf.startDate)} — {formatDateShort(conf.endDate)}
                </div>
              </div>

              {conf.website && (
                <a
                  href={conf.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Сайт конференции
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
