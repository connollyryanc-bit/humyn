(() => {
  const ENERGY = {
    driver: { label: "Driver", color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A", border: "#FCCDC6" },
    energizer: { label: "Energizer", color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00", border: "#FAD98A" },
    supporter: { label: "Supporter", color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38", border: "#9ED4B8" },
    analyst: { label: "Analyst", color: "#1E6FA5", bg: "#EEF4FB", text: "#124A6E", border: "#8DC2E8" },
  };
  const ORDER = ["driver", "energizer", "supporter", "analyst"];

  const TRAITS = [
    ["risk", "Risk-tolerant", "Risk-averse"],
    ["trust", "Trusting", "Sceptical"],
    ["outlook", "Optimistic", "Pragmatic"],
    ["pace", "Deliberate", "Fast-paced"],
    ["expression", "Matter-of-fact", "Expressive"],
    ["autonomy", "Autonomous", "Collaborative"],
    ["dominance", "Supporting", "Dominant"],
  ];

  const COACHING = [
    ["firstImpression", "Making a great first impression"],
    ["buildingTrust", "Building trust"],
    ["givingFeedback", "Giving feedback"],
    ["driveToAction", "Driving them to take action"],
    ["negotiating", "Negotiating"],
    ["followingUp", "Following up"],
    ["meetings", "Running meetings with them"],
  ];

  const TABS = [
    ["overview", "Overview"],
    ["traits", "Traits"],
    ["communicate", "Communicate"],
    ["coaching", "Coaching"],
  ];

  const NOISE = [
    /^(message|connect|follow|more|save in sales navigator|sales insights|contact info|pending|view in sales navigator)$/i,
    /^\d+\+? (connections|followers)$/i,
    /^· ?(1st|2nd|3rd)$/i,
    /mutual connections?$/i,
    /^(show all|see more|…see more|\.\.\.see more|show more)$/i,
  ];

  const INK = "#161311";
  const INK2 = "#4D4945";
  const INK3 = "#9A9A9A";
  const SURFACE = "#F3F0EA";
  const LINE = "0.5px solid rgba(0,0,0,0.07)";

  let state = { open: false, tab: "overview", status: "idle", profile: null, saved: null, error: "", meta: {} };
  let host = null;
  let root = null;
  let currentKey = "";

  function profileKey() {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "in" && parts[1] ? "/in/" + parts[1] : "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanText(raw) {
    const seen = new Set();
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !NOISE.some((re) => re.test(l)))
      .filter((l) => {
        if (l.length > 40) return true;
        if (seen.has(l)) return false;
        seen.add(l);
        return true;
      });
    return lines.join("\n").slice(0, 14000);
  }

  async function readProfile() {
    document
      .querySelectorAll('button.inline-show-more-text__button, button[aria-label*="see more" i]')
      .forEach((b) => {
        try {
          b.click();
        } catch (e) {}
      });
    await new Promise((r) => setTimeout(r, 500));
    const main = document.querySelector("main") || document.body;
    const h1 = main.querySelector("h1");
    const name = h1 ? h1.innerText.trim() : "";
    const headlineEl = main.querySelector(".text-body-medium");
    const headline = headlineEl ? headlineEl.innerText.trim() : "";
    return { text: cleanText(main.innerText), name, headline };
  }

  function storageGet(key) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(key, (r) => resolve(r ? r[key] : undefined));
      } catch (e) {
        resolve(undefined);
      }
    });
  }

  function storageSet(key, value) {
    try {
      chrome.storage.local.set({ [key]: value });
    } catch (e) {}
  }

  function send(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (res) =>
          resolve(res || { ok: false, error: "No response from the extension." }),
        );
      } catch (e) {
        resolve({ ok: false, error: "Extension was reloaded. Refresh this page." });
      }
    });
  }

  async function analyse() {
    state.status = "loading";
    state.error = "";
    state.tab = "overview";
    render();
    const page = await readProfile();
    state.meta = { name: page.name, headline: page.headline };
    if (page.text.length < 200) {
      state.status = "error";
      state.error = "Could not read enough of this profile. Scroll down so the profile loads, then try again.";
      render();
      return;
    }
    const res = await send({ type: "analyse", text: page.text });
    if (!res.ok) {
      state.status = "error";
      state.error = res.error;
      render();
      return;
    }
    state.profile = res.profile;
    state.status = "ready";
    state.saved = null;
    storageSet("profile:" + currentKey, { profile: res.profile, meta: state.meta, saved: null });
    render();
  }

  async function save() {
    const p = state.profile;
    if (!p) return;
    const name = (state.meta.name || p.name || "Unknown").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const initials = (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    const person = {
      id: 0,
      name,
      initials,
      role: state.meta.headline || "Generated from LinkedIn",
      location: "Stockholm",
      primary: p.primary,
      secondary: p.secondary,
      scores: p.scores,
      utilisation: 0,
      available: "now",
      clients: 0,
      revenue: "—",
      dayRate: 1500,
      bio: p.bio,
      capabilities: p.capabilities,
      achievements: p.achievements,
      bestTrait: p.bestTrait,
      vice: p.vice,
      wheelPosition: p.wheelPosition,
      drivers: p.drivers,
      detractors: p.detractors,
      howToSpeak: p.howToSpeak,
      howToEmail: p.howToEmail,
      insights: p.insights || null,
    };
    state.status = "saving";
    render();
    const res = await send({ type: "save", person });
    if (!res.ok) {
      state.status = "ready";
      state.error = "Could not save: " + res.error;
      render();
      return;
    }
    state.status = "ready";
    state.error = "";
    state.saved = { id: res.id, url: res.baseUrl + "/people/" + res.id };
    storageSet("profile:" + currentKey, { profile: p, meta: state.meta, saved: state.saved });
    render();
  }

  // ---------- visual pieces ----------

  function label(text, color) {
    return (
      '<div style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;color:' +
      INK3 +
      ';margin-bottom:10px">' +
      (color ? '<span style="width:8px;height:8px;border-radius:50%;background:' + color + '"></span>' : "") +
      esc(text) +
      "</div>"
    );
  }

  function card(inner, extra) {
    return (
      '<div style="background:#FFFFFF;border:' +
      LINE +
      ";border-radius:12px;padding:16px;margin-bottom:12px;" +
      (extra || "") +
      '">' +
      inner +
      "</div>"
    );
  }

  function bullets(items, dot) {
    return (items || [])
      .map(
        (i) =>
          '<div style="display:flex;gap:10px;align-items:flex-start;margin:0 0 9px"><span style="width:6px;height:6px;border-radius:50%;background:' +
          dot +
          ';margin-top:7px;flex-shrink:0"></span><span style="font-size:13px;line-height:1.55;color:' +
          INK2 +
          '">' +
          esc(i) +
          "</span></div>",
      )
      .join("");
  }

  function arrows(items, up) {
    const col = up ? "#2E8B57" : "#E8402A";
    const glyph = up ? "&#8593;" : "&#8595;";
    return (items || [])
      .map(
        (i) =>
          '<div style="display:flex;gap:10px;align-items:flex-start;margin:0 0 8px"><span style="color:' +
          col +
          ';font-size:13px;font-weight:700;width:12px">' +
          glyph +
          '</span><span style="font-size:13px;line-height:1.5;color:' +
          INK2 +
          '">' +
          esc(i) +
          "</span></div>",
      )
      .join("");
  }

  function ring(scores, centre, accentColor) {
    const r = 42;
    const c = 2 * Math.PI * r;
    const total = ORDER.reduce((a, k) => a + Math.max(0, scores[k] || 0), 0) || 1;
    let offset = 0;
    const gap = 3;
    const segs = ORDER.map((k) => {
      const len = (Math.max(0, scores[k] || 0) / total) * c;
      const dash = Math.max(0, len - gap);
      const s =
        '<circle cx="60" cy="60" r="' +
        r +
        '" fill="none" stroke="' +
        ENERGY[k].color +
        '" stroke-width="14" stroke-dasharray="' +
        dash +
        " " +
        (c - dash) +
        '" stroke-dashoffset="' +
        -offset +
        '" transform="rotate(-90 60 60)"/>';
      offset += len;
      return s;
    }).join("");
    return (
      '<svg width="132" height="132" viewBox="0 0 120 120" style="flex-shrink:0">' +
      segs +
      '<text x="60" y="57" text-anchor="middle" font-size="9" fill="' +
      INK3 +
      '" letter-spacing="1">PULSE</text><text x="60" y="71" text-anchor="middle" font-size="10" font-weight="700" fill="' +
      accentColor +
      '">' +
      esc(centre) +
      "</text></svg>"
    );
  }

  function legend(scores) {
    return ORDER.map((k) => {
      const e = ENERGY[k];
      const v = Math.max(0, Math.min(100, Math.round(scores[k] || 0)));
      return (
        '<div style="margin:0 0 9px"><div style="display:flex;justify-content:space-between;font-size:12px;color:' +
        INK2 +
        ';margin-bottom:4px"><span>' +
        e.label +
        '</span><span style="color:' +
        INK3 +
        '">' +
        v +
        '</span></div><div style="height:5px;background:' +
        SURFACE +
        ';border-radius:100px"><div style="width:' +
        v +
        "%;height:5px;background:" +
        e.color +
        ';border-radius:100px"></div></div></div>'
      );
    }).join("");
  }

  function sliders(traits, accent) {
    return TRAITS.map((t) => {
      const v = Math.max(0, Math.min(100, Number(traits[t[0]]) || 50));
      return (
        '<div style="margin:0 0 16px"><div style="display:flex;justify-content:space-between;font-size:10px;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:7px"><span style="color:' +
        (v < 45 ? INK : INK3) +
        ";font-weight:" +
        (v < 45 ? 700 : 500) +
        '">' +
        t[1] +
        '</span><span style="color:' +
        (v > 55 ? INK : INK3) +
        ";font-weight:" +
        (v > 55 ? 700 : 500) +
        '">' +
        t[2] +
        '</span></div><div style="position:relative;height:16px"><div style="position:absolute;left:0;right:0;top:7px;height:2px;background:' +
        SURFACE +
        ';border-radius:100px"></div><div style="position:absolute;left:50%;top:4px;width:1px;height:8px;background:rgba(0,0,0,0.12)"></div><div style="position:absolute;left:calc(' +
        v +
        '% - 8px);top:0;width:16px;height:16px;border-radius:50%;background:' +
        accent +
        ';border:2px solid #FFFFFF;box-sizing:border-box;box-shadow:0 0 0 1px rgba(0,0,0,0.1)"></div></div></div>'
      );
    }).join("");
  }

  function btn(id, text, dark) {
    return (
      '<button id="' +
      id +
      '" style="all:unset;cursor:pointer;padding:9px 16px;border-radius:100px;font-size:13px;font-weight:500;text-align:center;' +
      (dark ? "background:" + INK + ";color:#FFFFFF;" : "background:#FFFFFF;color:" + INK + ";border:0.5px solid rgba(0,0,0,0.15);") +
      '">' +
      text +
      "</button>"
    );
  }

  function note(text) {
    return (
      '<div style="padding:12px;border-radius:8px;background:#FDF0EE;color:#9B2A1A;font-size:12px;line-height:1.5;margin-bottom:12px">' +
      esc(text) +
      "</div>"
    );
  }

  // ---------- tab bodies ----------

  function tabOverview(p, e) {
    return (
      card(
        '<div style="display:flex;align-items:center;gap:16px">' +
          ring(p.scores, e.label.toUpperCase(), e.color) +
          '<div style="flex:1">' +
          legend(p.scores) +
          "</div></div>",
      ) +
      card(label("Summary", e.color) + '<div style="font-size:13px;line-height:1.6;color:' + INK2 + '">' + esc(p.bio) + "</div>") +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      card(label("Best trait") + '<div style="font-size:13px;line-height:1.55;color:' + INK2 + '">' + esc(p.bestTrait) + "</div>", "margin:0") +
      card(label("Watch-out") + '<div style="font-size:13px;line-height:1.55;color:' + INK2 + '">' + esc(p.vice) + "</div>", "margin:0") +
      "</div>" +
      '<div style="height:12px"></div>' +
      card(label("Energized by", "#2E8B57") + arrows(p.drivers, true)) +
      card(label("Drained by", "#E8402A") + arrows(p.detractors, false))
    );
  }

  function needsRerun() {
    return card(
      '<div style="font-size:13px;line-height:1.6;color:' +
        INK2 +
        '">This saved profile was made before deep-dive sections existed. Press <b>Re-run</b> below to generate them.</div>',
    );
  }

  function tabTraits(p, e) {
    const i = p.insights;
    if (!i) return needsRerun();
    return (
      card(label("Personality traits", e.color) + sliders(i.traits || {}, e.color)) +
      (i.behaviours && i.behaviours.length ? card(label("Typical behaviours", e.color) + bullets(i.behaviours, e.color)) : "") +
      (i.strengths && i.strengths.length ? card(label("Strengths") + bullets(i.strengths, "#2E8B57")) : "") +
      (i.blindSpots && i.blindSpots.length ? card(label("Blind spots") + bullets(i.blindSpots, "#E8402A")) : "")
    );
  }

  function tabCommunicate(p, e) {
    const i = p.insights;
    let out = "";
    if (i && ((i.doList && i.doList.length) || (i.dontList && i.dontList.length))) {
      out +=
        card(
          label("How to communicate", e.color) +
            '<div style="font-size:12px;font-weight:700;color:#2E8B57;margin-bottom:8px">Do</div>' +
            bullets(i.doList, "#2E8B57") +
            '<div style="font-size:12px;font-weight:700;color:#E8402A;margin:14px 0 8px">Don&#39;t</div>' +
            bullets(i.dontList, "#E8402A"),
        );
    }
    out +=
      card(label("How to speak with them", e.color) + '<div style="font-size:13px;line-height:1.6;color:' + INK2 + '">' + esc(p.howToSpeak) + "</div>") +
      card(label("How to write to them", e.color) + '<div style="font-size:13px;line-height:1.6;color:' + INK2 + '">' + esc(p.howToEmail) + "</div>");
    return out;
  }

  function tabCoaching(p, e) {
    const i = p.insights;
    if (!i) return needsRerun();
    return COACHING.filter((c) => i[c[0]])
      .map((c) =>
        card(
          '<div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:' +
            INK +
            ';margin-bottom:8px"><span style="width:8px;height:8px;border-radius:50%;background:' +
            e.color +
            '"></span>' +
            c[1] +
            '</div><div style="font-size:13px;line-height:1.6;color:' +
            INK2 +
            '">' +
            esc(i[c[0]]) +
            "</div>",
        ),
      )
      .join("");
  }

  function panel() {
    const name = esc(state.meta.name || (state.profile && state.profile.name) || "");
    const headline = esc(state.meta.headline || "");
    const head = function (bg, border, inner) {
      return (
        '<div style="background:' +
        bg +
        ";border-bottom:0.5px solid " +
        border +
        ';padding:18px 20px 16px;position:relative"><button id="hm-close" style="all:unset;cursor:pointer;position:absolute;right:14px;top:12px;font-size:20px;color:' +
        INK3 +
        ';padding:0 4px">&times;</button>' +
        '<div style="font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;color:' +
        INK3 +
        ';margin-bottom:6px">humy<span style="color:#FF5040">n</span> pulse</div>' +
        inner +
        "</div>"
      );
    };

    let body = "";
    let header = "";
    let footer = "";

    if (state.status === "loading") {
      header = head(SURFACE, "rgba(0,0,0,0.07)", '<div style="font-size:19px;font-weight:600;color:' + INK + '">' + (name || "Reading profile") + "</div>");
      body =
        '<div style="padding:36px 20px;font-size:13px;line-height:1.6;color:' +
        INK2 +
        '">Reading the profile and building the Pulse with deep-dive insights. This takes 20 to 50 seconds.</div>';
    } else if (!state.profile) {
      header = head(SURFACE, "rgba(0,0,0,0.07)", '<div style="font-size:19px;font-weight:600;color:' + INK + '">' + (name || "This profile") + "</div>");
      body =
        '<div style="padding:20px">' +
        '<div style="font-size:13px;line-height:1.6;color:' +
        INK2 +
        ';margin-bottom:16px">Build a Humyn Pulse profile from this LinkedIn page: energy mix, personality traits, strengths, blind spots, and how to communicate with them.</div>' +
        (state.error ? note(state.error) : "") +
        btn("hm-analyse", "Analyse this profile", true) +
        "</div>";
    } else {
      const p = state.profile;
      const e = ENERGY[p.primary] || ENERGY.driver;
      const chips = (p.capabilities || [])
        .slice(0, 3)
        .map(
          (c) =>
            '<span style="display:inline-block;padding:3px 10px;margin:0 6px 6px 0;border-radius:100px;background:#FFFFFF;border:0.5px solid ' +
            e.border +
            ";font-size:11px;font-weight:500;color:" +
            e.text +
            '">' +
            esc(c) +
            "</span>",
        )
        .join("");
      header = head(
        e.bg,
        e.border,
        '<div style="display:flex;align-items:center;gap:12px"><div style="width:44px;height:44px;border-radius:50%;background:#FFFFFF;border:1px solid ' +
          e.border +
          ";color:" +
          e.text +
          ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0">' +
          esc((name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()) +
          '</div><div style="min-width:0"><div style="font-size:19px;font-weight:600;color:' +
          INK +
          ';letter-spacing:-0.3px">' +
          name +
          '</div><div style="font-size:12px;color:' +
          INK2 +
          ';margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:270px">' +
          headline +
          "</div></div></div>" +
          '<div style="margin-top:14px;display:flex;align-items:center;gap:10px"><span style="display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:100px;background:#FFFFFF;color:' +
          e.text +
          ';font-size:12px;font-weight:600"><span style="width:8px;height:8px;border-radius:50%;background:' +
          e.color +
          '"></span>' +
          esc(p.wheelPosition) +
          '</span><span style="font-size:11px;color:' +
          INK3 +
          '">Confidence ' +
          Math.round(p.confidence) +
          "% &middot; predicted from public text</span></div>" +
          '<div style="margin-top:12px">' +
          chips +
          "</div>",
      );

      const tabs =
        '<div style="display:flex;border-bottom:' +
        LINE +
        ';background:#FFFFFF;position:sticky;top:0;z-index:1">' +
        TABS.map((t) => {
          const on = state.tab === t[0];
          return (
            '<button data-tab="' +
            t[0] +
            '" style="all:unset;cursor:pointer;flex:1;text-align:center;padding:12px 4px;font-size:12px;font-weight:' +
            (on ? 600 : 500) +
            ";color:" +
            (on ? INK : INK3) +
            ";border-bottom:2px solid " +
            (on ? e.color : "transparent") +
            '">' +
            t[1] +
            "</button>"
          );
        }).join("") +
        "</div>";

      let content = "";
      if (state.tab === "overview") content = tabOverview(p, e);
      else if (state.tab === "traits") content = tabTraits(p, e);
      else if (state.tab === "communicate") content = tabCommunicate(p, e);
      else content = tabCoaching(p, e);

      body = tabs + '<div style="padding:16px 16px 4px">' + (state.error ? note(state.error) : "") + content + "</div>";

      footer =
        '<div style="padding:12px 16px;border-top:' +
        LINE +
        ';background:#FFFFFF;display:flex;gap:8px;align-items:center">' +
        (state.saved
          ? '<a href="' +
            esc(state.saved.url) +
            '" target="_blank" rel="noopener" style="all:unset;cursor:pointer;padding:9px 16px;border-radius:100px;font-size:13px;font-weight:500;background:#2E8B57;color:#FFFFFF">Saved. Open in Humyn</a>'
          : btn("hm-save", state.status === "saving" ? "Saving..." : "Save to Humyn", true)) +
        btn("hm-redo", "Re-run", false) +
        "</div>";
    }

    return (
      '<div style="position:fixed;top:0;right:0;bottom:0;width:410px;max-width:100vw;background:' +
      SURFACE +
      ";border-left:" +
      LINE +
      ';box-shadow:-8px 0 28px rgba(0,0,0,0.08);display:flex;flex-direction:column">' +
      header +
      '<div style="flex:1;overflow-y:auto">' +
      body +
      "</div>" +
      footer +
      "</div>"
    );
  }

  function render() {
    if (!root) return;
    const toggle =
      '<button id="hm-toggle" style="all:unset;cursor:pointer;position:fixed;right:16px;bottom:16px;padding:11px 18px;border-radius:100px;background:' +
      INK +
      ';color:#FFFFFF;font-size:15px;font-weight:700;letter-spacing:-0.3px;box-shadow:0 4px 14px rgba(0,0,0,0.18)">hum<span style="color:#FF5040">y</span>n</button>';
    root.innerHTML =
      '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;z-index:2147483646;position:fixed;inset:0;pointer-events:none"><div style="pointer-events:auto">' +
      (state.open ? panel() : toggle) +
      "</div></div>";
  }

  function onClick(e) {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset && t.dataset.tab) {
      state.tab = t.dataset.tab;
      render();
      return;
    }
    if (t.id === "hm-toggle") {
      state.open = true;
      render();
    } else if (t.id === "hm-close") {
      state.open = false;
      render();
    } else if (t.id === "hm-analyse" || t.id === "hm-redo") {
      analyse();
    } else if (t.id === "hm-save") {
      save();
    }
  }

  function mount() {
    if (host) return;
    host = document.createElement("div");
    host.id = "humyn-pulse-root";
    root = host.attachShadow({ mode: "open" });
    root.addEventListener("click", onClick);
    document.documentElement.appendChild(host);
  }

  function unmount() {
    if (host) host.remove();
    host = null;
    root = null;
  }

  async function sync() {
    const key = profileKey();
    if (!key) {
      unmount();
      currentKey = "";
      return;
    }
    mount();
    if (key === currentKey) return;
    currentKey = key;
    state = { open: state.open, tab: "overview", status: "idle", profile: null, saved: null, error: "", meta: {} };
    render();
    const cached = await storageGet("profile:" + key);
    if (cached && cached.profile && key === currentKey) {
      state.profile = cached.profile;
      state.meta = cached.meta || {};
      state.saved = cached.saved || null;
      state.status = "ready";
      render();
    }
  }

  sync();
  setInterval(sync, 1000);
})();
