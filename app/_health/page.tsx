export default function HealthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100 text-green-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Health Check: OK</h1>
        <p className="text-lg">All systems operational</p>
        <div className="mt-4 text-sm text-green-600">
          <p>• Kundali page: /kundali</p>
          <p>• Test page: /kundali-test</p>
          <p>• Vedic demo: /vedic-demo</p>
        </div>
      </div>
    </div>
  );
}