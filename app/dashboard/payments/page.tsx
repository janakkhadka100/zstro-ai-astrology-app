"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  method: "khalti" | "esewa" | "connectips";
  status: "pending" | "completed" | "failed";
  transactionId: string;
  transactionCode: string;
  createdAt: string;
  name: string | null;
  email: string | null;
};

export default function PaymentsPage() {
  const [paymentsData, setPaymentsData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10; // number of rows per page

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        setPaymentsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  // Search filter
  const filteredPayments = paymentsData.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.amount.toString().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      <input
        type="text"
        placeholder="Search payments..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset to first page when searching
        }}
        className="mb-4 p-2 border rounded w-full md:w-1/3 dark:bg-gray-700 dark:text-gray-100"
      />

      {loading ? (
        <p>Loading payments...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">#</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Name</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Email</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Amount</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Method</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Status</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Transaction ID</th>
                <th className="border border-gray-600 dark:border-gray-300 text-left p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center p-4 text-gray-500 dark:text-gray-400"
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {startIndex + index + 1}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.name ?? "-"}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.email ?? "-"}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.amount}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.method}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.status}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {payment.transactionId}
                    </td>
                    <td className="border border-gray-600 dark:border-gray-300 p-2">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-gray-300 dark:bg-gray-600" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
