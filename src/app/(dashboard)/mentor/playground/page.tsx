import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mentors get the same playground as students
export default async function MentorPlayground() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  redirect("/student/playground");
}
