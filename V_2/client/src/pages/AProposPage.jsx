import { useState, useEffect } from 'react';
import PublicPageLayout from '../component/common/PublicPageLayout';
import { statsApi } from '../services/api';

export default function AProposPage() {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalEmployers: 0,
    totalOffers: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.public();
        if (response.data.success) {
          const { totalDrivers, totalEmployers, totalOffers, averageRating } = response.data.data.overview;
          setStats({
            totalDrivers,
            totalEmployers,
            totalOffers,
            averageRating
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // Garder les valeurs par défaut en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <PublicPageLayout activeTab="">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
          <h1 className="text-3xl lg:text-4xl text-gray-900 mb-8">
            À propos de GoDriver
          </h1>

          <div className="bg-white border border-gray-200 p-6 lg:p-8 space-y-6">
            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Notre mission
              </h2>
              <p className="text-gray-700 leading-relaxed">
                GoDriver est la première plateforme ivoirienne dédiée à la mise en relation entre chauffeurs professionnels 
                et employeurs. Notre mission est de faciliter l'accès à l'emploi pour les chauffeurs qualifiés et de simplifier 
                le processus de recrutement pour les entreprises et particuliers en Côte d'Ivoire.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Notre vision
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous aspirons à devenir la référence en matière de recrutement de chauffeurs professionnels en Afrique de l'Ouest, 
                en offrant une plateforme fiable, sécurisée et efficace qui répond aux besoins du marché local.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Nos valeurs
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Professionnalisme</h3>
                  <p>Nous garantissons la vérification de tous les profils de chauffeurs pour assurer la qualité et la sécurité.</p>
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Transparence</h3>
                  <p>Des tarifs clairs, des processus simples et une communication honnête avec tous nos utilisateurs.</p>
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Innovation</h3>
                  <p>Nous utilisons la technologie pour simplifier le recrutement et améliorer l'expérience utilisateur.</p>
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">Accessibilité</h3>
                  <p>Une plateforme accessible à tous, chauffeurs et employeurs, partout en Côte d'Ivoire.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Notre équipe
              </h2>
              <p className="text-gray-700 leading-relaxed">
                GoDriver est développé et géré par une équipe passionnée de professionnels ivoiriens qui comprennent 
                les défis du marché local de l'emploi. Nous travaillons chaque jour pour améliorer notre plateforme 
                et offrir le meilleur service possible à notre communauté.
              </p>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Nos chiffres
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl text-orange-500 mb-2">
                    {loading ? '...' : `${stats.totalDrivers.toLocaleString()}+`}
                  </div>
                  <div className="text-sm text-gray-600">Chauffeurs inscrits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl text-orange-500 mb-2">
                    {loading ? '...' : `${stats.totalEmployers.toLocaleString()}+`}
                  </div>
                  <div className="text-sm text-gray-600">Employeurs actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl text-orange-500 mb-2">
                    {loading ? '...' : `${stats.totalOffers.toLocaleString()}+`}
                  </div>
                  <div className="text-sm text-gray-600">Offres publiées</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl text-orange-500 mb-2">
                    {loading ? '...' : `${stats.averageRating.toFixed(1)}/5`}
                  </div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl lg:text-2xl text-gray-900 mb-4">
                Nous contacter
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>
                  <span className="text-gray-900">Email :</span> 
                  <a href="mailto:contact@godriver.ci" className="text-orange-500 hover:text-orange-600 ml-2">
                    contact@godriver.ci
                  </a>
                </p>
                <p>
                  <span className="text-gray-900">Téléphone :</span> 
                  <span className="ml-2">+225 07 XX XX XX XX</span>
                </p>
                <p>
                  <span className="text-gray-900">Adresse :</span> 
                  <span className="ml-2">Abidjan, Côte d'Ivoire</span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
