import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Админка — НашФит",
};

export default function AdminLayout({ children }) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
