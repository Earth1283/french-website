# French Classroom Server

The optional teacher backend for Oh Non! Le French Website. Run this yourself
to create classes, author lessons/quizzes, and track student progress. The
main site (GitHub Pages) then connects to whatever URL you host this at.

No Docker, no external database — just Node.js and a SQLite file.

**New here?** [`SETUP.md`](SETUP.md) is a full guided walkthrough, start to
finish, aimed at teachers rather than developers. This README is the
technical reference — configuration, certificates, and troubleshooting.

## Quick start

```bash
git clone <this repo>   # or git pull if you already have it
cd french-website/server
cp .env.example .env
npm install
npm run build
npm start
```

The server prints the URL(s) to give your students, e.g.:

```
French Classroom Server listening on port 8443
Using an auto-generated self-signed certificate.
Visit one of these once in a browser and accept the security warning to trust it:
  https://localhost:8443
  https://192.168.1.42:8443
```

For local development (auto-restarts on file changes): `npm run dev`.

## Why HTTPS is required

The main site is served over HTTPS (GitHub Pages). Browsers block an HTTPS
page from calling a plain HTTP API, so this server always speaks HTTPS —
even for local/LAN use. See the two certificate options below.

## Certificates

**Option A — auto-generated (default, zero config).** If you don't set
`TLS_CERT_PATH`/`TLS_KEY_PATH`, the server generates its own self-signed
certificate on first run and reuses it on every restart. Anyone connecting
(including you) needs to visit the server's URL once in a browser and click
through the "not private" warning — the app's connect flow walks students
through this. It's a one-time step per device.

**Option B — bring your own certificate (recommended if you have one).**
Set `TLS_CERT_PATH` and `TLS_KEY_PATH` in `.env` to a real certificate/key
pair — for example one issued by Let's Encrypt via `certbot`, or one your
school's IT department gives you. With a real certificate, students get zero
security warnings and the trust-this-server step is skipped entirely. If you
have a domain name, `certbot certonly --standalone -d classroom.yourdomain.com`
is a common way to get one; point the two env vars at the resulting
`fullchain.pem`/`privkey.pem` and restart.

## Port

Set `PORT` in `.env` — defaults to `8443` (deliberately above 1024 so you
don't need root to bind it). Change it if it collides with something else on
your machine or your network blocks it.

## Configuration reference

See `.env.example` for the full list with explanations. Everything has a
working default except what you choose to customize.

## Data

Everything lives in `data/` (created automatically, gitignored): the SQLite
database, the auto-generated certificate (if used), and the signing key for
login tokens. It also holds `data/content-files/` — the page text for any
"reading" (long-form, multi-page) lessons a teacher creates, stored as plain
markdown files rather than in the database, one folder per piece of content.
Back this directory up if you care about not losing your classes, rosters,
content, or reading pages — stop the server first (or copy the `-wal` and
`-shm` files next to the database too), since recent writes can still be
sitting in those until the server shuts down cleanly. Deleting `data/secret.key` will log everyone out;
deleting the whole `data/` directory starts you over from scratch.

## Content kinds

Teachers can create five kinds of content: **lesson** (vocab + exercises),
**quiz**, **reading** (multi-page markdown), **listening** and **writing**.

- **Listening** stores a script (optionally with speaker names) and three-option
  or short-answer questions. There are no audio files: the student's browser
  reads the script aloud with speech synthesis, so each speaker gets a different
  voice, and the teacher chooses how many plays are allowed (the DELF plays most
  documents twice). Answers are graded on the server like a quiz.
- **Writing** stores a task (consigne), a DELF level, a word minimum and an
  optional model answer. The model answer is withheld from a student until they
  hand in their text. The attempt is saved with no score, then the teacher marks it
  from the assignment results page on the DELF production écrite grid: five criteria,
  four bands each (`POST /api/teacher/attempts/:attemptId/review`). The score is
  stored as a percentage like every other kind. Resubmitting clears the mark.

Both editors can start from any document or task in the app's built-in DELF Prep
library.

## Multiple teachers on one instance

The first person to register becomes a teacher with no restrictions. After
that, new teacher signups require `TEACHER_SIGNUP_CODE` to be set in `.env`
and supplied at registration — this stops strangers on the same network from
registering themselves as a teacher. Leave it unset for solo use.

## Running it long-term

An example systemd unit is in `deploy/french-classroom.service` — copy it to
`/etc/systemd/system/`, adjust the paths, then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now french-classroom
```

## Tests

```bash
npm test
```
