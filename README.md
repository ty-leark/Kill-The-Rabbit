# Kill The Rabbit

A multi-page Wonderland investigation. Click through case files, recover evidence, and follow the cipher trail.

## Play locally

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How progress works

- Discoveries are stored in **session storage** for the current browser visit.
- Closing the tab/window resets the case for the next visit.
- Console helper: `resetGame()` forces an immediate reset.

## Cipher trail (spoiler-light)

Decrypt the Watchtower Cipher (memory + environment), then work Memorial → Mailbox → Diary → Queen. The `???` channel unlocks after the Queen contradiction (or Critical Event).

## Deploy notes

- Prefer a static host (Netlify, GitHub Pages, Cloudflare Pages).
- Compress large GIFs/WebPs in `Images/` before public launch — several files are multi‑MB.
- Asset paths are case-sensitive on Linux hosts.
