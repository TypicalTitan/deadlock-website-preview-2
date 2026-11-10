// Fills the page from data.js. You shouldn't need to edit this file.
(function () {
  const T = TOURNAMENT;
  const s = T.scores || {};

  document.getElementById("title").textContent = T.name;
  document.title = T.name;
  document.getElementById("date").textContent = T.date || "TBD";

  const teamName = (n) => (n && T.teams[n - 1] ? T.teams[n - 1].name : null);

  // Returns { winner, loser } team numbers once a team has won 2 games.
  function result(teams, score) {
    if (!teams || !teams[0] || !teams[1] || !score) return {};
    if (score[0] >= 2) return { winner: teams[0], loser: teams[1] };
    if (score[1] >= 2) return { winner: teams[1], loser: teams[0] };
    return {};
  }

  const draw = T.draw || {};
  const m = {};
  m.semi1 = { title: "Upper semi 1", teams: draw.semi1 || [], labels: ["Random draw", "Random draw"] };
  m.semi2 = { title: "Upper semi 2", teams: draw.semi2 || [], labels: ["Random draw", "Random draw"] };
  for (const k of ["semi1", "semi2"]) Object.assign(m[k], result(m[k].teams, s[k]));

  m.upperFinal = { title: "Upper final", teams: [m.semi1.winner, m.semi2.winner], labels: ["Winner, semi 1", "Winner, semi 2"] };
  Object.assign(m.upperFinal, result(m.upperFinal.teams, s.upperFinal));

  m.lowerRound1 = { title: "Lower round 1", teams: [m.semi1.loser, m.semi2.loser], labels: ["Loser, semi 1", "Loser, semi 2"] };
  Object.assign(m.lowerRound1, result(m.lowerRound1.teams, s.lowerRound1));

  m.lowerFinal = { title: "Lower final", teams: [m.upperFinal.loser, m.lowerRound1.winner], labels: ["Loser, upper final", "Winner, lower R1"] };
  Object.assign(m.lowerFinal, result(m.lowerFinal.teams, s.lowerFinal));

  m.grandFinal = { title: "Grand final", teams: [m.upperFinal.winner, m.lowerFinal.winner], labels: ["Upper champion", "Lower champion"], note: "Straight Bo3. No head start: both finalists begin level." };
  Object.assign(m.grandFinal, result(m.grandFinal.teams, s.grandFinal));

  function matchHTML(key) {
    const x = m[key];
    const score = s[key] || [];
    const rows = [0, 1].map((i) => {
      const name = teamName(x.teams[i]);
      const cls = [name ? "" : "tbd", x.winner && x.teams[i] === x.winner ? "won" : "", x.loser && x.teams[i] === x.loser ? "lost" : ""].join(" ");
      return `<li class="${cls.trim()}"><span>${esc(name || x.labels[i])}</span><b>${score[i] ?? ""}</b></li>`;
    }).join("");
    return `<div class="match${key === "grandFinal" ? " final" : ""}"><h4>${x.title}</h4><ul>${rows}</ul>${x.note ? `<p>${x.note}</p>` : ""}</div>`;
  }

  document.getElementById("bracket-grid").innerHTML = `
    <div class="tier upper"><h3>Upper bracket</h3><div class="row">${matchHTML("semi1")}${matchHTML("semi2")}${matchHTML("upperFinal")}</div></div>
    <div class="tier lower"><h3>Lower bracket</h3><div class="row">${matchHTML("lowerRound1")}${matchHTML("lowerFinal")}</div></div>
    <div class="tier grand"><h3>Grand final</h3><div class="row">${matchHTML("grandFinal")}</div></div>`;

  if (m.grandFinal.winner) {
    const c = document.getElementById("champion");
    c.textContent = `Champions: ${teamName(m.grandFinal.winner)}`;
    c.hidden = false;
  }

  const teamList = document.getElementById("team-list");
  teamList.innerHTML = T.teams.map((t) => `
    <div class="team"><h3>${esc(t.name)}</h3><ol>${t.players.map((p) => `<li${p === "TBD" ? ' class="tbd"' : ""}>${esc(p)}</li>`).join("")}</ol></div>`).join("");

  // Once sign-ups are on, show the real teams instead.
  if (window.DB && DB.on) {
    DB.loadTeams().then((teams) => {
      if (!teams.length) {
        teamList.innerHTML = `<p class="empty">No teams yet. <a href="signup.html">Make the first one.</a></p>`;
        return;
      }
      teamList.innerHTML = teams.map((t) => `
        <div class="team"><h3>${esc(t.name)}</h3>
          <p class="count">${t.players.length}/6</p>
          <ol>${t.players.map((p) => `<li>${esc(DB.playerName(p))}${p.captain ? ' <span class="tag">captain</span>' : ""}</li>`).join("")}</ol>
        </div>`).join("");
    }).catch(() => {});
  }

  function esc(v) {
    return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
