import KundaliForm from '@/components/kundali/KundaliForm';
import ProfileCard from '@/components/ProfileCard';
import { ProfileQuickInfo } from '@/components/ProfileQuickInfo';

export default function KundaliPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top strip shows user quick info */}
        <div className="mb-6">
          <ProfileQuickInfo />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left: Profile & actions */}
          <div className="space-y-4">
            <ProfileCard />
            {/* You can add quick actions, e.g., "Use profile details to prefill form" */}
          </div>

          {/* Right: Kundali Form */}
          <div className="space-y-4">
            <KundaliForm />
          </div>
        </div>
      </div>
    </div>
  );
}
