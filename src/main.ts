import type { AppState, ItemStat, ItemAsset, TieredItem } from "./api/types.js";
import {
  fetchHeroes,
  fetchItems,
  fetchItemStats,
  fetchHeroCounterStats,
  fetchAllHeroCounterStats,
  fetchHeroSynergyStats,
  fetchAbilityOrderStats,
  fetchItemPermutationStats,
  fetchPerformanceCurve,
} from "./api/client.js";
import { render } from "./ui/app.js";
import "./styles/main.css";

document.documentElement.dataset.theme = localStorage.getItem("theme") ?? "solarized-dark";

const state: AppState = {
  view: "hero-select",
  counterTab: "tier",
  myHero: null,
  teammate: null,
  enemies: [null, null],
  heroes: [],
  items: [],
  allMatchups: [],
  counterItems: [],
  matchups: [],
  synergy: null,
  abilityOrders: [],
  itemCombos: [],
  performanceCurve: [],
  loading: false,
  error: null,
};

async function init(): Promise<void> {
  render({ ...state, loading: true });

  try {
    const [heroes, items, allMatchups] = await Promise.all([fetchHeroes(), fetchItems(), fetchAllHeroCounterStats()]);
    state.heroes = heroes.filter(
      (h) => h.player_selectable && !h.disabled && !h.in_development,
    );
    state.items = items.filter((i) => i.type === "upgrade" && i.shopable);
    state.allMatchups = allMatchups;
    render(state);
  } catch (err) {
    state.error = `Failed to load hero/item data: ${err instanceof Error ? err.message : String(err)}`;
    state.view = "hero-select";
    render(state);
  }
}

window.addEventListener("hero-selected", (e: Event) => {
  const hero = (e as CustomEvent).detail as AppState["myHero"];
  state.myHero = hero;
  state.teammate = null;
  state.enemies = [null, null];
  state.view = "lane-config";
  render(state);
});

window.addEventListener("navigate", (e: Event) => {
  const target = (e as CustomEvent).detail as AppState["view"];
  state.view = target;
  state.error = null;
  state.counterTab = "tier";
  render(state);
});

window.addEventListener("reset", () => {
  state.view = "hero-select";
  state.counterTab = "tier";
  state.myHero = null;
  state.teammate = null;
  state.enemies = [null, null];
  state.counterItems = [];
  state.matchups = [];
  state.synergy = null;
  state.abilityOrders = [];
  state.itemCombos = [];
  state.performanceCurve = [];
  state.loading = false;
  state.error = null;
  render(state);
});

window.addEventListener("analyze", async () => {
  if (!state.myHero || !state.teammate || !state.enemies[0] || !state.enemies[1]) return;

  state.view = "results";
  state.loading = true;
  state.error = null;
  state.counterItems = [];
  state.matchups = [];
  state.synergy = null;
  state.abilityOrders = [];
  state.itemCombos = [];
  state.performanceCurve = [];
  render(state);

  try {
    const [itemStats, matchup0, matchup1, synergyData, abilityData, comboData, curveData] =
      await Promise.all([
        fetchItemStats([state.enemies[0]!.id, state.enemies[1]!.id], state.myHero.id),
        fetchHeroCounterStats(state.myHero.id, state.enemies[0]!.id),
        fetchHeroCounterStats(state.myHero.id, state.enemies[1]!.id),
        fetchHeroSynergyStats(state.myHero.id, state.teammate.id),
        fetchAbilityOrderStats(state.myHero.id),
        fetchItemPermutationStats(state.myHero.id, 2),
        fetchPerformanceCurve(state.myHero.id),
      ]);

    const shopableIds = new Set(state.items.map((i) => i.id));
    const filteredStats = itemStats.filter(
      (s) => shopableIds.has(s.item_id) && s.matches >= 500,
    );

    state.counterItems = buildTierList(filteredStats, state.items);
    state.matchups = [...matchup0, ...matchup1];
    state.synergy = synergyData.find(
      (s) =>
        (s.hero_id1 === state.myHero!.id && s.hero_id2 === state.teammate!.id) ||
        (s.hero_id1 === state.teammate!.id && s.hero_id2 === state.myHero!.id),
    ) ?? null;
    state.abilityOrders = abilityOrdersRanked(abilityData);
    state.itemCombos = comboData
      .filter((c) => c.matches >= 100)
      .sort((a, b) => ((b.wins + 25) / (b.matches + 50)) - ((a.wins + 25) / (a.matches + 50)))
      .slice(0, 5);
    state.performanceCurve = curveData;
  } catch (err) {
    state.error = `Failed to fetch analytics: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    state.loading = false;
    render(state);
  }
});

function buildTierList(stats: ItemStat[], items: ItemAsset[]): TieredItem[] {
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const tiered = stats
    .map((stat) => {
      const item = itemMap.get(stat.item_id);
      if (!item) return null;
      const winRate = stat.wins / stat.matches;
      const adj = (stat.wins + 25) / (stat.matches + 50);
      let tier: TieredItem["tier"];
      if (adj >= 0.54) tier = "S";
      else if (adj >= 0.51) tier = "A";
      else if (adj >= 0.48) tier = "B";
      else if (adj >= 0.45) tier = "C";
      else tier = "D";
      return { item, stat, winRate, adjustedWinRate: adj, tier };
    })
    .filter((t): t is TieredItem => t !== null)
    .sort((a, b) => b.adjustedWinRate - a.adjustedWinRate);

  return tiered;
}

function abilityOrdersRanked(
  data: import("./api/types.js").AbilityOrderStat[],
): import("./api/types.js").AbilityOrderStat[] {
  return data
    .sort((a, b) => {
      const wrA = a.wins / Math.max(a.wins + a.losses, 1);
      const wrB = b.wins / Math.max(b.wins + b.losses, 1);
      return wrB - wrA;
    })
    .slice(0, 3);
}

window.addEventListener("counter-tab", (e: Event) => {
  state.counterTab = (e as CustomEvent).detail as AppState["counterTab"];
  render(state);
});

init();
