import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  projectId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { projectId } = parsed.data;
  const db = createAdminSupabaseClient();

  // Verify the user has purchased this project
  const { data: purchase } = await db
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .eq("status", "completed")
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 403 });
  }

  // Fetch project zip path
  const { data: project } = await db
    .from("projects")
    .select("zip_url")
    .eq("id", projectId)
    .single();

  if (!project?.zip_url) {
    return NextResponse.json({ error: "Project file not found" }, { status: 404 });
  }

  // Generate 60-second signed URL — never expose raw storage URL
  const { data: signedUrl, error } = await db.storage
    .from("project-files")
    .createSignedUrl(project.zip_url, 60);

  if (error || !signedUrl?.signedUrl) {
    console.error("Failed to create signed URL:", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }

  return NextResponse.json({ url: signedUrl.signedUrl });
}
