import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminAppointments } from "@/lib/admin-appointments";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const initialData = await getAdminAppointments({ page: 1, pageSize: 20 });

  return (
    <AdminDashboard
      initialAppointments={initialData.data}
      initialPage={initialData.page}
      initialPageSize={initialData.pageSize}
      initialTotal={initialData.total}
      initialTotalPages={initialData.totalPages}
    />
  );
}
