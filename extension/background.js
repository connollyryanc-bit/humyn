const BASE_URL = "https://humyn-six.vercel.app";

async function post(path, body) {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed (" + res.status + ")");
  return data;
}

async function handle(msg) {
  try {
    if (msg.type === "analyse") {
      const data = await post("/api/pulse", { text: msg.text });
      return { ok: true, profile: data.profile };
    }
    if (msg.type === "save") {
      const data = await post("/api/people", { person: msg.person });
      return { ok: true, id: data.person.id, baseUrl: BASE_URL };
    }
    return { ok: false, error: "Unknown request." };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed." };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handle(msg).then(sendResponse);
  return true;
});
