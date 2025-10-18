import KundaliForm from '@/components/kundali/KundaliForm';

export default function KundaliPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            कुण्डली जनरेटर
          </h1>
          <p className="text-xl text-gray-300">
            आफ्नो जन्म विवरण प्रविष्ट गरेर कुण्डली बनाउनुहोस्
          </p>
        </div>
        <KundaliForm />
      </div>
    </div>
  );
}
