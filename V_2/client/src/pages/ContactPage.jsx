import PublicPageLayout from '../component/common/PublicPageLayout';

export default function ContactPage() {
  return (
    <PublicPageLayout activeTab="">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
          <h1 className="text-3xl lg:text-4xl text-gray-900 mb-8">
            Nous contacter
          </h1>

          <div className="bg-white border border-gray-200 p-6 lg:p-8 space-y-8">
            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Informations de contact
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Adresse email</h3>
                  <p className="text-gray-700">
                    <a href="mailto:contact@godriver.ci" className="text-orange-500 hover:text-orange-600">
                      contact@godriver.ci
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Pour toutes vos questions générales</p>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Support technique</h3>
                  <p className="text-gray-700">
                    <a href="mailto:support@godriver.ci" className="text-orange-500 hover:text-orange-600">
                      support@godriver.ci
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Pour l'assistance technique</p>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Partenariats</h3>
                  <p className="text-gray-700">
                    <a href="mailto:partenariat@godriver.ci" className="text-orange-500 hover:text-orange-600">
                      partenariat@godriver.ci
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Pour les opportunités de collaboration</p>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Téléphone</h3>
                  <p className="text-gray-700">+225 07 XX XX XX XX</p>
                  <p className="text-sm text-gray-500 mt-1">Du lundi au vendredi, 8h - 18h</p>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Adresse</h3>
                  <p className="text-gray-700">
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Horaires d'ouverture
              </h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span>Lundi - Vendredi</span>
                  <span>8h00 - 18h00</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span>Samedi</span>
                  <span>9h00 - 13h00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Dimanche</span>
                  <span>Fermé</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Réseaux sociaux
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Suivez-nous sur nos réseaux sociaux pour rester informé de nos actualités et nouveautés :
                </p>
                <div className="flex flex-col gap-2">
                  <a href="#" className="text-orange-500 hover:text-orange-600">Facebook</a>
                  <a href="#" className="text-orange-500 hover:text-orange-600">LinkedIn</a>
                  <a href="#" className="text-orange-500 hover:text-orange-600">Twitter</a>
                  <a href="#" className="text-orange-500 hover:text-orange-600">Instagram</a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-gray-700">
                Avant de nous contacter, consultez notre 
                <a href="/aide" className="text-orange-500 hover:text-orange-600 ml-1">
                  Centre d'aide
                </a>
                {' '}où vous trouverez les réponses aux questions les plus fréquentes.
              </p>
            </section>

            <section className="bg-gray-50 border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-3">
                Temps de réponse
              </h2>
              <p className="text-gray-700">
                Nous nous engageons à répondre à toutes vos demandes dans un délai de 24 à 48 heures ouvrées. 
                Pour les urgences, veuillez nous contacter par téléphone.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
