import type { AppState, HeroAsset, TieredItem, TimeDistBar } from "../api/types.js";

const el = document.getElementById("app")!;
let activeKeyHandler: ((e: KeyboardEvent) => void) | null = null;

function currentTheme(): string {
  return document.documentElement.dataset.theme ?? "solarized-dark";
}

function headerHTML(subtitle?: string): string {
  const t = currentTheme();
  return `
    <header class="app-header">
      <a class="app-title" id="reset-btn">Dynamic</a>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
      <div class="theme-picker">
        <select id="theme-select">
          <option value="solarized-dark"${t === "solarized-dark" ? " selected" : ""}>Solarized Dark</option>
          <option value="solarized-light"${t === "solarized-light" ? " selected" : ""}>Solarized Light</option>
          <option value="dracula"${t === "dracula" ? " selected" : ""}>Dracula</option>
          <option value="nord"${t === "nord" ? " selected" : ""}>Nord</option>
        </select>
      </div>
    </header>
  `;
}

function wireThemePicker(): void {
  const select = document.getElementById("theme-select") as HTMLSelectElement | null;
  if (!select) return;
  select.addEventListener("change", () => {
    const theme = select.value;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  });
}

function footerHTML(): string {
  return `
    <footer class="app-footer">
      <span>Data from <a href="https://deadlock-api.com" target="_blank" rel="noopener">Deadlock API</a></span>
      <span class="footer-links">
        <a href="https://www.toast.cyou/" target="_blank" rel="noopener">toast.cyou</a>
        <a href="https://github.com/toasterrepairman" target="_blank" rel="noopener">GitHub</a>
      </span>
    </footer>
  `;
}

export function render(state: AppState): void {
  switch (state.view) {
    case "hero-select":
      renderHeroSelect(state);
      break;
    case "lane-config":
      renderLaneConfig(state);
      break;
    case "results":
      renderResults(state);
      break;
  }
  wireResetBtn();
  wireThemePicker();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function wireResetBtn(): void {
  const btn = document.getElementById("reset-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("reset"));
    });
  }
}

function renderHeroSelect(state: AppState): void {
  const heroes = [...state.heroes].sort((a, b) => a.name.localeCompare(b.name));
  el.innerHTML = `
    ${headerHTML("Deadlock Counter-Build Guide")}
    <section class="hero-select">
      <h2>Pick Your Hero</h2>
      <div class="hero-filters">
        <input type="search" id="hero-search" placeholder="Search heroes..." class="search-input" />
      </div>
      <div class="hero-grid" id="hero-grid">
        ${heroes.map((h) => heroCard(h)).join("")}
      </div>
    </section>
    ${footerHTML()}
  `;
  wireHeroSelect(heroes);
}

function heroCard(hero: HeroAsset): string {
  const [r, g, b] = hero.colors.ui;
  return `
    <button class="hero-card" data-hero-id="${hero.id}" style="--hero-color: rgb(${r},${g},${b})">
      <img src="${hero.images.icon_hero_card_webp}" alt="${hero.name}" loading="lazy" />
      <span class="hero-name">${hero.name}</span>
    </button>
  `;
}

function wireHeroSelect(heroes: HeroAsset[]): void {
  const grid = document.getElementById("hero-grid")!;
  const search = document.getElementById("hero-search") as HTMLInputElement;

  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    grid.querySelectorAll<HTMLElement>(".hero-card").forEach((card) => {
      const hero = heroes.find((h) => h.id === Number(card.dataset.heroId));
      if (!hero) return;
      const matches = hero.name.toLowerCase().includes(q) || hero.class_name.toLowerCase().includes(q);
      card.style.display = matches ? "" : "none";
    });
  });

  grid.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".hero-card");
    if (!card) return;
    const heroId = Number(card.dataset.heroId);
    const hero = heroes.find((h) => h.id === heroId);
    if (hero) {
      window.dispatchEvent(new CustomEvent("hero-selected", { detail: hero }));
    }
  });
}

