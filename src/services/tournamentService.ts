import { supabase } from './supabase';
import { Tournament, TournamentEntry, TournamentBracket } from '../types';

export const tournamentService = {
  /**
   * Get all tournaments
   */
  async getTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('tournamentStart', { ascending: true });
      .order('tournamentstart', { ascending: true });

    if (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }

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

    if (updateError) {
      console.error('Error updating tournament participants:', updateError);
      return false;
    }

    return true;
  },

  /**
   * Update tournament
   */
  async updateTournament(tournamentId: string, updates: Partial<Tournament>): Promise<boolean> {
    const updateData: any = { updatedat: new Date().toISOString() };
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.participants) updateData.participantsdata = updates.participants;
    if (updates.brackets) updateData.bracketsdata = updates.brackets;

    const { error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', tournamentId);

    if (error) {
      console.error('Error updating tournament:', error);
      return false;
    }

    return true;
  }
};

export default tournamentService;