# ZenMusic

A web music player inspired by third-party music clients. Search YouTube videos through an Invidious instance, play them in the official YouTube embedded player, and save favorites locally. ZenMusic does not host or extract audio and does not include its own analytics or advertising trackers.

## Run locally

Requires Node.js 18 or newer. Run `npm run dev` and open http://localhost:3000. The server must be able to reach the configured Invidious instance, and the browser must be able to reach YouTube.

## Deploy to Vercel

Import the repository and deploy with the default settings. `/api/stations` is a Vercel serverless search endpoint. Optionally set `INVIDIOUS_URL` to the HTTPS origin of a trusted Invidious instance; the default is `https://yewtu.be`. Public instances can be unavailable, rate-limited, or blocked by YouTube, so a dependable instance is needed for reliable search. No API key is required.

## Limitations and privacy

Unlike native BitChord, InnerTune or ViMusic, playback uses the visible official YouTube embed: YouTube can show ads, restrict embedding, or make tracks unavailable, and background playback depends on the browser/device. This is not an audio extraction client. Search results are video results and can include non-music content. Favorites are stored in browser localStorage. Searches go through the configured Invidious instance without forwarding client headers, though Vercel may retain operational logs. Thumbnails and playback connect to Google/YouTube, which can receive the listener's IP and process data under its own policies. No claim of complete anonymity or tracker-free third-party services is made.
