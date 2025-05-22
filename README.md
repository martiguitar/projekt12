# Studio Bookings App

A React-based studio booking application built with Next.js.

## Deployment to Vercel

### Prerequisites

1. A Vercel account
2. The following environment variables set up in Vercel:
   - `NEXT_PUBLIC_API_URL` - Baserow API URL
   - `NEXT_PUBLIC_API_TOKEN` - Baserow API Token
   - `NEXT_PUBLIC_DATABASE_ID` - Baserow Database ID
   - `NEXT_PUBLIC_USERS_TABLE_ID` - Users Table ID
   - `NEXT_PUBLIC_ROOMS_TABLE_ID` - Rooms Table ID
   - `NEXT_PUBLIC_BOOKINGS_TABLE_ID` - Bookings Table ID

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project to Vercel:
   - Go to https://vercel.com/new
   - Select your repository
   - Vercel will automatically detect it as a Next.js project

3. Configure the project:
   - The build settings are automatically configured via vercel.json
   - Add your environment variables in the Vercel project settings
   - Ensure all environment variables from .env.example are added

4. Deploy:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll receive a production URL when complete

### Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production build
yarn start
```

## Project Structure

```
studio-bookings-main/
├── .env                 # Umgebungsvariablen für die Entwicklung
├── .env.local           # Lokale Umgebungsvariablen (überschreibt .env)
├── .gitignore           # Dateien, die von Git ignoriert werden sollen
├── .next/               # Kompilierte Next.js-Dateien (automatisch generiert)
├── next.config.js       # Next.js-Konfiguration
├── package.json         # Projektabhängigkeiten und Skripte
├── postcss.config.js    # PostCSS-Konfiguration für CSS-Verarbeitung
├── src/                 # Quellcode des Projekts
│   ├── components/      # Wiederverwendbare Komponenten
│   │   ├── BookingManagement.jsx    # Verwaltung von Buchungen
│   │   ├── BookingProcess.jsx       # Buchungsprozess
│   │   ├── ErrorBoundary.jsx        # Fehlerbehandlung
│   │   ├── Layout.jsx               # Haupt-Layout mit Navigation
│   │   ├── MobileNavigation.jsx     # Mobile Navigation
│   │   ├── Navbar.jsx               # Navigationsleiste
│   │   └── RoomManagement.jsx       # Verwaltung von Räumen
│   ├── contexts/        # React-Kontexte
│   │   └── AuthContext.jsx          # Authentifizierungskontext
│   ├── pages/           # Next.js-Seiten
│   │   ├── _app.jsx                 # Haupt-App-Komponente
│   │   ├── _document.jsx            # HTML-Dokument
│   │   ├── admin.jsx                # Admin-Seite
│   │   ├── calendar.jsx             # Kalender-Seite
│   │   ├── dashboard.jsx            # Dashboard-Seite
│   │   ├── index.jsx                # Startseite (Weiterleitung zum Dashboard)
│   │   ├── login.jsx                # Login-Seite
│   │   └── register.jsx             # Registrierungsseite
│   ├── services/        # Dienste und API-Integrationen
│   │   └── baserow.js               # Baserow-API-Integration
│   └── styles/          # CSS-Stile
│       └── globals.css              # Globale Stile
├── tailwind.config.js   # Tailwind CSS-Konfiguration
├── tsconfig.json        # TypeScript-Konfiguration
├── vercel.json          # Vercel-Deployment-Konfiguration
└── yarn.lock            # Yarn-Abhängigkeiten (automatisch generiert)
```

### Wichtige Dateien und ihre Funktionen:

1. **Konfigurationsdateien**:
   - `next.config.js`: Konfiguration für Next.js
   - `package.json`: Projektabhängigkeiten und Skripte
   - `.env` und `.env.local`: Umgebungsvariablen
   - `vercel.json`: Konfiguration für Vercel-Deployment

2. **Hauptkomponenten**:
   - `src/pages/_app.jsx`: Haupt-App-Komponente, die für alle Seiten verwendet wird
   - `src/components/Layout.jsx`: Gemeinsames Layout mit Navigation
   - `src/contexts/AuthContext.jsx`: Authentifizierungslogik

3. **Seiten**:
   - `src/pages/index.jsx`: Startseite (leitet zum Dashboard weiter)
   - `src/pages/dashboard.jsx`: Dashboard mit Raumübersicht
   - `src/pages/calendar.jsx`: Kalenderansicht und Buchungsfunktionalität
   - `src/pages/login.jsx` und `src/pages/register.jsx`: Authentifizierung
   - `src/pages/admin.jsx`: Admin-Bereich

4. **Funktionale Komponenten**:
   - `src/components/BookingProcess.jsx`: Buchungsprozess
   - `src/components/BookingManagement.jsx`: Verwaltung von Buchungen
   - `src/components/RoomManagement.jsx`: Verwaltung von Räumen

5. **Services**:
   - `src/services/baserow.js`: Integration mit der Baserow-API für Daten

### Production Optimizations

The application includes:
- Chunk splitting for optimal loading
- Security headers configuration
- Cache control for static assets
- Client-side routing support
- Source maps for debugging

### Environment Variables

Copy `.env.example` to `.env` for local development and ensure all variables are properly set in Vercel for production deployment.
