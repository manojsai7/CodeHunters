import { CourseForm } from "@/components/admin/course-form";

export const metadata = {
  title: "Create Course — Admin",
};

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Course</h1>
        <p className="text-sm text-muted mt-1">Add a new course to the platform</p>
      </div>
      <CourseForm />
    </div>
  );
}
