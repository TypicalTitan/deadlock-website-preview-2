// Every other page in the site map as a wireframe: who sees it, and each element it needs as a placeholder. The
// elements come from the vault's feature notes; the priorities are their Build Board tags.
import { html } from 'htm/preact';
import { Blocks } from '../components/block.js';
import { usePage } from '../components/layout.js';

export const pages = {
  '/profile': {
    title: 'Profile',
    who: 'signed-in players; a first sign-in lands here',
    rows: [
      ['P1', 'Profile fields', '[Display name, prefilled from Discord] · [Deadlock in-game name] · [Role: Laner, Roamer or Either] · [Toggle: available to sub]'],
      ['P1', 'Comfort heroes and note', '[Up to 5 heroes from the hero list] · [Short note]'],
      ['P1', 'Usual hours', '[24 one-hour blocks in PT, a weekday row and a weekend row; tap, drag or use the keyboard to paint]'],
      ['P1', 'Blackout days', '[Month calendar covering the event; click a day to mark it out]'],
      ['P1', 'Save', '[Save button] · [Last updated: date]'],
      ['P1', 'Game access reminder', '[Reminder: Deadlock is invite-only, so get access before your first game]'],
      ['P2', 'Local time', '[Your local time next to PT, when your browser isn’t on Pacific time]'],
      ['P2', 'Leave the tournament', '[Leave button] · [Blocked after roster lock for players on a team]'],
      ['P4', 'Per-weekday overrides', '[Different hours for one weekday]'],
    ],
  },
  '/me': {
    title: 'Dashboard',
    who: 'signed-in players',
    rows: [
      ['P1', 'My team', '[Team name and roster], or [No team yet] with links to Teams and to create a team'],
      ['P1', 'My requests', '[Each request: team, status (pending, accepted, declined, cancelled or expired), Cancel]'],
      ['P1', 'To-dos', '[Finish your profile] · [Refresh your availability]'],
      ['P2', 'My next game', '[Opponent] · [Date and time in PT] · [Link to the series]'],
      ['P2', 'Inbox', '[Unread badge] · [Requests, game proposals, results to confirm, announcements]'],
    ],
  },
  '/teams': {
    title: 'Teams',
    who: 'everyone',
    rows: [
      ['P1', 'Team card, one per team', '[Name] [Tag] · [Captain] · [Roster x/5] · [Laners x/3, Roamers x/2] · [Shared free hours this week] · [Status: Open, Full or Locked] · [Request to join]'],
      ['P1', 'Request to join', '[Optional message, up to 200 characters] · [Send request]'],
      ['P1', 'Create a team', '[Name] · [Tag, 2–5 characters] · [Color, optional] · [Create] · [Blocked when you’re on a team or 4 teams exist]'],
    ],
  },
  '/teams/:id': {
    title: 'Team',
    who: 'everyone; the captain also gets the captain controls',
    rows: [
      ['P1', 'Roster', '[Each player: name, role, heroes] · [Sub list]'],
      ['P1', 'Team availability', '[Week heatmap of when the team is free]'],
      ['P1', 'Captain inbox', '[Each request: player, role, heroes, overlap hours] · [Accept] · [Decline, with an optional reason]'],
      ['P1', 'Captain controls, before roster lock', '[Rename] · [Change tag] · [Hand off captaincy] · [Remove a member]'],
      ['P1', 'Leave the team', '[Leave] · [A captain hands off first]'],
      ['P2', 'Role-balance warning', '[Warning when accepting someone would pass 3 laners or 2 roamers]'],
      ['P2', 'More captain controls', '[Disband the team] · [Add subs from the sub pool]'],
      ['P3', 'Series history', '[Past series and results]'],
      ['P3', 'Per-game lineup', '[Pick the 5 players for each game, starters and subs]'],
    ],
  },
  '/players': {
    title: 'Players',
    who: 'everyone',
    rows: [
      ['P2', 'Free agents', '[Each teamless player: name, role, hours]'],
      ['P2', 'Sub pool', '[Players who are available to sub]'],
      ['P2', 'Player card', '[Name] · [Role] · [Team] · [Heroes] (never availability)'],
      ['P4', 'Captain invite', '[Invite this player to your team]'],
    ],
  },
  '/scrims': {
    title: 'Scrims',
    who: 'everyone',
    rows: [
      ['P2', 'Scrim schedule', '[3 rounds of 2 scrims: 1v2 and 3v4, then 1v3 and 2v4, then 1v4 and 2v3]'],
      ['P2', 'Booking and results', '[Book and report each scrim like a bracket game]'],
      ['P2', 'Standings', '[Table: team, wins, losses, head-to-head]'],
      ['P2', 'Seeds', '[Seed order from the standings] · [Admin override note]'],
    ],
  },
  '/series/:id': {
    title: 'Series',
    who: 'everyone; booking and reporting for its captains and ref',
    rows: [
      ['P2', 'Overlap finder', '[The next 14 days in the round window, hour by hour: how many of the 10 players are free, with all-10 slots highlighted]'],
      ['P2', 'Propose and confirm', '[Propose a slot] · [Confirm, or suggest another] · [Confirmed games lock]'],
      ['P2', 'Reschedule', '[Ask to reschedule; the other captain agrees; refs and the admin can force a time]'],
      ['P2', 'Booking rules and ref hours', '[Inside the round window, one game a day, games in order] · [Warning when no ref is free]'],
      ['P2', 'Report a game', '[Winner] · [Side each team played] · [Scoreboard screenshot] · [Match ID, optional] · [Confirm] · [Dispute]'],
      ['P3', 'Series score', '[Score] · [Game 3 only when tied 1–1] · [Link to each game’s draft]'],
      ['P3', 'Add to calendar', '[.ics download or Google Calendar link for each game]'],
    ],
  },
  '/schedule': {
    title: 'Schedule',
    who: 'everyone',
    rows: [
      ['P3', 'Upcoming games', '[Every upcoming game across all series, filterable by team]'],
      ['P2', 'Times', '[Time in PT] · [Your local time, optional]'],
      ['P3', 'Add to calendar', '[For each game]'],
    ],
  },
  '/bracket': {
    title: 'Bracket',
    who: 'everyone',
    rows: [
      ['P3', 'Bracket', '[Upper and lower brackets] · [Series scores] · [Next game time] · [Assigned ref] · (has to work on a phone)'],
      ['P3', 'Round status', '[Each round’s window] · [Each series: finished, booked or overdue]'],
    ],
  },
  '/draft/:gameId': {
    title: 'Draft',
    who: 'the ref and both captains; spectators once the live room exists',
    rows: [
      ['P3', 'Draft sheet, for the ref', '[Coin flips: sides, then Team A] · [6 bans] · [10 picks] · [Lanes] · [Save to the game]'],
      ['P4', 'Live draft room', '[Hero grid, with banned and picked heroes greyed out] · [Turn order] · [45-second timer] · [Captain confirms each choice] · [Ref: pause, undo, restart]'],
      ['P4', 'Lane reveal', '[Each captain assigns York, Broadway, Greenwich and 2 roamers] · [Lock in] · [Both revealed at once]'],
      ['P4', 'Summary card', '[Draft summary to paste into Discord] · [Lobby checklist]'],
    ],
  },
  '/ref': {
    title: 'Ref',
    who: 'refs',
    rows: [
      ['P3', 'Today’s games', '[Teams] · [Lineups] · [Links to the draft sheet and the result form]'],
      ['P3', 'Game checklist', '[Coin flips] · [Draft logged] · [Lanes revealed] · [Lobby made] · [Heroes checked] · [Result confirmed]'],
      ['P3', 'Game tools', '[No-show timer, 15 minutes] · [Pause tracker, 5 minutes per team] · [Remake, first 2 minutes] · [Short-handed record] · [Ref notes]'],
      ['P2', 'My hours', '[The hours I can ref]'],
    ],
  },
  '/admin': {
    title: 'Admin',
    who: 'the admin',
    rows: [
      ['P1', 'Phase switch', '[Setup] · [Signups open] · [Roster locked] · [Scrim week] · [Bracket] · [Finished]'],
      ['P1', 'Event settings', '[Signup deadline] · [Roster-lock time] · [Scrim week dates] · [Each round’s window]'],
      ['P1', 'Roster lock', '[Lock rosters] · (expires pending requests)'],
      ['P2', 'Announcements', '[Banner message] · [Post to Discord, optional]'],
      ['P2', 'Overrides and audit log', '[Edit anything] · [Remove a user] · [Audit log of every change]'],
      ['P2', 'Subs, seeding and export', '[Approve subs] · [Seeding override] · [Export as CSV or JSON]'],
      ['P3', 'Refs, heroes and champions', '[Mark refs] · [Assign a ref to each series] · [Hero list: add, retire, banned until next round] · [Mark the champions]'],
    ],
  },
  '/champions': {
    title: 'Champions',
    who: 'everyone, after the final',
    rows: [['P3', 'Champions', '[Champion team and roster] · [Final bracket] · [Discord role note]']],
  },
};

export function Wireframe({ pattern }) {
  const page = pages[pattern];
  usePage(page.title);
  return html`
    <h1>[Page title: ${page.title.toLowerCase()}]</h1>
    <p>(Who sees it: ${page.who}.)</p>
    <${Blocks} rows=${page.rows} />
  `;
}
