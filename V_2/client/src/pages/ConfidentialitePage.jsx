import PublicPageLayout from '../component/common/PublicPageLayout';

export default function ConfidentialitePage() {
  return (
    <PublicPageLayout activeTab="">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
          <h1 className="text-3xl lg:text-4xl text-gray-900 mb-8">
            Politique de confidentialité
          </h1>

          <div className="bg-white border border-gray-200 p-6 lg:p-8 space-y-6">
            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                GoDriver s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment 
                nous collectons, utilisons, partageons et protégeons vos informations personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                2. Informations collectées
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Nous collectons les types d'informations suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Informations d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                  <li><strong>Informations professionnelles :</strong> expérience, compétences, type de permis, véhicule</li>
                  <li><strong>Informations de compte :</strong> mot de passe crypté, préférences</li>
                  <li><strong>Informations d'utilisation :</strong> pages visitées, actions effectuées</li>
                  <li><strong>Informations techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                3. Utilisation des informations
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Nous utilisons vos informations pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer et gérer votre compte</li>
                  <li>Faciliter la mise en relation entre chauffeurs et employeurs</li>
                  <li>Améliorer nos services et votre expérience utilisateur</li>
                  <li>Vous envoyer des notifications importantes</li>
                  <li>Assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                4. Partage des informations
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Nous partageons vos informations uniquement dans les cas suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Avec les employeurs :</strong> votre profil professionnel est visible par les employeurs</li>
                  <li><strong>Avec les chauffeurs :</strong> les informations des offres d'emploi sont visibles</li>
                  <li><strong>Prestataires de services :</strong> hébergement, analyse, paiement (sous contrat strict)</li>
                  <li><strong>Obligations légales :</strong> si requis par la loi ou pour protéger nos droits</li>
                </ul>
                <p className="mt-3">
                  Nous ne vendons jamais vos informations personnelles à des tiers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                5. Protection des données
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cryptage des mots de passe</li>
                  <li>Connexions HTTPS sécurisées</li>
                  <li>Accès limité aux données personnelles</li>
                  <li>Surveillance et détection des intrusions</li>
                  <li>Sauvegardes régulières</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                6. Vos droits
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Accès :</strong> consulter les données que nous détenons sur vous</li>
                  <li><strong>Rectification :</strong> corriger vos informations inexactes</li>
                  <li><strong>Suppression :</strong> demander la suppression de votre compte et de vos données</li>
                  <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
                  <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Limitation :</strong> demander la limitation du traitement</li>
                </ul>
                <p className="mt-3">
                  Pour exercer ces droits, contactez-nous à : 
                  <a href="mailto:privacy@godriver.ci" className="text-orange-500 hover:text-orange-600 ml-1">
                    privacy@godriver.ci
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. Les cookies sont de petits fichiers 
                stockés sur votre appareil. Vous pouvez configurer votre navigateur pour refuser les cookies, 
                mais certaines fonctionnalités du site pourraient ne pas fonctionner correctement.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                8. Conservation des données
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                et respecter nos obligations légales. Après suppression de votre compte, certaines données peuvent 
                être conservées pour des raisons légales ou de sécurité.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                9. Transferts internationaux
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Vos données sont principalement stockées en Côte d'Ivoire. Si nous devons transférer vos données 
                à l'international, nous nous assurons que des garanties appropriées sont en place pour protéger vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                10. Mineurs
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Notre service est destiné aux personnes âgées de 18 ans et plus. Nous ne collectons pas 
                sciemment d'informations personnelles auprès de mineurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                11. Modifications de la politique
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes 
                seront notifiées par email ou via une notification sur la plateforme. Nous vous encourageons 
                à consulter régulièrement cette page.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl  text-gray-900 mb-4">
                12. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                <br />
                <strong>Email :</strong> 
                <a href="mailto:privacy@godriver.ci" className="text-orange-500 hover:text-orange-600 ml-1">
                  privacy@godriver.ci
                </a>
                <br />
                <strong>Adresse :</strong> Abidjan, Côte d'Ivoire
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
