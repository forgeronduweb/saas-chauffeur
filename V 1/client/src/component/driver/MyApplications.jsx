import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export default function MyApplications({ myApplications, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mes candidatures</h1>
        <p className="text-sm lg:text-base text-gray-600">Suivez l'état de vos candidatures envoyées</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 lg:gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-2 lg:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center text-center lg:text-left">
            <div className="p-1 lg:p-2 bg-yellow-100 rounded-lg mx-auto lg:mx-0 mb-2 lg:mb-0">
              <svg className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="lg:ml-3">
              <p className="text-xs lg:text-sm font-medium text-gray-600">En attente</p>
              {loading ? (
                <div className="h-4 lg:h-6 bg-gray-200 rounded w-6 lg:w-8 animate-pulse mx-auto lg:mx-0"></div>
              ) : (
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {myApplications?.filter(app => app.status === 'pending').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-2 lg:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center text-center lg:text-left">
            <div className="p-1 lg:p-2 bg-green-100 rounded-lg mx-auto lg:mx-0 mb-2 lg:mb-0">
              <svg className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="lg:ml-3">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Acceptées</p>
              {loading ? (
                <div className="h-4 lg:h-6 bg-gray-200 rounded w-6 lg:w-8 animate-pulse mx-auto lg:mx-0"></div>
              ) : (
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {myApplications?.filter(app => app.status === 'accepted').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-2 lg:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center text-center lg:text-left">
            <div className="p-1 lg:p-2 bg-red-100 rounded-lg mx-auto lg:mx-0 mb-2 lg:mb-0">
              <svg className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="lg:ml-3">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Refusées</p>
              {loading ? (
                <div className="h-4 lg:h-6 bg-gray-200 rounded w-6 lg:w-8 animate-pulse mx-auto lg:mx-0"></div>
              ) : (
                <p className="text-sm lg:text-lg font-semibold text-gray-900">
                  {myApplications?.filter(app => app.status === 'rejected').length || 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des candidatures */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4 lg:p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                    <div className="h-5 lg:h-6 bg-gray-200 rounded w-1/2 lg:w-1/3"></div>
                    <div className="h-4 lg:h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-3 bg-gray-200 rounded w-16"></div>
                    ))}
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2 lg:ml-6">
                  <div className="h-8 bg-gray-200 rounded flex-1 lg:w-20"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1 lg:w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : myApplications?.length > 0 ? (
        <div className="space-y-4">
          {myApplications.map(application => (
          <div key={application._id} className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-3">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                      {application.offer?.title || 'Offre supprimée'}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium self-start ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm lg:text-base text-gray-600 mb-3">
                    {application.offer?.employer?.firstName} {application.offer?.employer?.lastName}
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4 text-sm">
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Zone:</span>
                      <span className="ml-1 font-medium">
                        {application.offer?.location?.city || application.offer?.requirements?.zone || 'Non spécifié'}
                      </span>
                    </div>
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium">{application.offer?.type || 'Non spécifié'}</span>
                    </div>
                    {application.offer?.conditions?.salary && (
                      <div className="flex justify-between lg:block">
                        <span className="text-gray-500">Salaire:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {application.offer.conditions.salary} FCFA
                          {application.offer.conditions.salaryType && (
                            <span className="text-gray-500">
                              {application.offer.conditions.salaryType === 'horaire' && '/h'}
                              {application.offer.conditions.salaryType === 'journalier' && '/j'}
                              {application.offer.conditions.salaryType === 'mensuel' && '/m'}
                              {application.offer.conditions.salaryType === 'fixe' && ''}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between lg:block">
                      <span className="text-gray-500">Postulé:</span>
                      <span className="ml-1 font-medium">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {application.employerNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Message de l'employeur: </span>
                        {application.employerNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2 lg:ml-6">
                  {application.status === 'pending' && (
                    <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm">
                      Annuler
                    </button>
                  )}
                  {application.status === 'accepted' && (
                    <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                      Voir mission
                    </button>
                  )}
                  <button className="flex-1 lg:w-28 px-3 lg:px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Aucune candidature envoyée"
          description="Vous n'avez pas encore postulé à des offres. Consultez les offres disponibles pour commencer."
        />
      )}
    </div>
  );
}
