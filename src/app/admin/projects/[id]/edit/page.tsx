import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = {
  title: "Edit Project — Admin",
};

export default async function EditProjectPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  try {
  const db = createAdminSupabaseClient();

  const { data: project } = await db
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Project</h1>
        <p className="text-sm text-muted mt-1">{project.title}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    notFound();
  }
}
