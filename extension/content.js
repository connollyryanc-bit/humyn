(() => {
  const ENERGY = {
    driver: { label: "Driver", color: "#E8402A", bg: "#FDF0EE", text: "#9B2A1A" },
    energizer: { label: "Energizer", color: "#F5A623", bg: "#FFFBF2", text: "#8B5A00" },
    supporter: { label: "Supporter", color: "#2E8B57", bg: "#EEF7F2", text: "#1A5C38" },
    analyst: { label: "Analyst", color: "#1E6FA5", bg: "#EEF4FB", text: "#124A6E" },
  };
  const ORDER = ["driver", "energizer", "supporter", "analyst"];

  const NOISE = [
    /^(message|connect|follow|more|save in sales navigator|sales insights|contact info|pending|view in sales navigator)$/i,
    /^\d+\+? (connections|followers)$/i,
    /^· ?(1st|2nd|3rd)$/i,
    /mutual connections?$/i,
    /^(show all|see more|…see more|\.\.\.see more|show more)$/i,
  ];

  let state = { open: false, status: "idle", profile: null, saved: null, error: "", meta: {} };
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

  function section(label, body) {
    return (
      '<div style="margin-top:16px"><div style="font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;color:#9A9A9A;margin-bottom:6px">' +
      esc(label) +
      '</div><div style="font-size:13px;line-height:1.6;color:#4D4945">' +
      body +
      "</div></div>"
    );
  }

  function list(items) {
    return (items || [])
      .map((i) => '<div style="padding:2px 0">' + esc(i) + "</div>")
      .join("");
  }

  function bars(scores) {
    return ORDER.map((k) => {
      const e = ENERGY[k];
      const v = Math.max(0, Math.min(100, Math.round(scores[k] || 0)));
      return (
        '<div style="display:flex;align-items:center;gap:10px;margin:7px 0"><span style="width:74px;font-size:12px;color:#4D4945">' +
        e.label +
        '</span><div style="flex:1;height:6px;background:#F3F0EA;border-radius:100px"><div style="width:' +
        v +
        "%;height:6px;background:" +
        e.color +
        ';border-radius:100px"></div></div><span style="width:34px;text-align:right;font-size:12px;color:#9A9A9A">' +
        v +
        "%</span></div>"
      );
    }).join("");
  }

  function btn(id, label, dark) {
    return (
      '<button id="' +
      id +
      '" style="all:unset;cursor:pointer;padding:9px 16px;border-radius:100px;font-size:13px;font-weight:500;' +
      (dark
        ? "background:#161311;color:#FFFFFF;"
        : "background:#FFFFFF;color:#161311;border:0.5px solid rgba(0,0,0,0.15);") +
      '">' +
      label +
      "</button>"
    );
  }

  function panelBody() {
    if (state.status === "loading") {
      return '<div style="padding:32px 0;font-size:13px;color:#4D4945">Reading the profile and building the Pulse. This takes 15 to 40 seconds.</div>';
    }
    if (state.status === "idle" || (state.status === "error" && !state.profile)) {
      return (
        '<div style="font-size:13px;line-height:1.6;color:#4D4945;margin-bottom:16px">Build a Humyn Pulse profile from this LinkedIn page, with how to speak and write to them.</div>' +
        btn("hm-analyse", "Analyse this profile", true) +
        (state.error
          ? '<div style="margin-top:14px;padding:12px;border-radius:8px;background:#FDF0EE;color:#9B2A1A;font-size:12px;line-height:1.5">' +
            esc(state.error) +
            "</div>"
          : "")
      );
    }
    const p = state.profile;
    const e = ENERGY[p.primary] || ENERGY.driver;
    return (
      '<div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:100px;background:' +
      e.bg +
      ";color:" +
      e.text +
      ';font-size:12px;font-weight:600"><span style="width:8px;height:8px;border-radius:50%;background:' +
      e.color +
      '"></span>' +
      esc(p.wheelPosition) +
      '</div><span style="margin-left:10px;font-size:12px;color:#9A9A9A">Confidence ' +
      Math.round(p.confidence) +
      "%</span>" +
      '<div style="margin-top:14px">' +
      bars(p.scores) +
      "</div>" +
      section("Summary", esc(p.bio)) +
      section("Best trait", esc(p.bestTrait)) +
      section("Watch-out", esc(p.vice)) +
      section("How to speak with them", esc(p.howToSpeak)) +
      section("How to write to them", esc(p.howToEmail)) +
      section("Motivated by", list(p.drivers)) +
      section("Drained by", list(p.detractors)) +
      (state.error
        ? '<div style="margin-top:14px;padding:12px;border-radius:8px;background:#FDF0EE;color:#9B2A1A;font-size:12px">' +
          esc(state.error) +
          "</div>"
        : "") +
      '<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">' +
      (state.saved
        ? '<a href="' +
          esc(state.saved.url) +
          '" target="_blank" rel="noopener" style="all:unset;cursor:pointer;padding:9px 16px;border-radius:100px;font-size:13px;font-weight:500;background:#2E8B57;color:#FFFFFF">Saved. Open in Humyn</a>'
        : btn("hm-save", state.status === "saving" ? "Saving..." : "Save to Humyn", true)) +
      btn("hm-redo", "Re-run", false) +
      "</div>"
    );
  }

  function render() {
    if (!root) return;
    const nameLine = esc(state.meta.name || "");
    root.innerHTML =
      '<div style="position:fixed;right:16px;bottom:16px;z-index:2147483646;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif">' +
      (state.open
        ? '<div style="position:absolute;right:0;bottom:52px;width:380px;max-height:78vh;overflow:auto;background:#FFFFFF;border:0.5px solid rgba(0,0,0,0.07);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.12);padding:20px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px"><div><div style="font-size:11px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;color:#9A9A9A">Humyn Pulse</div>' +
          (nameLine ? '<div style="font-size:18px;font-weight:600;color:#161311;margin-top:4px">' + nameLine + "</div>" : "") +
          '</div><button id="hm-close" style="all:unset;cursor:pointer;font-size:18px;color:#9A9A9A;padding:0 4px">×</button></div>' +
          panelBody() +
          "</div>"
        : "") +
      '<button id="hm-toggle" style="all:unset;cursor:pointer;padding:11px 18px;border-radius:100px;background:#161311;color:#FFFFFF;font-size:15px;font-weight:700;letter-spacing:-0.3px;box-shadow:0 4px 14px rgba(0,0,0,0.18)">hum<span style="color:#FF5040">y</span>n</button></div>';
  }

  function onClick(e) {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.id === "hm-toggle") {
      state.open = !state.open;
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
    state = { open: state.open, status: "idle", profile: null, saved: null, error: "", meta: {} };
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
