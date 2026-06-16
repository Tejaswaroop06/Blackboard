import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blackboard.app',
  appName: 'Blackboard',
  webDir: 'out',
  server: {
    // This is CRITICAL for a dynamic Next.js app with Auth/Database.
    // Replace this with your actual production URL after you deploy to Vercel.
    url: 'https://your-production-url.vercel.app',
    allowNavigation: ['your-production-url.vercel.app'],
    androidScheme: 'https'
  },
  plugins: {
    // You can add native mobile plugins here (Push notifications, Biometrics, etc.)
  }
};

export default config;
