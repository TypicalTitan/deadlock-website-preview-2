// Sign-up page: Discord sign-in, profile and hours, teams and join requests.
(function () {
  const app = document.getElementById("app");
  const msgEl = document.getElementById("msg");
  const { esc } = DB;
  const LANES = ["Any", "York", "Broadway", "Greenwich"];

  let session = null;
  let profile = null;
  let teams = [];
  let myRequests = [];
  let inbox = [];
  let draft = { hours: [], days: [] }; // unsaved availability edits

  function say(text, bad) {
    msgEl.textContent = text || "";
    msgEl.className = "msg" + (bad ? " bad" : "");
  }

  if (!DB.on) {
    app.innerHTML = `<section><h2>Sign-ups aren't open yet</h2><p class="lead">Check back soon. Questions? Ask an organizer.</p></section>`;
    return;
  }

  const sb = DB.client;

  async function load() {
    const { data } = await sb.auth.getSession();
    session = data.session;
    // Clean ?code= out of the address bar after coming back from Discord.
    if (location.search.includes("code=") || location.search.includes("error=")) {
      const p = new URLSearchParams(location.search);
      if (p.get("error_description")) say(p.get("error_description"), true);
      history.replaceState(null, "", location.pathname);
    }
    teams = await DB.loadTeams();
    if (session) {
      const me = session.user.id;
      const [{ data: prof }, { data: reqs }] = await Promise.all([
        sb.from("profiles").select("*").eq("user_id", me).maybeSingle(),
        sb.from("join_requests").select("id, team_id, user_id, status, profiles(display_name, ingame_name, lane, usual_hours)").eq("status", "pending"),
      ]);
      profile = prof;
      draft = { hours: [...(prof?.usual_hours || [])], days: [...(prof?.blackout_days || [])] };
      myRequests = (reqs || []).filter((r) => r.user_id === me);
      inbox = (reqs || []).filter((r) => r.user_id !== me);
    }
    render();
  }

  function discordName() {
    const m = session.user.user_metadata || {};
    return m.custom_claims?.global_name || m.full_name || m.name || m.user_name || "Player";
  }

  function myTeam() {
    return teams.find((t) => t.players.some((p) => p.id === session?.user.id));
  }

  function teamCard(t, action) {
    const shared = DB.hoursText(DB.sharedHours(t.players));
    return `<div class="team">
      <h3>${esc(t.name)}</h3>
      <p class="count">${t.players.length}/6 · everyone free: ${esc(shared)}</p>
      <ol>${t.players.map((p) => `<li>${esc(DB.playerName(p))}${p.captain ? ' <span class="tag">captain</span>' : ""}${p.lane && p.lane !== "Any" ? ` <span class="sub">${esc(p.lane)}</span>` : ""}</li>`).join("")}</ol>
      ${action || ""}
    </div>`;
  }

  function render() {
    if (!session) {
      app.innerHTML = `
        <section class="first">
          <button class="btn primary" data-act="signin">Sign in with Discord</button>
        </section>
        <section><h2>Teams</h2>${teamsHTML(false)}</section>`;
      return;
    }

    const mine = myTeam();
    let teamPart;
    if (mine) {
      const captain = mine.captain_id === session.user.id;
      teamPart = `<section><h2>Your team</h2>
        <div class="teams one">${teamCard(mine)}</div>
        ${captain ? inboxHTML() : ""}
        <button class="btn quiet" data-act="leave">Leave team</button>
        ${captain && mine.players.length > 1 ? `<p class="note">If you leave, captain goes to whoever joined next.</p>` : ""}
      </section>
      <section><h2>All teams</h2>${teamsHTML(false)}</section>`;
    } else {
      teamPart = `<section><h2>Teams</h2>
        <p class="lead">Ask to join a team, or make your own and you're the captain. You can have a few requests out at once; joining a team cancels the rest.</p>
        ${teamsHTML(Boolean(profile))}
        ${teams.length < 4 ? createHTML() : `<p class="note">All 4 teams are made. Ask to join one.</p>`}
      </section>`;
    }

    app.innerHTML = `
      <p class="who">Signed in as <b>${esc(discordName())}</b> <button class="link" data-act="signout">Sign out</button></p>
      ${profileHTML()}
      ${teamPart}`;
    wireHours();
  }

  function teamsHTML(canJoin) {
    if (!teams.length) return `<p class="empty">No teams yet.</p>`;
    return `<div class="teams">${teams.map((t) => {
      let action = "";
      if (canJoin) {
        const pending = myRequests.find((r) => r.team_id === t.id);
        if (pending) action = `<p class="sub">Request sent.</p><button class="btn quiet" data-act="cancel" data-id="${pending.id}">Take it back</button>`;
        else if (t.players.length >= 6) action = `<p class="sub">Full</p>`;
        else action = `<button class="btn" data-act="join" data-id="${t.id}">Ask to join</button>`;
      }
      return teamCard(t, action);
    }).join("")}</div>`;
  }

  function createHTML() {
    if (!profile) return `<p class="note">Save your profile first, then you can make or join a team.</p>`;
    return `<form class="create" data-form="create">
      <label for="team-name">Make a team</label>
      <div class="inline"><input id="team-name" name="name" maxlength="32" minlength="2" required placeholder="Team name"><button class="btn">Make team</button></div>
    </form>`;
  }

  function inboxHTML() {
    if (!inbox.length) return `<p class="note">No join requests right now.</p>`;
    return `<h3 class="sub-h">Join requests</h3><ul class="inbox">${inbox.map((r) => `
      <li><span><b>${esc(DB.playerName(r.profiles || {}))}</b> <span class="sub">${esc(r.profiles?.lane || "Any")} · free ${esc(DB.hoursText(r.profiles?.usual_hours || []))}</span></span>
      <span class="inline"><button class="btn" data-act="accept" data-id="${r.id}">Accept</button><button class="btn quiet" data-act="decline" data-id="${r.id}">Decline</button></span></li>`).join("")}</ul>`;
  }

  function profileHTML() {
    const p = profile || {};
    return `<section><h2>Your profile</h2>
      <form class="profile" data-form="profile">
        <label for="ign">In-game name</label>
        <input id="ign" name="ingame_name" maxlength="32" value="${esc(p.ingame_name || "")}" placeholder="${esc(discordName())}">

        <label for="lane">Lane you like best</label>
        <select id="lane" name="lane">${LANES.map((l) => `<option${(p.lane || "Any") === l ? " selected" : ""}>${l}</option>`).join("")}</select>
        <p class="hint">Just so captains know. Lanes still get picked after every draft.</p>

        <span class="label" id="hours-label">Hours you're usually free (Pacific)</span>
        <p class="hint">Tap or drag across the hours.</p>
        <div class="hours" role="group" aria-labelledby="hours-label">${[...Array(24).keys()].map((h) => `<button type="button" class="hour" data-h="${h}" aria-pressed="${draft.hours.includes(h)}" aria-label="${DB.hourLabel(h)}">${h % 12 || 12}<small>${h < 12 ? "a" : "p"}</small></button>`).join("")}</div>

        <label for="day">Days you can't play</label>
        <div class="inline"><input type="date" id="day"><button type="button" class="btn quiet" data-act="addday">Add day</button></div>
        <ul class="days">${draft.days.sort().map((d) => `<li>${esc(dayText(d))} <button type="button" class="link" data-act="rmday" data-day="${d}" aria-label="Remove ${esc(dayText(d))}">remove</button></li>`).join("")}</ul>

        <button class="btn primary">${profile ? "Save profile" : "Save profile to continue"}</button>
      </form>
    </section>`;
  }

  function dayText(d) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  // Tap or drag to paint hours.
  function wireHours() {
    const box = app.querySelector(".hours");
    if (!box) return;
    let painting = null;
    const set = (btn) => {
      const h = Number(btn.dataset.h);
      btn.setAttribute("aria-pressed", String(painting));
      draft.hours = draft.hours.filter((x) => x !== h);
      if (painting) draft.hours.push(h);
    };
    box.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".hour");
      if (!btn) return;
      e.preventDefault();
      painting = btn.getAttribute("aria-pressed") !== "true";
      set(btn);
    });
    box.addEventListener("pointermove", (e) => {
      if (painting === null) return;
      const btn = document.elementFromPoint(e.clientX, e.clientY)?.closest(".hour");
      if (btn && btn.getAttribute("aria-pressed") !== String(painting)) set(btn);
    });
    addEventListener("pointerup", () => (painting = null));
    // Keyboard: Enter/Space toggles.
    box.addEventListener("click", (e) => {
      const btn = e.target.closest(".hour");
      if (!btn || e.detail !== 0) return;
      painting = btn.getAttribute("aria-pressed") !== "true";
      set(btn);
      painting = null;
    });
  }

  async function run(fn, okText) {
    say("");
    try {
      const { error } = await fn();
      if (error) throw error;
      if (okText) say(okText);
      await load();
    } catch (err) {
      say(err.message || "Something went wrong. Try again.", true);
    }
  }

  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.act) {
      case "signin":
        sb.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: location.origin + location.pathname } });
        break;
      case "signout":
        sb.auth.signOut().then(load);
        break;
      case "join":
        run(() => sb.rpc("request_join", { p_team: id }), "Request sent. The captain will see it.");
        break;
      case "cancel":
        run(() => sb.rpc("cancel_request", { p_request: id }), "Request taken back.");
        break;
      case "accept":
        run(() => sb.rpc("answer_request", { p_request: id, p_accept: true }), "They're on the team.");
        break;
      case "decline":
        run(() => sb.rpc("answer_request", { p_request: id, p_accept: false }), "Request declined.");
        break;
      case "leave":
        if (confirm("Leave your team?")) run(() => sb.rpc("leave_team"), "You left the team.");
        break;
      case "addday": {
        const v = app.querySelector("#day").value;
        if (v && !draft.days.includes(v)) draft.days.push(v);
        rerenderKeepingForm();
        break;
      }
      case "rmday":
        draft.days = draft.days.filter((d) => d !== b.dataset.day);
        rerenderKeepingForm();
        break;
    }
  });

  // Re-render without losing what's typed in the profile form.
  function rerenderKeepingForm() {
    const ign = app.querySelector("#ign")?.value;
    const lane = app.querySelector("#lane")?.value;
    render();
    if (ign !== undefined) app.querySelector("#ign").value = ign;
    if (lane !== undefined) app.querySelector("#lane").value = lane;
  }

  app.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.dataset.form === "profile") {
      const fd = new FormData(f);
      run(() => sb.from("profiles").upsert({
        user_id: session.user.id,
        display_name: discordName(),
        ingame_name: String(fd.get("ingame_name") || "").trim(),
        lane: fd.get("lane"),
        usual_hours: [...new Set(draft.hours)].sort((a, b) => a - b),
        blackout_days: [...new Set(draft.days)].sort(),
        updated_at: new Date().toISOString(),
      }), "Profile saved.");
    }
    if (f.dataset.form === "create") {
      const name = new FormData(f).get("name");
      run(() => sb.rpc("create_team", { p_name: name }), "Team made. You're the captain.");
    }
  });

  sb.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
  });
  load().catch((err) => say(err.message || "Couldn't load sign-ups.", true));
})();
