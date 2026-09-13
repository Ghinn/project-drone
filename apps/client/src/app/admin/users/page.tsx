import UserManagementSection from "@/components/admin/sections/user-management-section";

export default function UsersPage() {
  return (
    <main className="flex flex-col min-h-full w-full animate-in fade-in duration-200">
      <UserManagementSection />
    </main>
  );
}