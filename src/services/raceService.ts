import { supabase } from './supabase';
import { Race, RaceEntry, RaceResult, Bet } from '../types';
import playerService from './playerService';

export const raceService = {
  /**
   * Get all upcoming races
   */
  async getUpcomingRaces(): Promise<Race[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .gt('raceTime', now)
      .order('raceTime', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming races:', error);
      return [];
    }

    return data.map(race => ({
      id: race.id,
      name: race.name,
      type: race.type as any,
      surface: race.surface as any,
      distance: race.distance,
      tier: race.tier as any,
      conditions: race.conditionsData as any,
      requirements: race.requirementsData as any,
      entryFee: race.entryFee,
      prizePool: race.prizePool,
      prizeDistribution: race.prizeDistribution as number[],
      participants: race.participantsData as RaceEntry[],
      maxParticipants: race.maxParticipants,
      registrationDeadline: new Date(race.registrationDeadline).getTime(),
      raceTime: new Date(race.raceTime).getTime(),
      results: race.resultsData as RaceResult[] | undefined,
      status: race.status as any
    }));
  },

  /**
   * Add a new race
   */
  async addRace(race: Race): Promise<Race | null> {
    const { data, error } = await supabase.from('races').insert({
      id: race.id,
      name: race.name,
      type: race.type,
      surface: race.surface,
      distance: race.distance,
      tier: race.tier,
      conditionsData: race.conditions,
      requirementsData: race.requirements,
      entryFee: race.entryFee,
      prizePool: race.prizePool,
      prizeDistribution: race.prizeDistribution,
      participantsData: race.participants || [],
      maxParticipants: race.maxParticipants,
      registrationDeadline: new Date(race.registrationDeadline).toISOString(),
      raceTime: new Date(race.raceTime).toISOString(),
      resultsData: race.results || null,
      status: race.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('Error adding race:', error);
      return null;
    }

    return race;
  },

  /**
   * Enter a race
   */
  async enterRace(raceId: string, entry: RaceEntry): Promise<boolean> {
    const { data: race, error: fetchError } = await supabase
      .from('races')
      .select('participantsData, status, registrationDeadline')
      .eq('id', raceId)
      .single();

    if (fetchError) {
      console.error('Error fetching race for entry:', fetchError);
      return false;
    }

    // Check if registration is still open
    if (race.status !== 'Registration' || new Date(race.registrationDeadline) < new Date()) {
      console.error('Race registration closed');
      return false;
    }

    // Add entry to participants
    const participants = [...(race.participantsData as RaceEntry[]), entry];

    const { error: updateError } = await supabase
      .from('races')
      .update({
        participantsData: participants,
        updatedAt: new Date().toISOString()
      })
      .eq('id', raceId);

    if (updateError) {
      console.error('Error updating race participants:', updateError);
      return false;
    }

    return true;
  },

  /**
   * Update race results
   */
  async updateRaceResults(raceId: string, results: RaceResult[]): Promise<boolean> {
    const { error } = await supabase
      .from('races')
      .update({
        resultsData: results,
        status: 'Finished',
        updatedAt: new Date().toISOString()
      })
      .eq('id', raceId);

    if (error) {
      console.error('Error updating race results:', error);
      return false;
    }

    return true;
  },

  /**
   * Place a bet
   */
  async placeBet(bet: Bet): Promise<boolean> {
    const { error } = await supabase.from('bets').insert({
      id: bet.id,
      playerId: bet.playerId,
      raceId: bet.raceId,
      horseId: bet.horseId,
      type: bet.type,
      amount: bet.amount,
      odds: bet.odds,
      potentialPayout: bet.potentialPayout,
      status: bet.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (error) {
      console.error('Error placing bet:', error);
      return false;
    }

    // Record transaction
    await supabase.from('transactions').insert({
      id: `bet-${Date.now()}`,
      playerId: bet.playerId,
      type: 'bet_placed',
      amount: -bet.amount,
      currency: 'TURF',
      relatedId: bet.id,
      description: `Placed ${bet.type} bet on race ${bet.raceId}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return true;
  },

  /**
   * Process bet results
   */
  async processBetResults(raceId: string, results: RaceResult[]): Promise<void> {
    // Get all bets for this race
    const { data: bets, error: fetchError } = await supabase
      .from('bets')
      .select('*')
      .eq('raceId', raceId)
      .eq('status', 'Active');

    if (fetchError) {
      console.error('Error fetching bets for race:', fetchError);
      return;
    }

    // Process each bet
    for (const bet of bets) {
      let won = false;
      
      // Determine if bet won based on type
      const winner = results.find(r => r.position === 1);
      const secondPlace = results.find(r => r.position === 2);
      const thirdPlace = results.find(r => r.position === 3);
      
      switch (bet.type) {
        case 'Win':
          won = bet.horseId === winner?.horseId;
          break;
        case 'Place':
          won = bet.horseId === winner?.horseId || bet.horseId === secondPlace?.horseId;
          break;
        case 'Show':
          won = bet.horseId === winner?.horseId || bet.horseId === secondPlace?.horseId || bet.horseId === thirdPlace?.horseId;
          break;
        // Add more complex bet types like exacta, trifecta here
      }

      // Update bet status
      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: won ? 'Won' : 'Lost',
          updatedAt: new Date().toISOString()
        })
        .eq('id', bet.id);

      if (updateError) {
        console.error('Error updating bet status:', updateError);
        continue;
      }

      // If bet won, process payout
      if (won) {
        await playerService.updatePlayerBalance(bet.playerId, bet.potentialPayout);
        
        // Record transaction
        await supabase.from('transactions').insert({
          id: `bet-win-${Date.now()}`,
          playerId: bet.playerId,
          type: 'bet_win',
          amount: bet.potentialPayout,
          currency: 'TURF',
          relatedId: bet.id,
          description: `Won ${bet.type} bet on race ${bet.raceId}`,
          timestamp: new Date().toISOString(),
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  }
};

export default raceService;