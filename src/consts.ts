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
      'hero_buyback_info_changed',
      'match_ended',
      'match_info',
      'roster',
      'party',
      'error',
      'hero_pool',
      'hero_item_cooldown_changed',
      'hero_item_changed',
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
