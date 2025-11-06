const axios = require('axios');

/**
 * Système de keep-alive pour éviter que Render endorme le serveur
 * Envoie une requête ping toutes les 10 minutes
 */
class KeepAlive {
  constructor(url, interval = 10 * 60 * 1000) { // 10 minutes par défaut
    this.url = url;
    this.interval = interval;
    this.timer = null;
  }

  start() {
    if (!this.url) {
      console.log('⚠️ Keep-alive: URL non configurée, désactivé');
      return;
    }

    console.log(`🔄 Keep-alive activé: ping toutes les ${this.interval / 60000} minutes`);
    
    // Premier ping immédiat
    this.ping();
    
    // Puis pings réguliers
    this.timer = setInterval(() => {
      this.ping();
    }, this.interval);
  }

  async ping() {
    try {
      const response = await axios.get(`${this.url}/health`, {
        timeout: 5000
      });
      console.log(`✅ Keep-alive ping: ${response.data.status} (${new Date().toISOString()})`);
    } catch (error) {
      console.error(`❌ Keep-alive ping failed: ${error.message}`);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('🛑 Keep-alive arrêté');
    }
  }
}

module.exports = KeepAlive;
