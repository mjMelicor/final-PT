import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOfficialById } from "../mockData";
import "./officialProfilePage.css";
import BackToHomeButton from "../components/BackToHomeButton";

const stars = [1, 2, 3, 4, 5];

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function formatCurrencyPHP(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "₱0";
  return `₱${n.toLocaleString("en-PH")}`;
}

function getStoredOfficialRating(officialId) {
  try {
    const raw = localStorage.getItem(`officialRating:${officialId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const rating = Number(parsed?.rating);
    if (!Number.isFinite(rating)) return null;
    return Math.max(1, Math.min(5, Math.round(rating)));
  } catch {
    return null;
  }
}

export default function OfficialProfilePage() {
  const { officialId } = useParams();
  const navigate = useNavigate();
  const official = useMemo(() => getOfficialById(officialId), [officialId]);

  const [rating, setRating] = useState(5);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!official) return;
    const existing = getStoredOfficialRating(official.id);
    if (existing) {
      setRating(existing);
      setHasSubmitted(true);
    }
  }, [official]);

  const back = () => navigate("/");

  const budget = useMemo(() => {
    const allocated = 120_000_000;
    const utilized = Math.round((allocated * clampPercent(official?.transparency ?? 70)) / 100);
    const remaining = Math.max(0, allocated - utilized);
    const utilizationRate = allocated ? Math.round((utilized / allocated) * 100) : 0;
    return { allocated, utilized, remaining, utilizationRate };
  }, [official]);

  const projects = useMemo(() => {
    const base = [
      { name: "Road & Drainage Improvement", budget: 34_000_000, spent: 34_000_000, status: "Completed" },
      { name: "Health Center Upgrade", budget: 18_000_000, spent: 12_500_000, status: "Ongoing" },
      { name: "Public School Support", budget: 14_000_000, spent: 10_200_000, status: "Ongoing" },
      { name: "Community Safety (CCTV / Lights)", budget: 9_000_000, spent: 9_000_000, status: "Completed" },
    ];
    const scaled = base.map((p, idx) => {
      const tweak = 0.92 + ((Number(official?.id || 1) + idx) % 7) * 0.02;
      const budgetScaled = Math.round(p.budget * tweak);
      const spentScaled = Math.min(budgetScaled, Math.round(p.spent * tweak));
      return { ...p, budget: budgetScaled, spent: spentScaled };
    });
    return scaled;
  }, [official]);

  const saln = useMemo(
    () => [
      { year: 2024, filed: true, public: true },
      { year: 2023, filed: true, public: true },
      { year: 2022, filed: true, public: true },
    ],
    []
  );

  const coaReports = useMemo(
    () => [
      { year: 2024, rating: "Excellent", findings: 0 },
      { year: 2023, rating: "Very Good", findings: 2 },
      { year: 2022, rating: "Very Good", findings: 1 },
    ],
    []
  );

  const backgroundText =
    official?.bio ||
    `${official?.name || "This official"} is a public servant focused on practical, high-impact programs. This profile summarizes accomplishments, key achievements, and transparency metrics to help voters make informed decisions.`;

  const accomplishedPlatforms = useMemo(() => {
    const items = official?.platforms || [];
    return items.slice(0, 4).map((p) => `✓ ${p}`);
  }, [official]);

  const keyAchievements = useMemo(() => {
    const items = official?.platforms || [];
    const mapped = items.slice(0, 4).map((p) => `★ Delivered progress on: ${p}`);
    return mapped.length
      ? mapped
      : ["★ Implemented community-first initiatives", "★ Improved service delivery and response time"];
  }, [official]);

  const submitRating = () => {
    if (!official) return;
    localStorage.setItem(
      `officialRating:${official.id}`,
      JSON.stringify({ rating, createdAt: Date.now() })
    );
    setHasSubmitted(true);
  };

  if (!official) {
    return (
      <main className="opp-root">
        <div className="opp-empty">
          <BackToHomeButton onClick={back} />
          <div className="opp-empty-card">
            <h2>Official not found</h2>
            <p>Please go back and select a current official.</p>
          </div>
        </div>
      </main>
    );
  }

  const satisfaction = clampPercent(official.satisfaction);
  const transparency = clampPercent(official.transparency);

  return (
    <main className="opp-root">
      <BackToHomeButton onClick={back} />

      <header className="opp-hero">
        <div className="opp-hero-inner">
          <div className="opp-avatar">
            <img src={official.image} alt={official.name} />
            <span className="opp-avatar-ring" aria-hidden="true" />
          </div>

          <div className="opp-hero-text">
            <h1 className="opp-name">{official.name}</h1>
            <p className="opp-title">{official.position}</p>

            <div className="opp-badges">
              <span className="opp-badge">{official.party}</span>
              <span className="opp-badge soft">{official.level} Level</span>
              <span className="opp-badge green">Current Official</span>
            </div>

            <div className="opp-stats">
              <button className="opp-stat-btn" type="button">
                {satisfaction}% Satisfaction Rating
              </button>
              <button className="opp-stat-btn" type="button">
                {transparency}% Transparency Rating
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="opp-content">
        <div className="opp-grid">
          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon">👤</span>
              <h2>Background</h2>
            </div>
            <div className="opp-card">
              <p className="opp-paragraph">{backgroundText}</p>
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon green">✓</span>
              <h2>Accomplished Platforms</h2>
            </div>
            <div className="opp-list two">
              {accomplishedPlatforms.map((item) => (
                <div className="opp-mini-card green" key={item}>
                  <span className="opp-mini-icon">✓</span>
                  <span>{item.replace(/^✓\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon purple">★</span>
              <h2>Key Achievements</h2>
            </div>
            <div className="opp-list">
              {keyAchievements.map((item) => (
                <div className="opp-mini-card purple" key={item}>
                  <span className="opp-mini-icon">★</span>
                  <span>{item.replace(/^★\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon">📊</span>
              <h2>Transparency &amp; Financial Accountability</h2>
            </div>

            <div className="opp-card">
              <div className="opp-subhead">Budget Overview (2024)</div>
              <div className="opp-budget-row">
                <div className="opp-budget-stats">
                  <div className="opp-stat-card">
                    <div className="opp-stat-label">Total Allocated</div>
                    <div className="opp-stat-value">{formatCurrencyPHP(budget.allocated)}</div>
                  </div>
                  <div className="opp-stat-card">
                    <div className="opp-stat-label">Total Utilized</div>
                    <div className="opp-stat-value">{formatCurrencyPHP(budget.utilized)}</div>
                  </div>
                  <div className="opp-stat-card">
                    <div className="opp-stat-label">Utilization Rate</div>
                    <div className="opp-stat-value">{budget.utilizationRate}%</div>
                  </div>
                </div>

                <div className="opp-pie-wrap">
                  <div
                    className="opp-pie"
                    style={{
                      background: `conic-gradient(#20c997 0 ${budget.utilizationRate}%, #e5e7eb ${budget.utilizationRate}% 100%)`,
                    }}
                    aria-label="Budget utilization pie chart"
                    role="img"
                  />
                  <div className="opp-legend">
                    <div className="opp-legend-item">
                      <span className="opp-dot green" /> Utilized
                    </div>
                    <div className="opp-legend-item">
                      <span className="opp-dot gray" /> Remaining
                    </div>
                  </div>
                </div>
              </div>

              <div className="opp-subhead" style={{ marginTop: 18 }}>
                Project Spending Breakdown
              </div>

              <div className="opp-projects">
                {projects.map((p) => {
                  const pct = p.budget ? Math.round((p.spent / p.budget) * 100) : 0;
                  const statusClass = p.status === "Completed" ? "green" : "blue";
                  return (
                    <div className="opp-project" key={p.name}>
                      <div className="opp-project-top">
                        <div className="opp-project-name">{p.name}</div>
                        <span className={`opp-status ${statusClass}`}>{p.status}</span>
                      </div>
                      <div className="opp-project-meta">
                        <span>
                          {formatCurrencyPHP(p.spent)} spent / {formatCurrencyPHP(p.budget)} budget
                        </span>
                        <span className="opp-project-pct">{pct}%</span>
                      </div>
                      <div className="opp-bar">
                        <div className="opp-bar-fill" style={{ width: `${clampPercent(pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon">📄</span>
              <h2>SALN (Statement of Assets, Liabilities, and Net Worth)</h2>
            </div>
            <div className="opp-list three">
              {saln.map((s) => (
                <div className="opp-mini-card" key={s.year}>
                  <div className="opp-mini-title">{s.year}</div>
                  <div className="opp-mini-row">
                    <span>Filed:</span>
                    <span className="opp-ok">✓ Yes</span>
                  </div>
                  <div className="opp-mini-row">
                    <span>Public:</span>
                    <span className="opp-ok">✓ Yes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon">✅</span>
              <h2>COA Reports</h2>
            </div>
            <div className="opp-list three">
              {coaReports.map((c) => (
                <div className="opp-mini-card" key={c.year}>
                  <div className="opp-mini-title">{c.year}</div>
                  <div className="opp-mini-row">
                    <span>Rating:</span>
                    <span className={`opp-pill ${c.rating === "Excellent" ? "green" : "blue"}`}>
                      {c.rating}
                    </span>
                  </div>
                  <div className="opp-mini-row">
                    <span>Audit findings:</span>
                    <span className="opp-muted">{c.findings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="opp-section">
            <div className="opp-section-head">
              <span className="opp-section-icon">⭐</span>
              <h2>Rate This Official</h2>
            </div>
            <div className="opp-card">
              <div className="opp-rate-row">
                <div className="opp-stars">
                  {stars.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={s <= rating ? "active" : ""}
                      onClick={() => setRating(s)}
                      aria-label={`${s} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button className="opp-submit" type="button" onClick={submitRating}>
                  Submit Rating
                </button>
              </div>
              {hasSubmitted && (
                <div className="opp-hint">
                  Saved! Your rating for this official is <b>{rating}★</b>.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

