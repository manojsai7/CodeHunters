import { createAdminSupabaseClient } from "./server";

// Convenience singleton for API routes that need service-role access
export const adminSupabase = createAdminSupabaseClient();
