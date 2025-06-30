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
      genetics: horse.geneticsdata as any,
      stats: horse.statsdata as any,
      breeding: horse.breedingdata as any,
      training: horse.trainingdata as any,
      appearance: horse.appearancedata as any,
      lore: horse.loredata as any,
      owner: horse.owner,
      isForSale: horse.isforsale,
      price: horse.price,
      isForLease: horse.isforlease,
      leaseTerms: horse.leasetermsdata as any
    }));
  },

  /**
   * Get all horses available for sale
   */
  async getHorsesForSale(): Promise<HorseNFT[]> {
    const { data, error } = await supabase
      .from('horses')
      .select('*')
      .eq('isforsale', true);

    if (error) {
      console.error('Error fetching horses for sale:', error);
      return [];
    }

    return data.map(horse => ({
      id: horse.id,
      tokenId: horse.tokenId,
      name: horse.name,
      genetics: horse.geneticsdata as any,
      stats: horse.statsdata as any,
      breeding: horse.breedingdata as any,
      training: horse.trainingdata as any,
      appearance: horse.appearancedata as any,
      lore: horse.loredata as any,
      owner: horse.owner,
      isForSale: horse.isforsale,
      price: horse.price,
      isForLease: horse.isforlease,
      leaseTerms: horse.leasetermsdata as any
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
      genetics: data.geneticsdata as any,
      stats: data.statsdata as any,
      breeding: data.breedingdata as any,
      training: data.trainingdata as any,
      appearance: data.appearancedata as any,
      lore: data.loredata as any,
      owner: data.owner,
      isForSale: data.isforsale,
      price: data.price,
      isForLease: data.isforlease,
      leaseTerms: data.leasetermsdata as any
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
      geneticsdata: horse.genetics,
      statsdata: horse.stats,
      breedingdata: horse.breeding,
      trainingdata: horse.training,
      appearancedata: horse.appearance,
      loredata: horse.lore,
      owner: horse.owner,
      isforsale: horse.isForSale,
      price: horse.price,
      isforlease: horse.isForLease,
      leasetermsdata: horse.leaseTerms,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
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
    const updateData: any = { updatedat: new Date().toISOString() };
    
    if (updates.name) updateData.name = updates.name;
    if (updates.genetics) updateData.geneticsdata = updates.genetics;
    if (updates.stats) updateData.statsdata = updates.stats;
    if (updates.breeding) updateData.breedingdata = updates.breeding;
    if (updates.training) updateData.trainingdata = updates.training;
    if (updates.appearance) updateData.appearancedata = updates.appearance;
    if (updates.lore) updateData.loredata = updates.lore;
    if (updates.owner !== undefined) updateData.owner = updates.owner;
    if (updates.isForSale !== undefined) updateData.isforsale = updates.isForSale;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.isForLease !== undefined) updateData.isforlease = updates.isForLease;
    if (updates.leaseTerms) updateData.leasetermsdata = updates.leaseTerms;

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
      .select('owner, price, isforsale')
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
        isforsale: false,
        price: null,
        updatedat: new Date().toISOString()
      })
      .eq('id', horseId);

    if (updateError) {
      console.error('Error updating horse ownership:', updateError);
      return false;
    }

    // Record transaction
    if (horse.isforsale && horse.price) {
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
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString()
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
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString()
      });
    }

    return true;
  },
};

export default horseService;