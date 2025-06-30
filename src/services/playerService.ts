import { supabase } from './supabase';
import { Player } from '../types';

export const playerService = {
  /**
   * Get a player by wallet address
   */
  async getPlayerByWallet(walletAddress: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('walletaddress', walletAddress)
      .maybeSingle();

    if (error) {
      console.error('Error fetching player:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      walletAddress: data.walletaddress,
      username: data.username,
      profile: data.profiledata as any,
      assets: data.assetsdata as any,
      stats: data.statsdata as any,
      social: data.socialdata as any,
      preferences: data.preferencesdata as any
    };
  },

  /**
   * Create a new player
   */
  async createPlayer(player: Player): Promise<Player | null> {
    const { data, error } = await supabase.from('players').insert({
      id: player.id,
      walletaddress: player.walletAddress,
      username: player.username,
      profiledata: player.profile,
      assetsdata: player.assets,
      statsdata: player.stats,
      socialdata: player.social,
      preferencesdata: player.preferences,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('Error creating player:', error);
      return null;
    }

    return player;
  },

  /**
   * Update a player's data
   */
  async updatePlayer(player: Player): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .update({
        username: player.username,
        profiledata: player.profile,
        assetsdata: player.assets,
        statsdata: player.stats,
        socialdata: player.social,
        preferencesdata: player.preferences,
        updatedat: new Date().toISOString()
      })
      .eq('id', player.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      return null;
    }

    return player;
  },

  /**
   * Update player balance
   */
  async updatePlayerBalance(playerId: string, amount: number): Promise<boolean> {
    const { data: playerData, error: fetchError } = await supabase
      .from('players')
      .select('assetsdata')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error('Error fetching player for balance update:', fetchError);
      return false;
    }

    const assets = playerData.assetsdata as any;
    assets.turfBalance = Math.max(0, (assets.turfBalance || 0) + amount);

    const { error: updateError } = await supabase
      .from('players')
      .update({
        assetsdata: assets,
        updatedat: new Date().toISOString()
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('Error updating player balance:', updateError);
      return false;
    }

    return true;
  },

  /**
   * Perform daily check-in
   */
  async performDailyCheckIn(playerId: string): Promise<{ success: boolean, reward: number }> {
    // First, get the current player data
    const { data: playerData, error: fetchError } = await supabase
      .from('players')
      .select('statsdata, assetsdata')
      .eq('id', playerId)
      .single();

    if (fetchError) {
      console.error('Error fetching player for check-in:', fetchError);
      return { success: false, reward: 0 };
    }

    const stats = playerData.statsdata as any;
    const assets = playerData.assetsdata as any;
    
    const now = Date.now();
    const lastCheckIn = stats.lastCheckIn || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed since last check-in
    const canClaimReward = !stats.lastCheckIn || (now - lastCheckIn > oneDayMs);
    
    if (!canClaimReward) {
      return { success: false, reward: 0 };
    }

    // Check if streak continues or resets
    const isStreakContinuing = stats.lastCheckIn && (now - lastCheckIn < oneDayMs * 2);
    const newStreak = isStreakContinuing ? (stats.consecutiveCheckIns + 1) : 1;
    
    // Calculate bonus based on streak
    const streakBonus = Math.min(1000, newStreak * 100); // 100 bonus per day up to 1000
    const totalReward = 1000 + streakBonus;

    // Update player data
    stats.lastCheckIn = now;
    stats.consecutiveCheckIns = newStreak;
    assets.turfBalance += totalReward;

    const { error: updateError } = await supabase
      .from('players')
      .update({
        statsdata: stats,
        assetsdata: assets,
        updatedat: new Date().toISOString()
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('Error updating player for check-in:', updateError);
      return { success: false, reward: 0 };
    }

    // Record transaction
    await supabase.from('transactions').insert({
      id: `check-in-${Date.now()}`,
      playerId: playerId,
      type: 'check_in_reward',
      amount: totalReward,
      currency: 'TURF',
      description: `Daily check-in reward (${newStreak} day streak)`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    });

    return { success: true, reward: totalReward };
  }
};

export default playerService;