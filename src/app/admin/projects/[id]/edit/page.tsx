import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = {
  title: "Edit Project — Admin",
};

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  try {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });

  if (!project) notFound();

  const projectData = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Project</h1>
        <p className="text-sm text-muted mt-1">{project.title}</p>
      </div>
      <ProjectForm project={projectData} />
    </div>
  );
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    notFound();
  }
}
