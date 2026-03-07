import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
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

  // Verify the user has purchased this project
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      projectId,
      status: "completed",
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 403 });
  }

  // Fetch project zip path
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { zipUrl: true },
  });

  if (!project?.zipUrl) {
    return NextResponse.json({ error: "Project file not found" }, { status: 404 });
  }

  // Generate 60-second signed URL — never expose raw storage URL
  const adminSupabase = createAdminSupabaseClient();
  const { data: signedUrl, error } = await adminSupabase.storage
    .from("project-files")
    .createSignedUrl(project.zipUrl, 60);

  if (error || !signedUrl?.signedUrl) {
    console.error("Failed to create signed URL:", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }

  return NextResponse.json({ url: signedUrl.signedUrl });
}
