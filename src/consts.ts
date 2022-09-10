export const kGamesFeatures = new Map<number, string[]>([

  // Dota 2
  [
    7314,
    [
      'game_state_changed',
      'match_state_changed',
      'match_detected',
      'daytime_changed',
      'clock_time_changed',
      'ward_purchase_cooldown_changed',
      'match_ended',
      'kill',
      'assist',
      'death',
      'cs',
      'xpm',
      'gpm',
      'gold',
      'hero_leveled_up',
      'hero_respawned',
      'hero_buyback_info_changed',
      'hero_boughtback',
      'hero_health_mana_info',
      'hero_status_effect_changed',
      'hero_attributes_skilled',
      'hero_ability_skilled',
      'hero_ability_used',
      'hero_ability_cooldown_changed',
      'hero_ability_changed',
      'hero_item_cooldown_changed',
      'hero_item_changed',
      'hero_item_used',
      'hero_item_consumed',
      'hero_item_charged',
      'match_info',
      'roster',
      'party',
      'error',
      'hero_pool',
      'me',
      'game'
    ]
  ],
]);

export const kGameClassIds = Array.from(kGamesFeatures.keys());

export const kWindowNames = {
  inGame: 'in_game',
  desktop: 'desktop'
};

export const kHotkeys = {
  toggle: 'sample_app_ts_showhide'
};
