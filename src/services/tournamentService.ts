import { supabase } from './supabase';
import { safeSupabaseOperation } from './supabase';
import { Tournament, TournamentEntry, TournamentBracket } from '../types';

export const tournamentService = {
  /**
   * Get all tournaments
   */
  async getTournaments(): Promise<Tournament[]> {
    return await safeSupabaseOperation(async () => {
      if (!supabase) return [];
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('tournamentstart', { ascending: true });
      
      if (error) throw error;
      
      return data.map(this.mapDatabaseToTournament);
    }, []);
  },

  mapDatabaseToTournament(data) {
    return data.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.type as any,
      requirements: t.requirementsdata as any,
      prizePool: t.prizepool,
      prizeDistribution: t.prizedistribution as Record<string, number>,
      registrationStart: new Date(t.registrationstart).getTime(),
      registrationEnd: new Date(t.registrationend).getTime(),
      tournamentStart: new Date(t.tournamentstart).getTime(),
      tournamentEnd: new Date(t.tournamentend).getTime(),
      participants: t.participantsdata as TournamentEntry[],
      brackets: t.bracketsdata as TournamentBracket[] | undefined,
      status: t.status as any,
      category: t.category || undefined,
      tier: t.tier || undefined
    }));
  },

  /**
   * Add a new tournament
   */
  async addTournament(tournament: Tournament): Promise<Tournament | null> {
    const { data, error } = await supabase.from('tournaments').insert({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      type: tournament.type,
      requirementsdata: tournament.requirements,
      prizepool: tournament.prizePool,
      prizedistribution: tournament.prizeDistribution,
      registrationstart: new Date(tournament.registrationStart).toISOString(),
      registrationend: new Date(tournament.registrationEnd).toISOString(),
      tournamentstart: new Date(tournament.tournamentStart).toISOString(),
      tournamentend: new Date(tournament.tournamentEnd).toISOString(),
      participantsdata: tournament.participants || [],
      bracketsdata: tournament.brackets || null,
      status: tournament.status,
      category: tournament.category || null,
      tier: tournament.tier || null,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('Error adding tournament:', error);
      return null;
    }

    return tournament;
  },

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: string, entry: TournamentEntry): Promise<boolean> {
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('participantsdata, status, registrationend')
      .eq('id', tournamentId)
      .single();

    if (fetchError) {
      console.error('Error fetching tournament for entry:', fetchError);
      return false;
    }

    // Check if registration is still open
    if (tournament.status !== 'Registration' || new Date(tournament.registrationend) < new Date()) {
      console.error('Tournament registration closed');
      return false;
    }

    // Add entry to participants
    const participants = [...(tournament.participantsdata as TournamentEntry[]), entry];

    const { error: updateError } = await supabase
      .from('tournaments')
      .update({
        participantsdata: participants,
        updatedat: new Date().toISOString()
      })
      .eq('id', tournamentId);

    return await safeSupabaseOperation(async () => {
      if (!supabase) return true; // Always succeed in demo mode
      
      // Get current tournament
      const { data: tournament, error: fetchError } = await supabase
        .from('tournaments')
        .select('participantsdata')
        .eq('id', tournamentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Add new participant
      const currentParticipants = tournament.participantsdata || [];
      const updatedParticipants = [...currentParticipants, entry];
      
      // Update tournament
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ participantsdata: updatedParticipants })
        .eq('id', tournamentId);
      
      if (updateError) throw updateError;
      return true;
    }, true);
  }
};