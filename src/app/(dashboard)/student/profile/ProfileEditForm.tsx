"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";

interface Props {
  initialData: {
    name: string;
    bio: string;
    institution: string;
    country: string;
    interests: string[];
    careerGoal: string;
  };
}

export function ProfileEditForm({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const addInterest = () => {
    const t = interestInput.trim();
    if (t && !form.interests.includes(t)) {
      setForm(f => ({ ...f, interests: [...f.interests, t] }));
      setInterestInput("");
    }
  };

  const save = async () => {
    setLoading(true);
    await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Редактировать профиль</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Организация</Label>
            <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="МГУ, НГУ..." />
          </div>
        </div>
        <div className="space-y-2">
          <Label>О себе</Label>
          <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Краткая биография..." rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Карьерная цель</Label>
          <Input value={form.careerGoal} onChange={e => setForm(f => ({ ...f, careerGoal: e.target.value }))} placeholder="Исследователь в области топологии..." />
        </div>
        <div className="space-y-2">
          <Label>Интересы</Label>
          <div className="flex gap-2">
            <Input value={interestInput} onChange={e => setInterestInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInterest())}
              placeholder="Топология, Алгебра..." />
            <Button type="button" variant="outline" onClick={addInterest}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.interests.map(i => (
              <Badge key={i} variant="secondary" className="gap-1">
                {i}
                <button type="button" onClick={() => setForm(f => ({ ...f, interests: f.interests.filter(x => x !== i) }))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <Button onClick={save} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {saved ? "✓ Сохранено!" : "Сохранить"}
        </Button>
      </CardContent>
    </Card>
  );
}
