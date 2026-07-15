# Nearby Shows

A tiny PWA for pilots and travelers: tap "I'm here," and it checks Ticketmaster + Bandsintown for your favorite artists within your custom radius of your current GPS location, displaying the live results right in your app.

## What's here

```
public/            static frontend (the PWA)
  index.html        the whole UI
  manifest.json     makes it installable to your home screen
  sw.js              minimal service worker (required for installability)
  icon-192.png, icon-512.png   placeholder app icons — swap these for your own
functions/api/
  lookup.js          Cloudflare Pages Function — the backend endpoint
```

## 1. Get your API keys

- **Ticketmaster**: self-serve, free. Sign up at https://developer-acct.ticketmaster.com/ and grab your Consumer Key — that's your `TICKETMASTER_KEY`.
- **Bandsintown**: requires manual approval. Email `API@bandsintown.com` explaining you're building a personal app to track your own favorite artists' tour dates, and ask for an app ID. Takes a few days. That's your `BANDSINTOWN_APP_ID`.

*Note: You can start with just Ticketmaster if you want to get something running today — Bandsintown approval can come later, the code automatically handles a missing key by skipping that source.*

## 2. Local setup

```bash
npm install
npx wrangler login
```

Create a `.dev.vars` file (not committed) for local testing:

```
TICKETMASTER_KEY=your_key_here
BANDSINTOWN_APP_ID=your_app_id_here
```

Then run the local development server:

```bash
npm run dev
```

Open the local URL it prints, allow location access, add an artist, and
tap the button.

## 3. Deploy

```bash
npm run deploy
```

First run will prompt you to create the `nearby-shows` Pages project.
After that, set your real secrets on the deployed project (these are
separate from `.dev.vars`, which only works locally):

```bash
npx wrangler pages secret put TICKETMASTER_KEY --project-name=nearby-shows
npx wrangler pages secret put BANDSINTOWN_APP_ID --project-name=nearby-shows
```

Cloudflare gives you a URL like nearby-shows.pages.dev. That's your live app!

## 4. Add it to your home screen

Once it's deployed and you open the `.pages.dev` URL on your phone:

- **iOS Safari**: tap the Share icon → "Add to Home Screen"
- **Android Chrome**: tap the ⋮ menu → "Add to Home screen" / "Install app"

Because of `manifest.json` + `sw.js`, it installs like a real app icon and
opens full-screen, no browser chrome.

## Notes / next steps

- Artists and your email are stored in the browser's `localStorage` —
  edit or clear them any time in the app itself.
- The radius field defaults to 30 miles; adjust per trip.
- Dedup logic lives in `functions/api/lookup.js` (`normKey`) — it matches
  on artist + date + venue, normalized. If you start seeing near-dupes
  slip through (e.g. venue name formatted differently between sources),
  that's the function to tune.
- To add more sources later (Eventbrite, Dice, SeatGeek), follow the same
  pattern as `fetchTicketmaster` / `fetchBandsintown` — add a fetch
  function, add it to the `calls` array in `onRequestPost`.
- Icons in `public/` are placeholders — swap in your own 192×192 and
  512×512 PNGs before you get attached to the app icon.
