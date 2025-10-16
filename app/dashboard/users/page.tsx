"use client";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { useEffect, useState, useMemo } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  coins: number;
  role: string;
  lastMessageAt: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [coinsToAdd, setCoinsToAdd] = useState(0);
  const [search, setSearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function handleAddCoins() {
    if (!editingUser) return;

    await fetch(`/api/user/${editingUser.id}/coins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinsToAdd }),
    });

    // Update local state
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id ? { ...u, coins: u.coins + coinsToAdd } : u
      )
    );

    setEditingUser(null);
    setCoinsToAdd(0);
  }

  // 🔹 Filter users by search
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // 🔹 Paginated users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIdx = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + usersPerPage);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {/* 🔹 Search Box */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset to page 1 on new search
        }}
        placeholder="Search by name or email..."
        className="mb-4 p-2 border rounded w-full max-w-sm dark:bg-gray-700 dark:text-white"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded">
            <thead className="text-left">
              <tr>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">#</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Name</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Email</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Coins</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Role</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Last Message</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, idx) => (
                <tr key={u.id}>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{startIdx + idx + 1}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{u.name}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{u.email}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{u.coins}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{u.role}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">{u.lastMessageAt ? new Date(u.lastMessageAt).toLocaleString() : "No messages"}</td>
                  <td className="border border-gray-600 dark:border-gray-300 p-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Add Coins
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔹 Pagination Controls */}
          <div className="flex justify-center items-center mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* 🔹 Modal for adding coins */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded shadow w-80">
            <h2 className="text-lg font-bold mb-4">
              Add Coins for {editingUser.name}
            </h2>
            <input
              type="number"
              value={coinsToAdd}
              onChange={(e) => setCoinsToAdd(Number(e.target.value))}
              className="w-full p-2 border rounded mb-4 dark:bg-gray-600 dark:text-white"
              placeholder="Enter coins to add"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCoins}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
