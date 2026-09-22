# Food Link

Food Link is a simple location-aware website that helps people share extra food with nearby neighbors and community organizations.

## Features

- Find nearby food offers
- Search and filter by food type
- Ask the browser for location permission only after the user clicks “Use my location”
- Post a new food offer
- Add a phone number that the user chooses to share
- Call a donor directly with the device phone dialer
- Claim an offer and coordinate pickup
- Save offers and claims in the browser with `localStorage`
- Responsive layout for desktop and mobile

## Run locally

Requirements:

- Node.js 18 or newer
- pnpm 8 or newer

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm run dev
```

Create a production build:

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run serve
```

Check the TypeScript code:

```bash
pnpm run typecheck
```

## Privacy behavior

The browser does not silently read a user's phone number. A donor enters the phone number they want to share. The app uses that value only to create a visible `tel:` call link.

Location is also opt-in. The app only calls the browser geolocation API after the user chooses “Use my location”. If permission is denied, the demo neighborhood list remains available.

## Project structure

```text
src/
├── App.tsx                 # Main application and interactions
├── index.css               # Theme, responsive styling, and animations
├── main.tsx                # React entry point
├── components/             # Reusable UI components
├── hooks/                  # Reusable React hooks
├── lib/                    # Shared helpers
└── pages/                  # Route-level pages
```

## Notes

This version uses realistic local demo data and browser storage. A production version can replace the local state with a database and API while keeping the same interface.