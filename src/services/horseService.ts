import { supabase } from './supabase';
import { HorseNFT } from '../types';

export const horseService = {
  /**
   * Get horses owned by a player
   */
  async getPlayerHorses(walletAddress: string): Promise<HorseNFT[]> {
    const { data, error } = await supabase
      .from('horses')
      .select('*')
      .eq('owner', walletAddress);

    if (error) {
      console.error('Error fetching player horses:', error);
      return [];
    }

    return data.map(horse => ({
      id: horse.id,
      tokenId: horse.tokenId,
      name: horse.name,
      genetics: horse.geneticsData as any,
      stats: horse.statsData as any,
      breeding: horse.breedingData as any,
      training: horse.trainingData as any,
      appearance: horse.appearanceData as any,
      lore: horse.loreData as any,
      owner: horse.owner,
      isForSale: horse.isForSale,
      price: horse.price,
      isForLease: horse.isForLease,
      leaseTerms: horse.leaseTermsData as any
    }));
  },

  /**
   * Get all horses available for sale
   */
  async getHorsesForSale(): Promise<HorseNFT[]> {
    const { data, error } = await supabase
      .from('horses')
      .select('*')
      .eq('isForSale', true);

    if (error) {
      console.error('Error fetching horses for sale:', error);
      return [];
    }

    return data.map(horse => ({
      id: horse.id,
      tokenId: horse.tokenId,
      name: horse.name,
      genetics: horse.geneticsData as any,
      stats: horse.statsData as any,
      breeding: horse.breedingData as any,
      training: horse.trainingData as any,
      appearance: horse.appearanceData as any,
      lore: horse.loreData as any,
      owner: horse.owner,
      isForSale: horse.isForSale,
      price: horse.price,
      isForLease: horse.isForLease,
      leaseTerms: horse.leaseTermsData as any
    }));
  },

  /**
   * Get a horse by ID
   */
  async getHorseById(horseId: string): Promise<HorseNFT | null> {
    const { data, error } = await supabase
      .from('horses')
      .select('*')
      .eq('id', horseId)
      .single();

    if (error) {
      console.error('Error fetching horse:', error);
      return null;
    }

    return {
      id: data.id,
      tokenId: data.tokenId,
      name: data.name,
      genetics: data.geneticsData as any,
      stats: data.statsData as any,
      breeding: data.breedingData as any,
      training: data.trainingData as any,
      appearance: data.appearanceData as any,
      lore: data.loreData as any,
      owner: data.owner,
      isForSale: data.isForSale,
      price: data.price,
      isForLease: data.isForLease,
      leaseTerms: data.leaseTermsData as any
    };
  },

  /**
   * Add a new horse
   */
  async addHorse(horse: HorseNFT): Promise<HorseNFT | null> {
    const { data, error } = await supabase.from('horses').insert({
      id: horse.id,
      tokenId: horse.tokenId,
      name: horse.name,
      geneticsData: horse.genetics,
      statsData: horse.stats,
      breedingData: horse.breeding,
      trainingData: horse.training,
      appearanceData: horse.appearance,
      loreData: horse.lore,
      owner: horse.owner,
      isForSale: horse.isForSale,
      price: horse.price,
      isForLease: horse.isForLease,
      leaseTermsData: horse.leaseTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error('Error adding horse:', error);
      return null;
    }

    return horse;
  },

  /**
   * Update a horse
   */
  async updateHorse(horseId: string, updates: Partial<HorseNFT>): Promise<boolean> {
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (updates.name) updateData.name = updates.name;
    if (updates.genetics) updateData.geneticsData = updates.genetics;
    if (updates.stats) updateData.statsData = updates.stats;
    if (updates.breeding) updateData.breedingData = updates.breeding;
    if (updates.training) updateData.trainingData = updates.training;
    if (updates.appearance) updateData.appearanceData = updates.appearance;
    if (updates.lore) updateData.loreData = updates.lore;
    if (updates.owner !== undefined) updateData.owner = updates.owner;
    if (updates.isForSale !== undefined) updateData.isForSale = updates.isForSale;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.isForLease !== undefined) updateData.isForLease = updates.isForLease;
    if (updates.leaseTerms) updateData.leaseTermsData = updates.leaseTerms;

    const { error } = await supabase
      .from('horses')
      .update(updateData)
      .eq('id', horseId);

    if (error) {
      console.error('Error updating horse:', error);
      return false;
    }

    return true;
  },

  /**
   * Update horse ownership
   */
  async transferHorse(horseId: string, newOwner: string, txSignature?: string): Promise<boolean> {
    const { data: horse, error: fetchError } = await supabase
      .from('horses')
      .select('owner, price, isForSale')
      .eq('id', horseId)
      .single();

    if (fetchError) {
      console.error('Error fetching horse for transfer:', fetchError);
      return false;
    }

    const { error: updateError } = await supabase
      .from('horses')
      .update({
        owner: newOwner,
        isForSale: false,
        price: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', horseId);

    if (updateError) {
      console.error('Error updating horse ownership:', updateError);
      return false;
    }

    // Record transaction
    if (horse.isForSale && horse.price) {
      await supabase.from('transactions').insert({
        id: `horse-sale-${Date.now()}`,
        playerId: newOwner,
        type: 'horse_purchase',
        amount: horse.price,
        currency: 'TURF',
        relatedId: horseId,
        description: `Purchased horse: ${horseId}`,
        timestamp: new Date().toISOString(),
        signature: txSignature || null,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await supabase.from('transactions').insert({
        id: `horse-sold-${Date.now()}`,
        playerId: horse.owner,
        type: 'horse_sale',
        amount: horse.price,
        currency: 'TURF',
        relatedId: horseId,
        description: `Sold horse: ${horseId}`,
        timestamp: new Date().toISOString(),
        signature: txSignature || null,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return true;
  },
};

export default horseService;