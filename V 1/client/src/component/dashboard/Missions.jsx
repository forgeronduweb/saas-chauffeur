export default function Missions({ activeMissions }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Missions en cours</h1>
        <p className="text-sm lg:text-base text-gray-600">Suivi de vos chauffeurs engagés</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-3 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">Contrats actifs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {activeMissions.map(mission => (
            <div key={mission.id} className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                <div className="flex-1">
                  <h4 className="text-base lg:text-lg font-medium text-gray-900">{mission.driver}</h4>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">{mission.mission}</p>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">
                    Du {mission.startDate} au {mission.endDate}
                  </p>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full self-start lg:self-auto">
                    {mission.status}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm lg:text-sm bg-indigo-50 lg:bg-transparent px-3 py-2 lg:px-0 lg:py-0 rounded-md lg:rounded-none hover:bg-indigo-100 lg:hover:bg-transparent transition-colors">
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