function renderLaneConfig(state: AppState): void {
  const hero = state.myHero!;
  const [r, g, b] = hero.colors.ui;
  const otherHeroes = state.heroes.filter((h) => h.id !== hero.id).sort((a, b) => a.name.localeCompare(b.name));

  const heroMatchups = state.allMatchups
    .filter((m) => m.hero_id === hero.id)
    .map((m) => ({
      enemy: state.heroes.find((h) => h.id === m.enemy_hero_id),
      wr: m.wins / m.matches_played,
      games: m.matches_played,
    }))
    .filter((m) => m.enemy)
    .sort((a, b) => b.wr - a.wr);

  el.innerHTML = `
    ${headerHTML()}
    <section class="lane-config">
      <div class="selected-hero-banner" style="--hero-color: rgb(${r},${g},${b})">
        <img src="${hero.images.icon_hero_card_webp}" alt="${hero.name}" />
        <h2>${hero.name}</h2>
        <div class="matchup-strip-wrapper">
          <span class="matchup-strip-label">Win rate vs opponents</span>
          <div class="matchup-strip">
          ${heroMatchups.map((m) => `
            <div class="matchup-chip" data-hero-id="${m.enemy!.id}">
              <img src="${m.enemy!.images.icon_image_small_webp}" alt="${m.enemy!.name}" loading="lazy" />
              <span class="matchup-wr" style="color:${wrColor(m.wr * 100)}">${(m.wr * 100).toFixed(1)}%</span>
            </div>
          `).join("")}
          </div>
        </div>
        <button class="back-btn" id="back-heroes">Change Hero</button>
      </div>

      <h2>Configure Your Lane</h2>
      <div class="lane-pickers">
        <div class="picker-group ally-group">
          <h3>Your Lane Partner</h3>
          <div class="hero-mini-search">
            <input type="search" id="ally-search" placeholder="Search..." class="search-input" />
          </div>
          <div class="hero-mini-grid" id="ally-grid">
            ${otherHeroes.map((h) => miniCard(h, "ally")).join("")}
          </div>
          <div class="selected-slot" id="ally-slot">
            ${state.teammate ? selectedSlot(state.teammate) : '<span class="empty-slot">Select a teammate</span>'}
          </div>
        </div>

        <div class="picker-group enemy-group">
          <h3>Enemy Laners</h3>
          <div class="hero-mini-search">
            <input type="search" id="enemy-search" placeholder="Search..." class="search-input" />
          </div>
          <div class="hero-mini-grid" id="enemy-grid">
            ${otherHeroes.map((h) => miniCard(h, "enemy")).join("")}
          </div>
          <div class="enemy-slots">
            <div class="selected-slot" id="enemy-slot-0">
              ${state.enemies[0] ? selectedSlot(state.enemies[0]) : '<span class="empty-slot">Enemy 1</span>'}
            </div>
            <div class="selected-slot" id="enemy-slot-1">
              ${state.enemies[1] ? selectedSlot(state.enemies[1]) : '<span class="empty-slot">Enemy 2</span>'}
            </div>
          </div>
        </div>
      </div>

      <button class="analyze-btn" id="analyze-btn" disabled>
        Analyze Matchup
      </button>
    </section>
    ${footerHTML()}
  `;
  wireLaneConfig(state, otherHeroes);
}

function miniCard(hero: HeroAsset, role: string): string {
  return `
    <button class="hero-mini" data-hero-id="${hero.id}" data-role="${role}">
      <img src="${hero.images.icon_image_small_webp}" alt="${hero.name}" loading="lazy" />
      <span>${hero.name}</span>
    </button>
  `;
}

function selectedSlot(hero: HeroAsset): string {
  return `
    <img src="${hero.images.icon_image_small_webp}" alt="${hero.name}" />
    <span>${hero.name}</span>
    <button class="remove-btn" data-remove-hero="${hero.id}">x</button>
  `;
}

