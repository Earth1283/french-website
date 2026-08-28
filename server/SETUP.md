# Teacher Setup Guide

Get your own classroom running in about 10 minutes. No prior server experience
needed — if you can use a terminal to copy-paste a few commands, you can do
this.

For configuration details and troubleshooting beyond this walkthrough, see
[`README.md`](README.md) in this same folder.

## What you'll need

- A computer that can stay on while your students are using it — your
  laptop, a spare desktop, or a small home server. Nothing fancy required.
- [Node.js](https://nodejs.org) installed on that computer (free).
- About 10 minutes.

## Step 1 — Install Node.js

- **macOS / Windows:** download the LTS installer from
  [nodejs.org](https://nodejs.org) and run it.
- **Linux:** use your package manager, e.g. `sudo apt install nodejs npm`
  (Debian/Ubuntu).

Confirm it worked:

```bash
node -v
```

You should see a version number (18 or higher works).

## Step 2 — Get the code

```bash
git clone https://github.com/Earth1283/french-website.git
cd french-website/server
```

No `git`? Download the repo as a ZIP from GitHub instead, unzip it, and open
a terminal inside the `server` folder.

## Step 3 — Configure

```bash
cp .env.example .env
```

Every setting has a working default — you can leave `.env` untouched for
now. (Want a custom port, or your own certificate instead of the
auto-generated one? See `README.md`.)

## Step 4 — Install and start

```bash
npm install
npm run build
npm start
```

You'll see something like:

```
French Classroom Server listening on port 8443
Using an auto-generated self-signed certificate.
Visit one of these once in a browser and accept the security warning to trust it:
  https://localhost:8443
  https://192.168.1.42:8443
```

Keep this terminal window open — closing it stops the server. Write down
the **second URL** (your computer's actual network address, not
`localhost`) — that's the one you'll give to students. `localhost` only
works from this same computer.

## Step 5 — Connect the classroom site to your server

1. Open the main site:
   **https://earth1283.github.io/french-website/#/classes/connect**
2. Paste in your server's address from Step 4.
3. Click **Open server page** — a new tab opens showing a browser security
   warning. This is expected (see [below](#why-the-security-warning)) —
   click through it (usually **Advanced → Proceed**), then close that tab.
4. Back in the first tab, click **I trusted it — Continue**.
5. Choose **I'm the Teacher** → **Create Account**. The first account
   created on a fresh server automatically becomes the teacher — no invite
   code needed.
6. You'll be shown a one-time **recovery code** — save or download it. It's
   the only way to reset your password later without server access, and it
   won't be shown again.

## Step 6 — Create a class

On your dashboard, type a class name (e.g. "Period 1") and hit **Create**.
Open it to see your **join code** — a short code like `GEZ6-4F4T` — with a
**Copy** button.

## Step 7 — Add something to teach

From **Classes**, create a lesson or quiz — vocabulary and exercises, or
just a set of questions — then open your class and **Assign content** to
attach it.

## Step 8 — Get students connected

Give students two things:

- Your server's address (from Step 4)
- Your class's join code (from Step 6)

Each student, once per device:

1. Visits the same connect page and enters your server's address.
2. Clicks through the same one-time certificate warning (Step 5.3).
3. Chooses **I'm a Student** → **Create Account** — their own name, email,
   and password. This account exists only on your server, separate from
   anything else on the site. They'll get a one-time recovery code too —
   worth reminding them to actually save it, since you'd otherwise be the
   fallback for a forgotten password.
4. Enters your class's join code.

After that, they'll see whatever you've assigned every time they log back
in.

## Why the security warning?

Your server encrypts its traffic with a certificate it generates for
itself, since (unlike a commercial website) it isn't backed by a
certificate authority. That's normal and safe for a self-hosted class — it
just means browsers don't automatically recognize it, so everyone approves
it once per device. If that bothers you or your school's IT department,
see the "Certificates" section (Option B) in `README.md` for the
zero-warning alternative (requires a domain name).

## Keeping it running

- **Casual use:** leave the terminal window open during class, and start it
  again next time with `npm start` from the `server` folder.
- **Always-on:** to run it permanently in the background (e.g. on a spare
  machine), see the systemd instructions in `README.md`.
- **Updating later:** `git pull`, then repeat Step 4.

## Troubleshooting

- **Students can't reach my server.** They need to be on the same network
  as your computer (same Wi-Fi), unless you've set up port forwarding or
  are running on a server with a public address. That's the trade-off of
  this zero-config, no-Docker setup — if your students are off-site, you'll
  want a small VPS instead of your laptop.
- **Someone forgot their password.** Everyone gets a one-time recovery code
  when they create their account (there's a "download as file" button —
  encourage saving it). The "Forgot password?" link on the login screen
  uses that code to set a new password with no one else involved. This
  server doesn't send email, so there's no "check your inbox" link — the
  recovery code is the whole mechanism.
- **A student lost their recovery code too.** Open their class's roster on
  your dashboard and use **Reset password** next to their name.
- **You (the teacher) lost your recovery code too.** From the `server`
  folder, run `npm run reset-teacher-password -- your@email.com newpassword123`
  — this requires access to the machine the server runs on, same as any
  other admin recovery on a self-hosted service.
- **Join codes stopped working after a restart.** They shouldn't — everything
  is saved to `server/data/classroom.sqlite3`. If that `data/` folder was
  deleted, you're starting fresh.
- **Something else.** See `README.md` for the full configuration reference.
