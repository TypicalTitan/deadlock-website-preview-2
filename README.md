# Deadlock Tournament

Site for our friends-only Deadlock tournament. 4 teams of 6, double elimination, best of 3.

Live: https://typicaltitan.github.io/deadlock-website-preview-2/

## Updating the page

The date, bracket draw and scores live in `data.js`:

- **Date:** set `date`, e.g. `"Saturday, Dec 6"`.
- **Bracket draw:** once it's drawn, set `draw`, e.g. `semi1: [3, 1], semi2: [4, 2]` (team numbers 1 to 4, in the order teams were made).
- **Results:** put games won in `scores`, e.g. `semi1: [2, 1]`. Winners move on and losers drop to the lower bracket on their own.
- **Team names:** until sign-ups are on, the Teams section and the bracket use the names in `teams`. Once sign-ups are on, the Teams section shows the real teams. Copy their names into `teams` so the bracket matches.

Edit a file right on GitHub (pencil icon), commit, and the site updates in a minute or two.

The full rules are in `rulebook.pdf`.

## Turning on sign-ups

GitHub Pages only serves files, so accounts and teams live in a free Supabase database. Until it's set up, the sign-up page says "Sign-ups aren't open yet."

1. Make a free project at supabase.com.
2. In Supabase, open **SQL Editor**, paste all of `schema.sql`, and press **Run**.
3. At discord.com/developers, make a **New Application**. Under **OAuth2**, copy the Client ID and Client Secret, and add this redirect: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
4. In Supabase, go to **Authentication > Sign In / Providers > Discord**, turn it on, and paste the ID and secret.
5. In **Authentication > URL Configuration**, set the Site URL to `https://typicaltitan.github.io/deadlock-website-preview-2/` and add `https://typicaltitan.github.io/deadlock-website-preview-2/signup.html` to Redirect URLs.
6. In **Project Settings > API**, copy the Project URL and the anon (publishable) key into `config.js`. Never paste the secret / service_role key.

What players can do: sign in with Discord, set their in-game name, lane they like, the hours they're usually free and days they can't play, make a team (they become captain), or ask to join one. Captains accept or decline requests. Max 4 teams, 6 players each.

Organizer stuff happens in Supabase's **Table Editor**: lock rosters when the bracket starts by setting `roster_locked` to true in `settings`, and move or remove players by hand.

Free Supabase projects pause after a week with no activity. One click in the dashboard wakes it back up.
