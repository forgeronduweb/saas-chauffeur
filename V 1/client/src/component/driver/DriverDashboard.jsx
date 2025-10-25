import AvailableOffers from './AvailableOffers';

export default function DriverDashboard({ availableOffers, myApplications, activeMissions, notifications, stats, loading, onTabChange, refreshData }) {

  return (
    <div>
      {/* Course en cours */}
      {activeMissions?.find(m => m.status === 'En cours') && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg mb-6 text-white">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Course en cours</h3>
                <p className="text-blue-100 mb-1">
                  Destination: {activeMissions.find(m => m.status === 'En cours')?.destination}
                </p>
                <p className="text-blue-100">
                  Durée estimée: {activeMissions.find(m => m.status === 'En cours')?.estimatedDuration || '25 min'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium">
                  Contacter client
                </button>
                <button className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium">
                  Terminer course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offres disponibles */}
      <AvailableOffers 
        availableOffers={availableOffers}
        loading={loading}
        refreshData={refreshData}
      />
    </div>
  );
}
