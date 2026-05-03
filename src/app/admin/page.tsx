import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminAppointments } from "@/lib/admin-appointments";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const appointments = await getAdminAppointments();

  return <AdminDashboard initialAppointments={appointments} />;
}
