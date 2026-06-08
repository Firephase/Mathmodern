"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const enroll = async () => {
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
    setLoading(false);
  };

  if (done) return <p className="text-sm text-emerald-600 font-medium">✓ Записан!</p>;

  return (
    <Button className="w-full" onClick={enroll} disabled={loading}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Записаться на курс
    </Button>
  );
}
