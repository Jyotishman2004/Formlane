# Formlane

A simple, good-looking alternative to Google Forms. Build a form, style it however you like, share a link, and see the responses.

## Features

- **Build:** 11 question types, required questions, reorder / copy / delete, and "show this question only if…" rules
- **Design:** 20 themes, your own colors, fonts, logo, cover image, background, layout (all at once or one question at a time), box style and buttons, with a live preview
- **Share:** a public link anyone can fill in, with no account, and progress saved if they close the tab
- **Control:** close a form on a date, after a number of responses, or turn it off
- **Responses:** summary charts, a searchable table, and download as CSV
- **Accounts:** email sign-in; everyone sees only their own forms and responses

## Run it

You need Node.js 20+ and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and publishable key
npm run dev
```

Open http://localhost:3000 (or the port shown in the terminal).

## Database setup

Create the tables, security rules and functions in your Supabase project by running the SQL in
[`supabase/schema.sql`](supabase/schema.sql) (SQL Editor in the Supabase dashboard).

Notes:

- Free Supabase projects **pause after about a week of inactivity**. If the app shows "failed to fetch", open the project in the Supabase dashboard and restore it.
- Supabase's built-in email only sends a few sign-in emails per hour. Connect your own email service before real users sign up.

## How it works

- `src/lib/store.ts` is the only file that talks to the database.
- People filling in a form read it through `get_public_form()` and submit through `submit_response()`. Submitting is refused if the form is closed, off, or full.
- Row level security makes sure signed-in users can only read and change their own forms and responses.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development |
| `npm run build` | Build for production |
| `npm run lint` | Check the code |
