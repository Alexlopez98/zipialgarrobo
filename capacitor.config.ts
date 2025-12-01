import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'zipialgarrobo',
  webDir: 'www',
  

  server: {
    androidScheme: 'http',
    cleartext: true, 
    allowNavigation: [
      '192.168.1.110', 
      '10.0.2.2',      
      'localhost'
    ]
  }
};

export default config;