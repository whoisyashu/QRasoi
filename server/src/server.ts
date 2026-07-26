import { app } from './app.js';
import { ENV } from './config/env.js';

let PORT = Number(ENV.PORT) || 5000;

const startServer = (portToTry: number) => {
  const server = app.listen(portToTry, () => {
    console.log(`========================================================`);
    console.log(`🚀 QRasoi Express Backend Server is running`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`🏥 Healthcheck: http://localhost:${portToTry}/health`);
    console.log(`========================================================`);
  });

  // Handle port collision gracefully (EADDRINUSE)
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is already in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
