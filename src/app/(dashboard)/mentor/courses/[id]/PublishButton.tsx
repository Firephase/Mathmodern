"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, EyeOff } from "lucide-react";

export function PublishButton({ courseId, isPublished }: { courseId: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant={isPublished ? "outline" : "default"} onClick={toggle} disabled={loading}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {isPublished ? (
        <><EyeOff className="w-4 h-4 mr-2" />Снять с публикации</>
      ) : (
        <><Globe className="w-4 h-4 mr-2" />Опубликовать</>
      )}
    </Button>
  );
}
