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

export interface DescendantWithLocale extends Descendant {
  locale: "ko" | "en";
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

export interface ModuleWithLocale extends Module {
  locale: "ko" | "en";
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

export interface MapDataWithLocale extends MapData {
  locale: "ko" | "en";
}

export interface ReactorSkillPower {
  level: number;
  skill_atk_power: number;
  sub_skill_atk_power: number;
  skill_power_coefficient: {
    coefficient_stat_id: string;
    coefficient_stat_value: number;
  }[];
  enchant_effect: {
    enchant_level: number;
    stat_type: string;
    value: number;
  }[];
}

export interface Reactor {
  reactor_id: string;
  reactor_name: string;
  image_url: string;
  reactor_tier: string;
  reactor_skill_power: ReactorSkillPower[];
  optimized_condition_type: string;
}

export interface ReactorWithLocale extends Reactor {
  locale: "ko" | "en";
}

export interface ExternalComponent {
  external_component_id: string;
  external_component_name: string;
  image_url: string;
  external_component_equipment_type: string;
  external_component_tier: string;
  base_stat: {
    level: number;
    stat_id: string;
    stat_value: number;
  }[];
  set_option_detail: {
    set_option: string;
    set_count: number;
    set_option_effect: string;
  }[];
}

export interface ExternalComponentWithLocale extends ExternalComponent {
  locale: "ko" | "en";
}

export interface Weapon {
  weapon_name: string;
  weapon_id: string;
  image_url: string;
  weapon_type: string;
  weapon_tier: string;
  weapon_rounds_type: string;
  base_stat: {
    stat_id: string;
    stat_value: number;
  }[];
  firearm_atk: {
    level: number;
    firearm: {
      firearm_atk_type: string;
      firearm_atk_value: number;
    }[];
  }[];
  weapon_perk_ability_name?: string;
  weapon_perk_ability_description?: string;
  weapon_perk_ability_image_url?: string;
}

export interface WeaponWithLocale extends Weapon {
  locale: "ko" | "en";
}

export interface Stat {
  stat_id: string;
  stat_name: string;
}

export interface StatWithLocale extends Stat {
  locale: "ko" | "en";
}

