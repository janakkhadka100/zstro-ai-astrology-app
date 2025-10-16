import Card from "./components/Card";

export default function DashboardPage() {
  return (
    <>  
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Total Users" value={120} />
      </div>

      {/* Charts */}
    </>
  );
}