function wireLaneConfig(state: AppState, otherHeroes: HeroAsset[]): void {
  const allyGrid = document.getElementById("ally-grid")!;
  const enemyGrid = document.getElementById("enemy-grid")!;
  const allySearch = document.getElementById("ally-search") as HTMLInputElement;
  const enemySearch = document.getElementById("enemy-search") as HTMLInputElement;
  const analyzeBtn = document.getElementById("analyze-btn") as HTMLButtonElement;

  function wireMiniSearch(input: HTMLInputElement, grid: HTMLElement): void {
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      grid.querySelectorAll<HTMLElement>(".hero-mini").forEach((card) => {
        const name = card.querySelector("span")!.textContent!.toLowerCase();
        card.style.display = name.includes(q) ? "" : "none";
      });
    });
  }
  wireMiniSearch(allySearch, allyGrid);
  wireMiniSearch(enemySearch, enemyGrid);

  function updateAnalyzeBtn(): void {
    const hasAlly = state.teammate !== null;
    const hasEnemies = state.enemies[0] !== null && state.enemies[1] !== null;
    analyzeBtn.disabled = !(hasAlly && hasEnemies);
  }

  function updateSlots(): void {
    const allySlot = document.getElementById("ally-slot")!;
    allySlot.innerHTML = state.teammate
      ? selectedSlot(state.teammate)
      : '<span class="empty-slot">Select a teammate</span>';

    const es0 = document.getElementById("enemy-slot-0")!;
    const es1 = document.getElementById("enemy-slot-1")!;
    es0.innerHTML = state.enemies[0]
      ? selectedSlot(state.enemies[0])
      : '<span class="empty-slot">Enemy 1</span>';
    es1.innerHTML = state.enemies[1]
      ? selectedSlot(state.enemies[1])
      : '<span class="empty-slot">Enemy 2</span>';

    highlightSelected();
    updateAnalyzeBtn();
  }

  function highlightSelected(): void {
    const selected = new Set<number>();
    if (state.teammate) selected.add(state.teammate.id);
    for (const e of state.enemies) if (e) selected.add(e.id);
    if (state.myHero) selected.add(state.myHero.id);

    document.querySelectorAll<HTMLElement>(".hero-mini").forEach((card) => {
      const id = Number(card.dataset.heroId);
      card.classList.toggle("picked", selected.has(id));
    });
  }

  allyGrid.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".hero-mini");
    if (!card || card.classList.contains("picked")) return;
    const hero = otherHeroes.find((h) => h.id === Number(card.dataset.heroId));
    if (hero) {
      state.teammate = hero;
      updateSlots();
    }
  });

  enemyGrid.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".hero-mini");
    if (!card || card.classList.contains("picked")) return;
    const hero = otherHeroes.find((h) => h.id === Number(card.dataset.heroId));
    if (!hero) return;
    if (!state.enemies[0]) {
      state.enemies[0] = hero;
    } else if (!state.enemies[1]) {
      state.enemies[1] = hero;
    } else {
      state.enemies[1] = state.enemies[0];
      state.enemies[0] = hero;
    }
    updateSlots();
  });

  el.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".remove-btn");
    if (!btn) return;
    const removeId = Number(btn.dataset.removeHero);
    if (state.teammate?.id === removeId) state.teammate = null;
    if (state.enemies[0]?.id === removeId) state.enemies[0] = null;
    if (state.enemies[1]?.id === removeId) state.enemies[1] = null;
    if (state.enemies[0] === null && state.enemies[1] !== null) {
      state.enemies[0] = state.enemies[1];
      state.enemies[1] = null;
    }
    updateSlots();
  });

  document.getElementById("back-heroes")!.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "hero-select" }));
  });

  analyzeBtn.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("analyze"));
  });

  highlightSelected();
  updateAnalyzeBtn();
}

