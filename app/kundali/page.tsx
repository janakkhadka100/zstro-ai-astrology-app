import KundaliForm from '@/components/kundali/KundaliForm';

export default function KundaliPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KundaliForm />
      </div>
    </div>
  );
}
