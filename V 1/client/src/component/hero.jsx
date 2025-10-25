import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { driversService } from "../services/api";

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [driversCount, setDriversCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriversCount = async () => {
      try {
        const response = await driversService.getCount();
        setDriversCount(response.data.count);
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de chauffeurs:', error);
        // Valeur par défaut en cas d'erreur
        setDriversCount(2847);
      } finally {
        setLoading(false);
      }
    };

    fetchDriversCount();
  }, []);

  return (
    <div className="font-[Poppins] relative">
      {/* Background SVG */}
      <svg
        className="size-full absolute -z-10 inset-0"
        width="1440"
        height="720"
        viewBox="0 0 1440 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke="#E2E8F0" strokeOpacity=".7" d="M-15.227 702.342H1439.7" />
        <circle cx="711.819" cy="372.562" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
        <circle cx="16.942" cy="20.834" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
        <path stroke="#E2E8F0" strokeOpacity=".7" d="M-15.227 573.66H1439.7M-15.227 164.029H1439.7" />
        <circle cx="782.595" cy="411.166" r="308.334" stroke="#E2E8F0" strokeOpacity=".7" />
      </svg>

      {/* Navbar */}
      <nav className="z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur text-slate-800 text-sm">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#4F39F6"/>
            <path d="M12 16L20 12L28 16V28L20 32L12 28V16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16L20 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 32V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-slate-800">GoDriver</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 transition duration-500">
          <a href="/" className="hover:text-slate-500 transition">
            Accueil
          </a>
          <Link to="/chauffeurs" className="hover:text-slate-500 transition">
            Chauffeurs
          </Link>
          <Link to="/employeurs" className="hover:text-slate-500 transition">
            Employeurs
          </Link>
          <Link to="/comment-ca-marche" className="hover:text-slate-500 transition">
            Comment ça marche
          </Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth?mode=login" className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-full">
            Se connecter
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden active:scale-90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Nav */}
      <div
        className={`fixed inset-0 z-[100] bg-white/60 text-slate-800 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a href="/">Accueil</a>
        <Link to="/chauffeurs">Chauffeurs</Link>
        <Link to="/employeurs">Employeurs</Link>
        <Link to="/comment-ca-marche">Comment ça marche</Link>
        <div className="flex flex-col gap-4 mt-4">
          <Link to="/auth?mode=login" className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-full text-center">
            Se connecter
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(false)}
          className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-white hover:bg-slate-200 transition text-black rounded-md flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col max-md:gap-20 md:flex-row pb-20 items-center justify-between mt-20 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex flex-wrap items-center justify-center p-1.5 rounded-full border border-slate-400 text-gray-500 text-xs">
            <div className="flex items-center">
              <img
                className="size-7 rounded-full border-3 border-white"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=50&h=50&auto=format&fit=crop"
                alt="chauffeur1"
              />
              <img
                className="size-7 rounded-full border-3 border-white -translate-x-2"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=50&h=50&auto=format&fit=crop"
                alt="employeur1"
              />
              <img
                className="size-7 rounded-full border-3 border-white -translate-x-4"
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=50&h=50&auto=format&fit=crop"
                alt="chauffeur2"
              />
            </div>
            <p className="-translate-x-2">
              Rejoignez {loading ? '...' : `${driversCount.toLocaleString()}+`} professionnels connectés
            </p>
          </div>

          <h1 className="text-center md:text-left text-5xl leading-[68px] md:text-6xl md:leading-[84px] font-medium max-w-xl text-slate-900">
            La mise en relation <span className="text-indigo-600">simple et efficace</span> entre employeurs et chauffeurs.
          </h1>
          <p className="text-center md:text-left text-lg text-slate-700 max-w-lg mt-4">
            Que vous soyez une entreprise cherchant des chauffeurs qualifiés ou un chauffeur professionnel en quête de nouvelles opportunités, notre plateforme vous connecte rapidement et en toute sécurité.
          </p>

          {/* Points clés */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Vérification des profils</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Mise en relation rapide</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Paiement sécurisé</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 text-sm">
            <Link to="/auth?mode=login" className="bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 rounded-md px-7 h-11 w-full sm:w-auto flex items-center justify-center">
              Je suis employeur
            </Link>
            <Link to="/auth?mode=login" className="flex items-center justify-center gap-2 border border-slate-600 active:scale-95 hover:bg-white/10 transition text-slate-600 rounded-md px-6 h-11 w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 2-5 10-5-4-5 10"/>
              </svg>
              <span>Je suis chauffeur</span>
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src="/hero.jpg"
            alt="Chauffeur professionnel au volant"
            className="max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl transition-all duration-300 rounded-lg shadow-2xl"
          />
          <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg border">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                {loading ? 'Chargement...' : `${driversCount.toLocaleString()} chauffeurs disponibles`}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
