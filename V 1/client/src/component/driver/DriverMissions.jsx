export default function DriverMissions({ activeMissions }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mes missions</h1>
        <p className="text-sm lg:text-base text-gray-600">Planning et suivi de vos missions acceptées</p>
      </div>

      {/* Planning de la semaine */}
      <div className="bg-white rounded-lg shadow mb-4 lg:mb-6">
        <div className="p-3 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">Planning de la semaine</h3>
        </div>
        <div className="p-3 lg:p-6">
          <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">{day}</div>
                <div className={`h-12 lg:h-20 rounded-md border-2 border-dashed ${
                  index < 3 ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                } flex items-center justify-center`}>
                  {index < 3 ? (
                    <span className="text-xs text-green-700 font-medium">Mission</span>
                  ) : (
                    <span className="text-xs text-gray-500">Libre</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missions actives */}
      <div className="space-y-3 lg:space-y-4">
        {activeMissions.map(mission => (
          <div key={mission.id} className="bg-white rounded-lg shadow">
            <div className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-3">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">{mission.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium self-start ${
                      mission.status === 'En cours' 
                        ? 'bg-green-100 text-green-800' 
                        : mission.status === 'Programmée'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  
                  <p className="text-sm lg:text-base text-gray-600 mb-3">{mission.company}</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 text-xs lg:text-sm mb-4">
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1 font-medium">{mission.date}</span>
                    </div>
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Horaires:</span>
                      <span className="ml-1 font-medium">{mission.time}</span>
                    </div>
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Rémunération:</span>
                      <span className="ml-1 font-medium text-green-600">{mission.payment}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm mb-3">
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Départ:</span>
                      <span className="ml-1 font-medium truncate">{mission.startLocation}</span>
                    </div>
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Destination:</span>
                      <span className="ml-1 font-medium truncate">{mission.endLocation}</span>
                    </div>
                  </div>

                  {mission.contact && (
                    <div className="mt-3 p-2 lg:p-3 bg-gray-50 rounded-md">
                      <p className="text-xs lg:text-sm">
                        <span className="font-medium text-gray-700">Contact: </span>
                        <span className="text-gray-600">{mission.contact.name} - {mission.contact.phone}</span>
                      </p>
                    </div>
                  )}

                  {mission.notes && (
                    <div className="mt-3 p-2 lg:p-3 bg-blue-50 rounded-md">
                      <p className="text-xs lg:text-sm">
                        <span className="font-medium text-blue-700">Notes: </span>
                        <span className="text-blue-600">{mission.notes}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2 lg:ml-6">
                  {mission.status === 'Programmée' && (
                    <>
                      <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                        Démarrer
                      </button>
                      <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm">
                        Annuler
                      </button>
                    </>
                  )}
                  {mission.status === 'En cours' && (
                    <>
                      <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Terminer
                      </button>
                      <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                        Pause
                      </button>
                    </>
                  )}
                  <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeMissions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 lg:p-12 text-center">
          <svg className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-3 lg:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Aucune mission en cours</h3>
          <p className="text-sm lg:text-base text-gray-600">Vous n'avez pas de missions programmées. Consultez les offres disponibles pour postuler.</p>
        </div>
      )}
    </div>
  );
}
