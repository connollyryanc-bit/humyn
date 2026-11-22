"use client";

import type { ReactNode } from "react";
import { COACHING_SECTIONS, PersonInsights, TRAITS } from "../lib/insights";

export interface Accent {
  color: string;
  bg: string;
  text: string;
  border: string;
}

const CARD_BORDER = "0.5px solid rgba(0,0,0,0.07)";
const GREEN = "#2E8B57";
const RED = "#E8402A";

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: CARD_BORDER,
        borderRadius: 12,
        padding: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, accent }: { children: ReactNode; accent?: Accent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#9A9A9A",
        marginBottom: 12,
      }}
    >
      {accent && (
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent.color }} />
      )}
      {children}
    </div>
  );
}

function Bullets({ items, dot }: { items: string[]; dot: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dot,
              marginTop: 7,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: "#4D4945", lineHeight: 1.55 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TraitSliders({ insights, accent }: { insights: PersonInsights; accent: Accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {TRAITS.map((t) => {
        const v = Math.max(0, Math.min(100, insights.traits[t.key] ?? 50));
        return (
          <div
            key={t.key}
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 110px",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: v < 45 ? "#161311" : "#9A9A9A",
                fontWeight: v < 45 ? 600 : 500,
              }}
            >
              {t.left}
            </span>
            <div style={{ position: "relative", height: 18 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 8,
                  height: 2,
                  background: "#F3F0EA",
                  borderRadius: 100,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 5,
                  width: 1,
                  height: 8,
                  background: "rgba(0,0,0,0.12)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `calc(${v}% - 8px)`,
                  top: 1,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: accent.color,
                  border: "2px solid #FFFFFF",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                textAlign: "right",
                color: v > 55 ? "#161311" : "#9A9A9A",
                fontWeight: v > 55 ? 600 : 500,
              }}
            >
              {t.right}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function InsightSections({
  insights,
  firstName,
  accent,
}: {
  insights: PersonInsights;
  firstName: string;
  accent: Accent;
}) {
  const coaching = COACHING_SECTIONS.filter((s) => {
    const v = insights[s.key];
    return typeof v === "string" && v.length > 0;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <Label accent={accent}>Personality traits</Label>
        <TraitSliders insights={insights} accent={accent} />
      </Card>

      {insights.behaviours.length > 0 && (
        <Card>
          <Label accent={accent}>Typical behaviours</Label>
          <Bullets items={insights.behaviours} dot={accent.color} />
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {insights.strengths.length > 0 && (
          <Card>
            <Label>Strengths</Label>
            <Bullets items={insights.strengths} dot={GREEN} />
          </Card>
        )}
        {insights.blindSpots.length > 0 && (
          <Card>
            <Label>Blind spots</Label>
            <Bullets items={insights.blindSpots} dot={RED} />
          </Card>
        )}
      </div>

      {(insights.doList.length > 0 || insights.dontList.length > 0) && (
        <Card>
          <Label accent={accent}>How to communicate with {firstName}</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: GREEN, marginBottom: 10 }}>Do</div>
              <Bullets items={insights.doList} dot={GREEN} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: RED, marginBottom: 10 }}>Don&apos;t</div>
              <Bullets items={insights.dontList} dot={RED} />
            </div>
          </div>
        </Card>
      )}

      {coaching.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {coaching.map((s) => (
            <div
              key={s.key}
              style={{
                background: "#FFFFFF",
                border: CARD_BORDER,
                borderRadius: 12,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#161311",
                  marginBottom: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent.color }} />
                {s.label}
              </div>
              <p style={{ fontSize: 13, color: "#4D4945", lineHeight: 1.65, margin: 0 }}>
                {insights[s.key] as string}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
