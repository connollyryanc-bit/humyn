"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RateCardRow,
  fetchRateCards,
  upsertRateCardViaApi,
  deleteRateCardViaApi,
} from "../../lib/api-client";

const MARKETS = ["Stockholm", "Oslo", "Copenhagen", "Helsinki"] as const;

function HumynWordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="font-display"
      style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.5px", color: "#161311" }}
    >
      hum<span style={{ color: "#FF5040" }}>y</span>n
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#9A9A9A",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 500,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(0,0,0,0.07)",
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}

interface DraftCell {
  roleBand: string;
  seniority: string;
  market: string;
  dayRateEur: number;
}

function RateCell({
  row,
  market,
  cards,
  onSave,
}: {
  row: { roleBand: string; seniority: string };
  market: string;
  cards: RateCardRow[];
  onSave: (draft: DraftCell) => Promise<void>;
}) {
  const existing = cards.find(
    (c) => c.roleBand === row.roleBand && c.seniority === row.seniority && c.market === market,
  );
  const [value, setValue] = useState<string>(existing ? String(existing.dayRateEur) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setValue(existing ? String(existing.dayRateEur) : "");
  }, [existing?.dayRateEur, existing?.id]);

  const numeric = Number(value);
  const dirty =
    value !== "" && Number.isFinite(numeric) && numeric !== (existing?.dayRateEur ?? -1);

  async function commit() {
    if (!dirty) return;
    setBusy(true);
    setError("");
    try {
      await onSave({
        roleBand: row.roleBand,
        seniority: row.seniority,
        market,
        dayRateEur: Math.round(numeric),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <td style={{ padding: "6px 4px" }} title={error || undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#9A9A9A" }}>€</span>
        <input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          disabled={busy}
          style={{
            width: 78,
            padding: "6px 8px",
            borderRadius: 6,
            border: `0.5px solid ${error ? "#FCCDC6" : dirty ? "#FAD98A" : "rgba(0,0,0,0.07)"}`,
            background: error ? "#FDF0EE" : dirty ? "#FFFBF2" : "#FFFFFF",
            color: "#161311",
            fontSize: 12,
            fontFamily: "inherit",
            outline: "none",
            textAlign: "right",
          }}
        />
      </div>
    </td>
  );
}

export default function RateCardPage() {
  const [cards, setCards] = useState<RateCardRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [newBand, setNewBand] = useState<string>("");
  const [newSeniority, setNewSeniority] = useState<string>("Senior");

  useEffect(() => {
    let cancelled = false;
    fetchRateCards()
      .then((list) => {
        if (cancelled) return;
        setCards(list);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load.");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const keys = new Map<string, { roleBand: string; seniority: string }>();
    cards.forEach((c) => {
      keys.set(`${c.roleBand}::${c.seniority}`, {
        roleBand: c.roleBand,
        seniority: c.seniority,
      });
    });
    return Array.from(keys.values()).sort((a, b) => {
      const r = a.roleBand.localeCompare(b.roleBand);
      if (r !== 0) return r;
      return a.seniority.localeCompare(b.seniority);
    });
  }, [cards]);

  async function saveCell(draft: DraftCell) {
    const saved = await upsertRateCardViaApi(draft);
    setCards((prev) => {
      const others = prev.filter(
        (c) =>
          !(
            c.roleBand === saved.roleBand &&
            c.seniority === saved.seniority &&
            c.market === saved.market
          ),
      );
      return [...others, saved];
    });
  }

  async function addRow() {
    if (!newBand.trim() || !newSeniority.trim()) return;
    for (const market of MARKETS) {
      const exists = cards.some(
        (c) => c.roleBand === newBand && c.seniority === newSeniority && c.market === market,
      );
      if (exists) continue;
      const saved = await upsertRateCardViaApi({
        roleBand: newBand.trim(),
        seniority: newSeniority.trim(),
        market,
        dayRateEur: 0,
      });
      setCards((prev) => [...prev, saved]);
    }
    setNewBand("");
  }

  async function deleteRow(roleBand: string, seniority: string) {
    if (!confirm(`Delete the "${roleBand} · ${seniority}" row from the rate card?`)) return;
    const ids = cards
      .filter((c) => c.roleBand === roleBand && c.seniority === seniority)
      .map((c) => c.id);
    for (const id of ids) {
      await deleteRateCardViaApi(id);
    }
    setCards((prev) =>
      prev.filter((c) => !(c.roleBand === roleBand && c.seniority === seniority)),
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F0EA" }}>
      <header
        style={{
          height: 52,
          background: "#FFFFFF",
          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link href="/">
            <HumynWordmark />
          </Link>
          <nav style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <Link
              href="/"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              People
            </Link>
            <Link
              href="/teams"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Teams
            </Link>
            <Link
              href="/available"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Available
            </Link>
            <Link
              href="/capacity"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Capacity
            </Link>
            <Link
              href="/insights"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Insights
            </Link>
            <Link
              href="/board"
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                color: "#4D4945",
              }}
            >
              Board
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <Link
            href="/"
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: "0.5px solid rgba(0,0,0,0.07)",
              background: "#FFFFFF",
              color: "#161311",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            ← Back to People
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9A9A9A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Settings · Rate card
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#161311",
              letterSpacing: "-0.5px",
              margin: "6px 0 4px",
            }}
          >
            Rate card
          </h1>
          <div style={{ fontSize: 13, color: "#5A5A5A", maxWidth: 720, lineHeight: 1.6 }}>
            Central day rates per role band, seniority and market. Type into any cell, tab or click
            away, and the change saves. The Brief → Team friction-cost projection and the team
            builder both pick up rate-card values for any person whose individual day rate is set
            to <code>0</code> on their profile — explicit per-person rates always override the card.
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              background: "#FDF0EE",
              border: "0.5px solid #FCCDC6",
              borderRadius: 10,
              fontSize: 13,
              color: "#9B2A1A",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {!loaded ? (
          <Card>Loading rate card…</Card>
        ) : (
          <Card>
            <SectionLabel>Day rates · €</SectionLabel>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        fontSize: 10,
                        color: "#9A9A9A",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                      }}
                    >
                      Role band
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        fontSize: 10,
                        color: "#9A9A9A",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                      }}
                    >
                      Seniority
                    </th>
                    {MARKETS.map((m) => (
                      <th
                        key={m}
                        style={{
                          textAlign: "right",
                          padding: "8px 10px",
                          fontSize: 10,
                          color: "#9A9A9A",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        {m}
                      </th>
                    ))}
                    <th style={{ borderBottom: "0.5px solid rgba(0,0,0,0.07)" }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.roleBand}::${row.seniority}`}>
                      <td
                        style={{
                          padding: "10px",
                          fontSize: 13,
                          color: "#161311",
                          fontWeight: 600,
                          borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        {row.roleBand}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontSize: 12,
                          color: "#5A5A5A",
                          borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        {row.seniority}
                      </td>
                      {MARKETS.map((m) => (
                        <RateCell
                          key={m}
                          row={row}
                          market={m}
                          cards={cards}
                          onSave={saveCell}
                        />
                      ))}
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <button
                          onClick={() => deleteRow(row.roleBand, row.seniority)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "0.5px solid rgba(0,0,0,0.07)",
                            background: "#FFFFFF",
                            color: "#9B2A1A",
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "0.5px solid rgba(0,0,0,0.06)",
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 11, color: "#9A9A9A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Add row
              </span>
              <input
                value={newBand}
                onChange={(e) => setNewBand(e.target.value)}
                placeholder="Role band (e.g. Marketing)"
                style={{
                  padding: "7px 10px",
                  borderRadius: 7,
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#161311",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                  width: 240,
                }}
              />
              <select
                value={newSeniority}
                onChange={(e) => setNewSeniority(e.target.value)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 7,
                  border: "0.5px solid rgba(0,0,0,0.07)",
                  background: "#FFFFFF",
                  color: "#161311",
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <option value="Director">Director</option>
                <option value="Principal">Principal</option>
                <option value="Senior">Senior</option>
                <option value="Mid">Mid</option>
                <option value="Junior">Junior</option>
              </select>
              <button
                onClick={addRow}
                disabled={!newBand.trim()}
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  border: "none",
                  background: newBand.trim() ? "#161311" : "#EDEDEA",
                  color: newBand.trim() ? "#FFFFFF" : "#9A9A9A",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: newBand.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                Add to card
              </button>
              <span style={{ fontSize: 11, color: "#9A9A9A" }}>
                Adds a blank row for every market. Edit the cells to set rates.
              </span>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
