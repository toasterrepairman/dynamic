const BASE_URL = "https://api.deadlock-api.com";
const ASSETS_URL = "https://assets.deadlock-api.com";

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 3600 * 1000;

async function fetchCached<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} — ${url}`);
  }
  const data = (await res.json()) as T;
  cache.set(url, { data, expiry: Date.now() + CACHE_TTL });
  return data;
}

export function fetchHeroes(): Promise<import("./types.js").HeroAsset[]> {
  return fetchCached<import("./types.js").HeroAsset[]>(
    `${ASSETS_URL}/v2/heroes`,
  );
}

export function fetchItems(): Promise<import("./types.js").ItemAsset[]> {
  return fetchCached<import("./types.js").ItemAsset[]>(
    `${ASSETS_URL}/v2/items`,
  );
}

export function fetchItemStats(
  enemyHeroIds: number[],
): Promise<import("./types.js").ItemStat[]> {
  const params = new URLSearchParams();
  for (const id of enemyHeroIds) {
    params.append("enemy_hero_ids", String(id));
  }
  return fetchCached<import("./types.js").ItemStat[]>(
    `${BASE_URL}/v1/analytics/item-stats?${params}`,
  );
}

export function fetchAllHeroCounterStats(): Promise<import("./types.js").HeroCounterStat[]> {
  return fetchCached<import("./types.js").HeroCounterStat[]>(
    `${BASE_URL}/v1/analytics/hero-counter-stats?same_lane_filter=true`,
  );
}

export function fetchHeroCounterStats(
  heroId: number,
  enemyHeroId: number,
  sameLane = true,
): Promise<import("./types.js").HeroCounterStat[]> {
  const params = new URLSearchParams({
    hero_id: String(heroId),
    enemy_hero_id: String(enemyHeroId),
  });
  if (sameLane) params.set("same_lane_filter", "true");
  return fetchCached<import("./types.js").HeroCounterStat[]>(
    `${BASE_URL}/v1/analytics/hero-counter-stats?${params}`,
  );
}

export function fetchHeroSynergyStats(
  heroId1: number,
  heroId2: number,
): Promise<import("./types.js").HeroSynergyStat[]> {
  const params = new URLSearchParams({
    hero_id1: String(heroId1),
    hero_id2: String(heroId2),
    same_lane_filter: "true",
  });
  return fetchCached<import("./types.js").HeroSynergyStat[]>(
    `${BASE_URL}/v1/analytics/hero-synergy-stats?${params}`,
  );
}

export function fetchAbilityOrderStats(
  heroId: number,
): Promise<import("./types.js").AbilityOrderStat[]> {
  return fetchCached<import("./types.js").AbilityOrderStat[]>(
    `${BASE_URL}/v1/analytics/ability-order-stats?hero_id=${heroId}`,
  );
}

export function fetchItemPermutationStats(
  heroId: number,
  combSize = 2,
): Promise<import("./types.js").ItemPermutationStat[]> {
  const params = new URLSearchParams({
    hero_ids: String(heroId),
    comb_size: String(combSize),
    min_matches: "500",
  });
  return fetchCached<import("./types.js").ItemPermutationStat[]>(
    `${BASE_URL}/v1/analytics/item-permutation-stats?${params}`,
  );
}
