import { supabase } from './supabase';
import { safeSupabaseOperation } from './supabase';
import { Player } from '../types';

class PlayerService {
  async getPlayerByWallet(walletAddress: string): Promise<Player | null> {
    return await safeSupabaseOperation(async () => {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('walletaddress', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No player found
          return null;
        }
        throw error;
      }

      return this.mapDatabaseToPlayer(data);
    }, null);
  }

  async createPlayer(player: Player): Promise<Player | null> {
    return await safeSupabaseOperation(async () => {
      if (!supabase) return player; // Return the player as-is for demo mode
      
      const playerData = this.mapPlayerToDatabase(player);
      const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToPlayer(data);
    }, player);
  }

  async updatePlayer(player: Player): Promise<Player | null> {
    return await safeSupabaseOperation(async () => {
      if (!supabase) return player; // Return the player as-is for demo mode
      
      const playerData = this.mapPlayerToDatabase(player);
      
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', player.id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToPlayer(data);
    }, player);
  }

  async updatePlayerBalance(playerId: string, balanceChange: number): Promise<boolean> {
    return await safeSupabaseOperation(async () => {
      if (!supabase) return true; // Always succeed in demo mode
      
      // First get current balance
      const { data: currentData, error: fetchError } = await supabase
        .from('players')
        .select('assetsdata')
        .eq('id', playerId)
        .single();

      if (fetchError) throw fetchError;

      const assets = currentData.assetsdata as any;
      const newBalance = Math.max(0, (assets.turfBalance || 0) + balanceChange);
      
      const { error: updateError } = await supabase
        .from('players')
        .update({
          assetsdata: { ...assets, turfBalance: newBalance },
          updatedat: new Date().toISOString()
        })
        .eq('id', playerId);

      if (updateError) throw updateError;

      return true;
    }, true);
  }

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
}

export const playerService = new PlayerService();
export default playerService;