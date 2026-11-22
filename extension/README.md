# humyn Pulse for LinkedIn (Chrome extension)

Adds a floating **humyn** button on LinkedIn profile pages. Click it, then
"Analyse this profile" to get a Humyn Pulse profile with how to speak and write
to that person. "Save to Humyn" adds them to the people directory.

## Install (developer mode)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose this `extension/` folder.
4. Open any LinkedIn profile (`linkedin.com/in/...`). The button appears bottom right.

After changing any file here, click the reload icon on the extension card, then
refresh the LinkedIn tab.

## Files

- `manifest.json` — permissions and which pages the extension runs on.
- `content.js` — the button, the side panel, and reading the profile text from the page.
- `background.js` — calls the Humyn API. The server address is `BASE_URL` at the top.

## Notes

- It reads only the profile page you are viewing, and only when you click Analyse.
- The profile text is sent to the Humyn API (and from there to Anthropic). Saved
  people are stored in Supabase.
- Results are cached in the browser per profile, so reopening is instant. Use
  **Re-run** to refresh.
- To point at a different server (for example `http://localhost:3000` for local
  testing), change `BASE_URL` in `background.js` and add the address to
  `host_permissions` in `manifest.json`.
