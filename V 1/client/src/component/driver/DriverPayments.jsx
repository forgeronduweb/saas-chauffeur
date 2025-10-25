export default function DriverPayments() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiements & Revenus</h1>
        <p className="text-gray-600">Gestion des rémunérations</p>
      </div>

      {/* Message informatif */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Paiements gérés en direct</h3>
        <p className="text-blue-700 mb-4">
          Les paiements et rémunérations sont gérés directement entre vous et l'employeur, 
          en dehors de cette plateforme.
        </p>
        <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="font-medium text-gray-900 mb-2">💡 Conseils :</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Négociez le tarif avant d'accepter une mission</li>
            <li>• Définissez les modalités de paiement à l'avance</li>
            <li>• Gardez une trace écrite des accords</li>
            <li>• Demandez un acompte si nécessaire</li>
          </ul>
        </div>
      </div>

      {/* Section contact */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Besoin d'aide ?</h3>
        <p className="text-gray-600 mb-4">
          Pour toute question concernant les modalités de paiement avec un employeur, 
          vous pouvez nous contacter.
        </p>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Contacter le support
        </button>
      </div>
    </div>
  );
}
