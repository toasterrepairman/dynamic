export interface HeroAsset {
  id: number;
  class_name: string;
  name: string;
  description: {
    lore: string;
    role: string;
    playstyle: string;
  };
  player_selectable: boolean;
  disabled: boolean;
  in_development: boolean;
  hero_type: string | null;
  complexity: number;
  tags: string[];
  gun_tag: string;
  colors: {
    ui: [number, number, number];
  };
  images: {
    icon_hero_card: string;
    icon_hero_card_webp: string;
    icon_image_small: string;
    icon_image_small_webp: string;
    background_image: string;
    background_image_webp: string;
  };
  items: {
    weapon_primary: string;
    weapon_melee: string;
    ability_innate1: string;
    ability_innate2: string;
    ability_innate3: string;
    signature1: string;
    signature2: string;
    signature3: string;
    signature4: string;
  };
  starting_stats: Record<string, { value: number; display_stat_name: string }>;
}

export interface ItemAsset {
  id: number;
  class_name: string;
  name: string;
  type: string;
  shopable: boolean;
  start_trained: boolean;
  image: string;
  image_webp: string;
  item_slot_type?: string;
  item_tier?: number;
  cost?: number;
  description?: { desc?: string };
  is_active_item?: boolean;
  activation?: string;
  heroes: string[];
  properties: Record<string, ItemProperty>;
}

export interface ItemProperty {
  value: string;
  label?: string;
  postfix?: string;
  icon?: string;
  css_class?: string;
}

export interface ItemStat {
  item_id: number;
  bucket: number;
  wins: number;
  losses: number;
  matches: number;
  players: number;
  avg_buy_time_s: number;
  avg_sell_time_s: number;
  avg_buy_time_relative: number;
  avg_sell_time_relative: number;
}

export interface HeroCounterStat {
  hero_id: number;
  enemy_hero_id: number;
  wins: number;
  matches_played: number;
  kills: number;
  deaths: number;
  assists: number;
  denies: number;
  last_hits: number;
  networth: number;
  obj_damage: number;
  creeps: number;
  enemy_kills: number;
  enemy_deaths: number;
  enemy_assists: number;
  enemy_denies: number;
  enemy_last_hits: number;
  enemy_networth: number;
  enemy_obj_damage: number;
  enemy_creeps: number;
}

export interface HeroSynergyStat {
  hero_id1: number;
  hero_id2: number;
  wins: number;
  matches_played: number;
  kills1: number;
  kills2: number;
  deaths1: number;
  deaths2: number;
  assists1: number;
  assists2: number;
  denies1: number;
  denies2: number;
  last_hits1: number;
  last_hits2: number;
  networth1: number;
  networth2: number;
  obj_damage1: number;
  obj_damage2: number;
  creeps1: number;
  creeps2: number;
}

export interface AbilityOrderStat {
  ability_order: number[];
  wins: number;
  losses: number;
  matches: number;
  players: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface ItemPermutationStat {
  item_ids: number[];
  wins: number;
  losses: number;
  matches: number;
}

export interface TieredItem {
  item: ItemAsset;
  stat: ItemStat;
  winRate: number;
  adjustedWinRate: number;
  tier: "S" | "A" | "B" | "C" | "D";
}

export interface AppState {
  view: "hero-select" | "lane-config" | "results";
  myHero: HeroAsset | null;
  teammate: HeroAsset | null;
  enemies: [HeroAsset | null, HeroAsset | null];
  heroes: HeroAsset[];
  items: ItemAsset[];
  counterItems: TieredItem[];
  matchups: HeroCounterStat[];
  synergy: HeroSynergyStat | null;
  abilityOrders: AbilityOrderStat[];
  itemCombos: ItemPermutationStat[];
  loading: boolean;
  error: string | null;
}