function renderResults(state: AppState): void {
  if (state.loading) {
    el.innerHTML = `
      ${headerHTML()}
      <div class="loading">
        <div class="spinner"></div>
        <p>Fetching matchup data...</p>
      </div>
      ${footerHTML()}
    `;
    return;
  }

  if (state.error) {
    el.innerHTML = `
      ${headerHTML()}
      <div class="error-box">
        <p>${state.error}</p>
        <button id="retry-btn" class="analyze-btn">Retry</button>
      </div>
      ${footerHTML()}
    `;
    document.getElementById("retry-btn")!.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("analyze"));
    });
    return;
  }

  const hero = state.myHero!;
  const [r, g, b] = hero.colors.ui;

  const itemTierGroups = new Map<number, import("../api/types.js").TieredItem[]>();
  for (const ti of state.counterItems) {
    const t = ti.item.item_tier ?? 0;
    if (!itemTierGroups.has(t)) itemTierGroups.set(t, []);
    itemTierGroups.get(t)!.push(ti);
  }
  const sortedTiers = [...itemTierGroups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, items]) => items.sort((x, y) => y.winRate - x.winRate));

  const tierLabels: Record<number, string> = { 1: "Tier 1", 2: "Tier 2", 3: "Tier 3", 4: "Tier 4", 5: "Tier 5" };

  el.innerHTML = `
    ${headerHTML()}
    <section class="results">
      <div class="results-header" style="--hero-color: rgb(${r},${g},${b})">
        <div class="results-header-info">
          <img src="${hero.images.icon_hero_card_webp}" alt="${hero.name}" />
          <div>
            <h2>${hero.name}</h2>
            <p class="lane-summary">
              with ${state.teammate?.name ?? "?"} vs ${state.enemies[0]?.name ?? "?"} & ${state.enemies[1]?.name ?? "?"}
            </p>
          </div>
        </div>
        <button class="back-btn" id="back-config">Edit Lane</button>
      </div>

      <div class="results-grid">
        <div class="results-main">
          <section class="tier-section">
            <div class="counter-tabs">
              <button class="counter-tab${state.counterTab === "tier" ? " active" : ""}" data-tab="tier">Counter Items</button>
              <button class="counter-tab${state.counterTab === "build" ? " active" : ""}" data-tab="build">Build Prio</button>
              <span class="section-sub">vs ${state.enemies.map((e) => e?.name ?? "?").join(" & ")}</span>
            </div>
            ${state.counterTab === "tier"
              ? renderTierView(sortedTiers, tierLabels)
              : renderBuildPrio(state.counterItems)
            }
          </section>
        </div>

        <div class="results-sidebar">
          ${renderSynergy(state)}
          ${renderPerformanceCurve(state)}
          ${renderItemCombos(state)}
        </div>
      </div>
    </section>
    ${footerHTML()}
  `;

  document.getElementById("back-config")!.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "lane-config" }));
  });

  document.querySelectorAll<HTMLButtonElement>(".counter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab as AppState["counterTab"];
      window.dispatchEvent(new CustomEvent("counter-tab", { detail: tab }));
    });
  });

  let buildFocusIdx = 0;

  function scrollIntoView(el: HTMLElement | null): void {
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

    if (e.key === "`") {
      e.preventDefault();
      const next: AppState["counterTab"] = state.counterTab === "tier" ? "build" : "tier";
      window.dispatchEvent(new CustomEvent("counter-tab", { detail: next }));
      return;
    }

    if (state.counterTab === "tier") {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        scrollIntoView(document.getElementById(`tier-${n}`));
      }
    } else {
      const phases = document.querySelectorAll<HTMLElement>("[data-phase-idx]");
      if (phases.length === 0) return;
      if (e.key === "1") {
        e.preventDefault();
        buildFocusIdx = Math.max(0, buildFocusIdx - 1);
        scrollIntoView(phases[buildFocusIdx]);
      } else if (e.key === "3") {
        e.preventDefault();
        buildFocusIdx = Math.min(phases.length - 1, buildFocusIdx + 1);
        scrollIntoView(phases[buildFocusIdx]);
      }
    }
  }

  if (activeKeyHandler) document.removeEventListener("keydown", activeKeyHandler);
  activeKeyHandler = onKeydown;
  document.addEventListener("keydown", onKeydown);
}

function wrColor(pct: number): string {
  const t = Math.max(0, Math.min(1, (pct - 40) / (60 - 40)));
  const r = Math.round(255 * (1 - t));
  const g = Math.round(255 * t);
  return `rgb(${r},${g},0)`;
}

