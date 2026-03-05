import { ProjectForm } from "@/components/admin/project-form";

export const metadata = {
  title: "Create Project — Admin",
};

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Project</h1>
        <p className="text-sm text-muted mt-1">Add a new project to the marketplace</p>
      </div>
      <ProjectForm />
    </div>
  );
}
