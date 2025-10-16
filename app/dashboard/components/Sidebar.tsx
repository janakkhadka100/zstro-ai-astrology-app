import Link from "next/link";

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  return (
    <aside className={`bg-white dark:bg-gray-800 w-64 p-4 border-r transition-transform ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Admin</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Dashboard</Link>
        <Link href="/dashboard/users" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Users</Link>
        <Link href="/dashboard/payments" className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Payments</Link>
      </nav>
    </aside>
  );
}