const TIME_WINDOW_LABELS = ["0-5m", "5-10m", "10-15m", "15-20m", "20-25m", "25m+"];

function renderMiniBarChart(dist: TimeDistBar[]): string {
  if (dist.every((d) => d.matches === 0)) return "";
  const tooltipParts = dist.map((d, i) => {
    const label = `${TIME_WINDOW_LABELS[i]}: ${d.matches.toLocaleString()}`;
    return d.isPeak ? `${label} (peak)` : label;
  });
  return `<div class="time-chart" title="Buy timing: ${tooltipParts.join(" | ")}">${dist
    .map(
      (d) =>
        `<div class="time-bar${d.isPeak ? " peak" : ""}" style="height:${d.pct}%"></div>`,
    )
    .join("")}</div>`;
}

function renderTierView(
  sortedTiers: import("../api/types.js").TieredItem[][],
  tierLabels: Record<number, string>,
): string {
  return sortedTiers
    .map((items) => {
      const tierNum = items[0]?.item.item_tier ?? 0;
      return `
        <h3 class="item-tier-heading" id="tier-${tierNum}">${tierLabels[tierNum] ?? `Tier ${tierNum}`}</h3>
        <div class="tier-item-grid">
          ${items.map((ti) => tierItemCard(ti)).join("")}
        </div>
      `;
    })
    .join("");
}

const BUILD_PHASES = [
  { label: "Laning Phase", sub: "0 – 7 min", lo: 0, hi: 7 },
  { label: "Mid Game", sub: "7 – 15 min", lo: 7, hi: 15 },
  { label: "Late Game", sub: "15 – 25 min", lo: 15, hi: 25 },
  { label: "Endgame", sub: "25+ min", lo: 25, hi: 999 },
];

