export interface StatDetail {
  stat_type: string;
  stat_value: number;
}

export interface DescendantStat {
  level: number;
  stat_detail: StatDetail[];
}

export interface DescendantSkill {
  skill_type: string;
  skill_name: string;
  element_type: string;
  arche_type: string;
  skill_image_url: string;
  skill_description: string;
}

export interface Descendant {
  descendant_id: string;
  descendant_name: string;
  descendant_image_url: string;
  descendant_stat: DescendantStat[];
  descendant_skill: DescendantSkill[];
}

export interface ModuleStat {
  level: number;
  module_capacity: number;
  value: string;
}

export interface Module {
  module_name: string;
  module_id: string;
  image_url: string;
  module_type: string | null;
  module_tier: string;
  module_socket_type: string;
  module_class: string;
  module_stat: ModuleStat[];
}

export interface Reward {
  rotation: number;
  reward_type: string;
  reactor_element_type: string;
  weapon_rounds_type: string;
  arche_type: string;
}

export interface BattleZone {
  battle_zone_id: string;
  battle_zone_name: string;
  reward: Reward[];
}

export interface MapData {
  map_id: string;
  map_name: string;
  battle_zone: BattleZone[];
}
