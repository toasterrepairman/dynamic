import type { AppState, ItemStat, ItemAsset, TieredItem } from "./api/types.js";
import {
  fetchHeroes,
  fetchItems,
  fetchItemStats,
  fetchHeroCounterStats,
  fetchHeroSynergyStats,
  fetchAbilityOrderStats,
  fetchItemPermutationStats,
} from "./api/client.js";
import { render } from "./ui/app.js";
import "./styles/main.css";

const state: AppState = {
  view: "hero-select",
  myHero: null,
  teammate: null,
  enemies: [null, null],
  heroes: [],
  items: [],
  counterItems: [],
  matchups: [],
  synergy: null,
  abilityOrders: [],
  itemCombos: [],
  loading: false,
  error: null,
};

async function init(): Promise<void> {
  render({ ...state, loading: true });

  try {
    const [heroes, items] = await Promise.all([fetchHeroes(), fetchItems()]);
    state.heroes = heroes.filter(
      (h) => h.player_selectable && !h.disabled && !h.in_development,
    );
    state.items = items.filter((i) => i.type === "upgrade" && i.shopable);
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
  render(state);
});

window.addEventListener("reset", () => {
  state.view = "hero-select";
  state.myHero = null;
  state.teammate = null;
  state.enemies = [null, null];
  state.counterItems = [];
  state.matchups = [];
  state.synergy = null;
  state.abilityOrders = [];
  state.itemCombos = [];
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
  render(state);

  try {
    const [itemStats, matchup0, matchup1, synergyData, abilityData, comboData] =
      await Promise.all([
        fetchItemStats([state.enemies[0]!.id, state.enemies[1]!.id]),
        fetchHeroCounterStats(state.myHero.id, state.enemies[0]!.id),
        fetchHeroCounterStats(state.myHero.id, state.enemies[1]!.id),
        fetchHeroSynergyStats(state.myHero.id, state.teammate.id),
        fetchAbilityOrderStats(state.myHero.id),
        fetchItemPermutationStats(state.myHero.id, 2),
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
    state.itemCombos = comboData.sort((a, b) => b.matches - a.matches).slice(0, 5);
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

init();