function renderBuildPrio(items: TieredItem[]): string {
  if (items.length === 0) return '<p class="build-empty">No item data</p>';

  const phases = BUILD_PHASES.map((phase) => {
    const phaseItems = items
      .filter((ti) => ti.peakMinute >= phase.lo && ti.peakMinute < phase.hi)
      .sort((a, b) => b.adjustedWinRate - a.adjustedWinRate);
    return { ...phase, items: phaseItems };
  }).filter((p) => p.items.length > 0);

  const topPickIds = new Set<number>();
  phases.forEach((p) => {
    const best = new Map<string, TieredItem>();
    for (const ti of p.items) {
      const slot = ti.item.item_slot_type ?? "unknown";
      if (!best.has(slot)) best.set(slot, ti);
    }
    for (const ti of best.values()) topPickIds.add(ti.item.id);
  });

  return phases
    .map((p, idx) => {
      return `
        <div class="build-phase" data-phase-idx="${idx}">
          <div class="build-phase-marker">
            <div class="build-phase-dot"></div>
            <div class="build-phase-line"></div>
          </div>
          <div class="build-phase-content">
            <span class="build-phase-label">${p.label}</span>
            <span class="build-phase-sub">${p.sub}</span>
            <div class="build-phase-items">
              ${p.items.map((ti) => buildPrioCard(ti, topPickIds.has(ti.item.id))).join("")}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function buildPrioCard(ti: TieredItem, isTopPick: boolean): string {
  const wr = (ti.winRate * 100).toFixed(1);
  const wrPct = ti.winRate * 100;
  const slotLabel = ti.item.item_slot_type ?? "";
  const cost = ti.item.cost ?? 0;
  const costLabel = cost > 0 ? `${(cost / 1000).toFixed(cost >= 1000 ? 1 : 0)}k` : "";
  const chart = renderMiniBarChart(ti.timeDistribution);

  return `
    <div class="build-item${isTopPick ? " top-pick" : ""}" data-item-id="${ti.item.id}" data-slot="${slotLabel}">
      ${isTopPick ? '<span class="top-pick-badge" title="Best pick for this slot & phase"></span>' : ""}
      <img src="${ti.item.image_webp}" alt="${ti.item.name}" loading="lazy" />
      <div class="build-item-info">
        <span class="build-item-name">${ti.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${wrColor(wrPct)}">${wr}%</span>
          <span class="meta-tag">${slotLabel}</span>
          ${costLabel ? `<span class="meta-tag">${costLabel}</span>` : ""}
        </span>
        <span class="tier-item-meta">
          ${chart || `<span class="meta-dim">~${Math.round(ti.stat.avg_buy_time_s / 60)}min</span>`}
          <span class="meta-dim">${ti.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `;
}

function tierItemCard(ti: TieredItem): string {
  const wr = (ti.winRate * 100).toFixed(1);
  const wrPct = ti.winRate * 100;
  const slotLabel = ti.item.item_slot_type ?? "";
  const cost = ti.item.cost ?? 0;
  const costLabel = cost > 0 ? `${(cost / 1000).toFixed(cost >= 1000 ? 1 : 0)}k` : "";
  const chart = renderMiniBarChart(ti.timeDistribution);

  return `
    <div class="tier-item" data-item-id="${ti.item.id}" data-slot="${slotLabel}">
      <img src="${ti.item.image_webp}" alt="${ti.item.name}" loading="lazy" />
      <div class="tier-item-info">
        <span class="tier-item-name">${ti.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr" style="color:${wrColor(wrPct)}">${wr}%</span>
          <span class="meta-tag">${slotLabel}</span>
          ${costLabel ? `<span class="meta-tag">${costLabel}</span>` : ""}
        </span>
        <span class="tier-item-meta">
          ${chart || `<span class="meta-dim">~${Math.round(ti.stat.avg_buy_time_s / 60)}min</span>`}
          <span class="meta-dim">${ti.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `;
}

function renderSynergy(state: AppState): string {
  if (!state.synergy) return "";
  const s = state.synergy;
  const wrPct = (s.wins / s.matches_played) * 100;
  const wr = wrPct.toFixed(1);
  const mp = s.matches_played || 1;
  const heroName = state.myHero?.name ?? "You";
  const allyName = state.teammate?.name ?? "Ally";

  function avg(val: number): string {
    return (val / mp).toFixed(1);
  }
  function nw(val: number): string {
    const v = val / mp;
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
  }

  return `
    <section class="synergy-section">
      <h2>Lane Synergy</h2>
      <p class="synergy-with">with ${allyName}</p>
      <div class="synergy-stats">
        <div><span class="wr" style="color:${wrColor(wrPct)}">${wr}%</span> WR</div>
        <div><span>${s.matches_played.toLocaleString()}</span> games</div>
      </div>
      <div class="synergy-detail">
        <div class="synergy-detail-header">
          <span></span>
          <span>${heroName}</span>
          <span>${allyName}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">K/D/A</span>
          <span>${avg(s.kills1)}/${avg(s.deaths1)}/${avg(s.assists1)}</span>
          <span>${avg(s.kills2)}/${avg(s.deaths2)}/${avg(s.assists2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Net Worth</span>
          <span>${nw(s.networth1)}</span>
          <span>${nw(s.networth2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Last Hits</span>
          <span>${avg(s.last_hits1)}</span>
          <span>${avg(s.last_hits2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Denies</span>
          <span>${avg(s.denies1)}</span>
          <span>${avg(s.denies2)}</span>
        </div>
        <div class="synergy-detail-row">
          <span class="synergy-detail-label">Obj Damage</span>
          <span>${avg(s.obj_damage1)}</span>
          <span>${avg(s.obj_damage2)}</span>
        </div>
      </div>
    </section>
  `;
}

function renderItemCombos(state: AppState): string {
  if (state.itemCombos.length === 0) return "";
  const itemMap = new Map(state.items.map((i) => [i.id, i]));
  const top = state.itemCombos.slice(0, 5);

  const rows = top.map((combo) => {
    const wr = ((combo.wins / combo.matches) * 100).toFixed(1);
    const names = combo.item_ids
      .map((id) => itemMap.get(id)?.name ?? `Item ${id}`)
      .join(" + ");
    return `
      <div class="combo-row">
        <span class="combo-names">${names}</span>
        <span class="combo-meta">
          <span class="wr">${wr}%</span>
          <span class="meta-dim">${combo.matches.toLocaleString()}</span>
        </span>
      </div>
    `;
  }).join("");

  return `
    <section class="combo-section">
      <h2>Item Combos</h2>
      <div class="combo-list">${rows}</div>
    </section>
  `;
}

function renderPerformanceCurve(state: AppState): string {
  const curve = state.performanceCurve;
  if (!curve || curve.length < 2) return "";

  const svgW = 280;
  const svgH = 140;
  const padL = 36;
  const padR = 28;
  const padT = 12;
  const padB = 24;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxTime = curve[curve.length - 1].game_time;
  const maxNw = Math.max(...curve.map((p) => p.net_worth_avg));
  const maxKills = Math.max(...curve.map((p) => p.kills_avg));

  function xPos(t: number): number {
    return padL + (t / maxTime) * plotW;
  }
  function yNw(v: number): number {
    return padT + plotH - (v / maxNw) * plotH;
  }
  function yKills(v: number): number {
    return padT + plotH - (v / (maxKills > 0 ? maxKills : 1)) * plotH;
  }
  function fmtMin(s: number): string {
    return `${Math.round(s / 60)}m`;
  }
  function fmtNw(v: number): string {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v));
  }

  const nwLine = curve.map((p) => `${xPos(p.game_time)},${yNw(p.net_worth_avg)}`).join(" ");
  const killsLine = curve.map((p) => `${xPos(p.game_time)},${yKills(p.kills_avg)}`).join(" ");

  const xTicks = curve.filter((_, i) => i % Math.ceil(curve.length / 5) === 0 || i === curve.length - 1);
  const yTicks = 4;

  const nwYTicks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (maxNw / yTicks) * i;
    const y = yNw(v);
    return `<line x1="${padL}" y1="${y}" x2="${svgW - padR}" y2="${y}" stroke="var(--border)" stroke-width="0.5" />` +
      `<text x="${padL - 4}" y="${y + 3}" text-anchor="end" fill="var(--text-dim)" font-size="8">${fmtNw(v)}</text>`;
  }).join("");

  const killsYTicks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (maxKills / yTicks) * i;
    const y = yKills(v);
    return `<text x="${svgW - padR + 4}" y="${y + 3}" text-anchor="start" fill="var(--color-weapon)" font-size="8" opacity="0.8">${v.toFixed(1)}</text>`;
  }).join("");

  const xTickMarks = xTicks.map((p) =>
    `<text x="${xPos(p.game_time)}" y="${svgH - 4}" text-anchor="middle" fill="var(--text-dim)" font-size="8">${fmtMin(p.game_time)}</text>`
  ).join("");

  const peakIdx = curve.reduce((best, p, i) => p.net_worth_avg > curve[best].net_worth_avg ? i : best, 0);
  const peak = curve[peakIdx];

  return `
    <section class="curve-section">
      <h2>Power Curve</h2>
      <p class="curve-peak-label">Peak net worth at <strong>${fmtMin(peak.game_time)}</strong></p>
      <svg class="curve-svg" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
        ${nwYTicks}
        ${killsYTicks}
        ${xTickMarks}
        <polyline points="${nwLine}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round" />
        <polyline points="${killsLine}" fill="none" stroke="var(--color-weapon)" stroke-width="1" stroke-dasharray="3,2" stroke-linejoin="round" opacity="0.7" />
        <circle cx="${xPos(peak.game_time)}" cy="${yNw(peak.net_worth_avg)}" r="3" fill="var(--accent)" />
      </svg>
      <div class="curve-legend">
        <span class="curve-legend-item"><span class="curve-legend-dot" style="background:var(--accent)"></span> Net Worth</span>
        <span class="curve-legend-item"><span class="curve-legend-dot" style="background:var(--color-weapon)"></span> Kills</span>
      </div>
    </section>
  `;
}
