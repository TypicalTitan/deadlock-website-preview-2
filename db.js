// Shared sign-up helpers for index.html and signup.html.
const DB = (() => {
  const on = Boolean(window.CONFIG && CONFIG.supabaseUrl && CONFIG.supabaseKey && window.supabase);
  const client = on
    ? supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, { auth: { flowType: "pkce" } })
    : null;

  // Every team with its players, captain first.
  async function loadTeams() {
    const { data, error } = await client
      .from("teams")
      .select("id, name, captain_id, created_at, team_members(user_id, joined_at, profiles(display_name, ingame_name, lane, usual_hours))")
      .order("created_at");
    if (error) throw error;
    return data.map((t) => ({
      ...t,
      players: t.team_members
        .sort((a, b) => (a.user_id === t.captain_id ? -1 : b.user_id === t.captain_id ? 1 : a.joined_at.localeCompare(b.joined_at)))
        .map((m) => ({ id: m.user_id, captain: m.user_id === t.captain_id, ...m.profiles })),
    }));
  }

  // Hours every player on the team has painted as free.
  function sharedHours(players) {
    if (!players.length) return [];
    return players.reduce((acc, p) => acc.filter((h) => (p.usual_hours || []).includes(h)), [...Array(24).keys()]);
  }

  function hourLabel(h) {
    const x = h % 24;
    return `${x % 12 || 12} ${x < 12 ? "AM" : "PM"}`;
  }

  // [19,20,21,22] -> "7 PM to 11 PM"
  function hoursText(hours) {
    if (!hours.length) return "none yet";
    const sorted = [...hours].sort((a, b) => a - b);
    const runs = [];
    for (const h of sorted) {
      const last = runs[runs.length - 1];
      if (last && h === last[1]) last[1] = h + 1;
      else runs.push([h, h + 1]);
    }
    return runs.map(([a, b]) => `${hourLabel(a)} to ${hourLabel(b)}`).join(", ") + " PT";
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function playerName(p) {
    return p.ingame_name || p.display_name || "Player";
  }

  return { on, client, loadTeams, sharedHours, hoursText, hourLabel, esc, playerName };
})();
