# ZenMusic

A simple, free live-radio player. Discover stations from the community-maintained [Radio Browser](https://www.radio-browser.info/), search by name or genre, and save favorites in your browser. No account, analytics, cookies, or tracking scripts are used by ZenMusic.

## Run locally

Requires Node.js 18 or newer.

```sh
npm run dev
```

Open http://localhost:3000. Internet access to Radio Browser and individual station streams is required.

## Deploy to Vercel

Import this repository into Vercel and deploy with the default settings. `api/stations.js` is a serverless function that fetches the public directory; no API key or environment variables are required. The frontend and API share the same origin. Only HTTPS streams are listed to avoid mixed-content errors. Stream availability depends on the station and browser codec support.

## Privacy and availability

ZenMusic does not include analytics or advertising trackers. Favorites are stored in localStorage on your device. The server contacts Radio Browser for directory data without forwarding user headers; the Vercel hosting platform may keep operational logs. When you play a station, your browser connects directly to that station's stream provider, which can see your IP address and may have its own privacy policy or ads. This is a live radio player, not an on-demand catalog; ZenMusic does not host music and cannot guarantee availability or rights of third-party broadcasts.
