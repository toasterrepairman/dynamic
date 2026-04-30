import type { AppState, HeroAsset } from "../api/types.js";

const el = document.getElementById("app")!;

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
        <div class="matchup-strip">
          ${heroMatchups.map((m) => `
            <div class="matchup-chip" data-hero-id="${m.enemy!.id}">
              <img src="${m.enemy!.images.icon_image_small_webp}" alt="${m.enemy!.name}" loading="lazy" />
              <span class="matchup-wr ${m.wr >= 0.55 ? 'wr-good' : m.wr <= 0.45 ? 'wr-bad' : 'wr-neutral'}">${(m.wr * 100).toFixed(1)}%</span>
            </div>
          `).join("")}
        </div>
        <button class="back-btn" id="back-heroes">Change Hero</button>
      </div>

      <h2>Configure Your Lane</h2>
      <p class="lane-desc">Deadlock has 3 lanes with 2v2 matchups. Select your lane partner and the two enemies you're laning against.</p>

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
        <p>Analyzing matchup data...</p>
      </div>
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
            <h2>Counter Items <span class="section-sub">vs ${state.enemies.map((e) => e?.name ?? "?").join(" & ")}</span></h2>
            ${sortedTiers.map((items) => {
              const tierNum = items[0]?.item.item_tier ?? 0;
              return `
                <h3 class="item-tier-heading">${tierLabels[tierNum] ?? `Tier ${tierNum}`}</h3>
                <div class="tier-item-grid">
                  ${items.map((ti) => tierItemCard(ti)).join("")}
                </div>
              `;
            }).join("")}
          </section>
        </div>

        <div class="results-sidebar">
          ${renderSynergy(state)}
          ${renderItemCombos(state)}
        </div>
      </div>
    </section>
  `;

  document.getElementById("back-config")!.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "lane-config" }));
  });
}

function tierItemCard(ti: import("../api/types.js").TieredItem): string {
  const wr = (ti.winRate * 100).toFixed(1);
  const buyMin = Math.round(ti.stat.avg_buy_time_s / 60);
  const slotLabel = ti.item.item_slot_type ?? "";
  const cost = ti.item.cost ?? 0;
  const costLabel = cost > 0 ? `${(cost / 1000).toFixed(cost >= 1000 ? 1 : 0)}k` : "";

  return `
    <div class="tier-item" data-item-id="${ti.item.id}" data-slot="${slotLabel}">
      <img src="${ti.item.image_webp}" alt="${ti.item.name}" loading="lazy" />
      <div class="tier-item-info">
        <span class="tier-item-name">${ti.item.name}</span>
        <span class="tier-item-meta">
          <span class="wr">${wr}%</span>
          <span class="meta-tag">${slotLabel}</span>
          ${costLabel ? `<span class="meta-tag">${costLabel}</span>` : ""}
        </span>
        <span class="tier-item-meta">
          <span class="meta-dim">~${buyMin}min</span>
          <span class="meta-dim">${ti.stat.matches.toLocaleString()} games</span>
        </span>
      </div>
    </div>
  `;
}

function renderSynergy(state: AppState): string {
  if (!state.synergy) return "";
  const s = state.synergy;
  const wr = ((s.wins / s.matches_played) * 100).toFixed(1);
  return `
    <section class="synergy-section">
      <h2>Lane Synergy</h2>
      <p class="synergy-with">with ${state.teammate?.name ?? "?"}</p>
      <div class="synergy-stats">
        <div><span class="wr">${wr}%</span> WR</div>
        <div><span>${s.matches_played.toLocaleString()}</span> games</div>
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
