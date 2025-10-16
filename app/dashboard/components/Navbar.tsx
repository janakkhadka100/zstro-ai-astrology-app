import Link from "next/link";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <button onClick={toggleSidebar} className="md:hidden p-2 border rounded dark:border-gray-600">
        ☰
      </button>
      <div className="text-gray-900 dark:text-gray-100">Admin</div>
      <div className="flex justify-end space-x-4">
        <Link href="/">
          <button className="p-2 border rounded dark:border-gray-600">Chat</button>
        </Link>
      </div>
    </header>
  );
}
