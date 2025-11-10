import PublicPageLayout from '../component/common/PublicPageLayout';

export default function ConditionsPage() {
  return (
    <PublicPageLayout activeTab="">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
          <h1 className="text-3xl lg:text-4xl text-gray-900 mb-8">
            Conditions d'utilisation
          </h1>

          <div className="bg-white border border-gray-200 p-6 lg:p-8 space-y-6">
            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En accédant et en utilisant la plateforme GoDriver, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                2. Description du service
              </h2>
              <p className="text-gray-700 leading-relaxed">
                GoDriver est une plateforme qui met en relation les chauffeurs professionnels avec les employeurs 
                en Côte d'Ivoire. Nous facilitons la recherche d'emploi pour les chauffeurs et le recrutement pour les employeurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                3. Inscription et compte utilisateur
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Pour utiliser certaines fonctionnalités de GoDriver, vous devez créer un compte. Vous vous engagez à :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Maintenir la sécurité de votre mot de passe</li>
                  <li>Être responsable de toutes les activités sur votre compte</li>
                  <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                4. Utilisation acceptable
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Vous acceptez de ne pas :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Publier de fausses informations ou de contenu trompeur</li>
                  <li>Harceler, menacer ou discriminer d'autres utilisateurs</li>
                  <li>Utiliser la plateforme à des fins illégales</li>
                  <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
                  <li>Envoyer du spam ou du contenu non sollicité</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                5. Offres d'emploi et candidatures
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Les employeurs sont responsables de l'exactitude de leurs offres d'emploi. Les chauffeurs sont responsables 
                de l'exactitude de leurs profils et candidatures. GoDriver ne garantit pas l'embauche ou la qualité des candidats.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                6. Frais et paiements
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Certains services de GoDriver peuvent être payants. Les frais applicables seront clairement indiqués 
                avant toute transaction. Tous les paiements sont non remboursables sauf indication contraire.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                7. Propriété intellectuelle
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Tout le contenu de la plateforme GoDriver, y compris le texte, les graphiques, les logos et les logiciels, 
                est la propriété de GoDriver ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                8. Limitation de responsabilité
              </h2>
              <p className="text-gray-700 leading-relaxed">
                GoDriver ne peut être tenu responsable des dommages directs, indirects, accessoires ou consécutifs 
                résultant de l'utilisation ou de l'impossibilité d'utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                9. Modification des conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront 
                publiées sur cette page avec une date de mise à jour. Votre utilisation continue du service après 
                les modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                10. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :
                <br />
                <a href="mailto:contact@godriver.ci" className="text-orange-500 hover:text-orange-600">
                  contact@godriver.ci
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
