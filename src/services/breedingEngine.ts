// Advanced breeding engine with real genetic algorithms
import { HorseNFT } from '../types';

export interface BreedingResult {
  success: boolean;
  offspring: HorseNFT;
  mutations: string[];
  inheritancePattern: string;
}

export interface CompatibilityAnalysis {
  compatibilityScore: number;
  bloodlineCompatibility: number;
  geneticDiversity: number;
  projectedStats: {
    baseSpeed: number;
    stamina: number;
    agility: number;
    temperament: number;
    intelligence: number;
  };
  rarityChances: Record<string, number>;
  recommendation: string;
  potentialTraits: string[];
}

export class BreedingEngine {
  private readonly mutationRate = 0.15; // 15% chance of mutations
  private readonly rarityThresholds = {
    Common: 50,
    Uncommon: 70,
    Rare: 85,
    Epic: 95,
    Legendary: 99
  };

  public analyzeCompatibility(mare: HorseNFT, stallion: HorseNFT): CompatibilityAnalysis {
    const bloodlineCompatibility = this.calculateBloodlineCompatibility(mare, stallion);
    const geneticDiversity = this.calculateGeneticDiversity(mare, stallion);
    const averageStats = this.calculateAverageStats(mare, stallion);
    const projectedStats = this.projectOffspringStats(mare, stallion);
    const rarityChances = this.calculateRarityChances(mare, stallion);
    
    const compatibilityScore = Math.round(
      (bloodlineCompatibility * 0.4) +
      (geneticDiversity * 0.3) +
      (averageStats * 0.3)
    );

    const recommendation = this.generateRecommendation(compatibilityScore, bloodlineCompatibility, geneticDiversity);
    const potentialTraits = this.predictPotentialTraits(mare, stallion);

    return {
      compatibilityScore,
      bloodlineCompatibility: Math.round(bloodlineCompatibility),
      geneticDiversity: Math.round(geneticDiversity),
      projectedStats,
      rarityChances,
      recommendation,
      potentialTraits
    };
  }

  public breedHorses(mare: HorseNFT, stallion: HorseNFT): BreedingResult {
    // Calculate base genetics from parents
    const genetics = this.inheritGenetics(mare, stallion);
    
    // Apply mutations
    const mutations: string[] = [];
    Object.keys(genetics).forEach(trait => {
      if (Math.random() < this.mutationRate) {
        if (typeof genetics[trait] === 'number') {
          const mutation = (Math.random() - 0.5) * 20; // ±10 point mutation
          genetics[trait] = Math.max(1, Math.min(100, genetics[trait] + mutation));
          mutations.push(`${trait}: ${mutation > 0 ? '+' : ''}${Math.round(mutation)}`);
        }
      }
    });

    // Determine rarity based on genetics
    const avgGenetic = (genetics.baseSpeed + genetics.stamina + genetics.agility + genetics.temperament + genetics.intelligence) / 5;
    const rarity = this.determineRarity(avgGenetic, mare.genetics.rarity, stallion.genetics.rarity);

    // Generate unique offspring
    const offspring = this.createOffspring(mare, stallion, genetics, rarity, mutations);

    return {
      success: true,
      offspring,
      mutations,
      inheritancePattern: this.analyzeInheritancePattern(mare, stallion, offspring)
    };
  }

  private calculateBloodlineCompatibility(mare: HorseNFT, stallion: HorseNFT): number {
    const bloodlineMatrix = {
      'Arabian': { 'Arabian': 95, 'Thoroughbred': 85, 'Quarter Horse': 70, 'Mustang': 60, 'Legendary': 90 },
      'Thoroughbred': { 'Arabian': 85, 'Thoroughbred': 95, 'Quarter Horse': 80, 'Mustang': 65, 'Legendary': 90 },
      'Quarter Horse': { 'Arabian': 70, 'Thoroughbred': 80, 'Quarter Horse': 95, 'Mustang': 75, 'Legendary': 85 },
      'Mustang': { 'Arabian': 60, 'Thoroughbred': 65, 'Quarter Horse': 75, 'Mustang': 95, 'Legendary': 80 },
      'Legendary': { 'Arabian': 90, 'Thoroughbred': 90, 'Quarter Horse': 85, 'Mustang': 80, 'Legendary': 99 }
    };

    return bloodlineMatrix[mare.genetics.bloodline]?.[stallion.genetics.bloodline] || 50;
  }

  private calculateGeneticDiversity(mare: HorseNFT, stallion: HorseNFT): number {
    const mareStats = [mare.genetics.baseSpeed, mare.genetics.stamina, mare.genetics.agility, mare.genetics.temperament, mare.genetics.intelligence];
    const stallionStats = [stallion.genetics.baseSpeed, stallion.genetics.stamina, stallion.genetics.agility, stallion.genetics.temperament, stallion.genetics.intelligence];
    
    let totalDifference = 0;
    mareStats.forEach((stat, index) => {
      totalDifference += Math.abs(stat - stallionStats[index]);
    });

    // Optimal diversity is moderate differences (not too similar, not too different)
    const avgDifference = totalDifference / mareStats.length;
    if (avgDifference < 10) return 40; // Too similar
    if (avgDifference > 40) return 60; // Too different
    return 70 + (avgDifference - 10) * 1.5; // Optimal range
  }

  private calculateAverageStats(mare: HorseNFT, stallion: HorseNFT): number {
    const mareAvg = (mare.genetics.baseSpeed + mare.genetics.stamina + mare.genetics.agility + mare.genetics.temperament + mare.genetics.intelligence) / 5;
    const stallionAvg = (stallion.genetics.baseSpeed + stallion.genetics.stamina + stallion.genetics.agility + stallion.genetics.temperament + stallion.genetics.intelligence) / 5;
    return (mareAvg + stallionAvg) / 2;
  }

  private projectOffspringStats(mare: HorseNFT, stallion: HorseNFT): any {
    const inheritance = {
      baseSpeed: this.calculateInheritedStat(mare.genetics.baseSpeed, stallion.genetics.baseSpeed),
      stamina: this.calculateInheritedStat(mare.genetics.stamina, stallion.genetics.stamina),
      agility: this.calculateInheritedStat(mare.genetics.agility, stallion.genetics.agility),
      temperament: this.calculateInheritedStat(mare.genetics.temperament, stallion.genetics.temperament),
      intelligence: this.calculateInheritedStat(mare.genetics.intelligence, stallion.genetics.intelligence)
    };

    return inheritance;
  }

  private calculateInheritedStat(mareStat: number, stallionStat: number): number {
    // Weighted inheritance with slight regression to mean
    const average = (mareStat + stallionStat) / 2;
    const variance = Math.abs(mareStat - stallionStat) * 0.3;
    const regression = average * 0.9 + 50 * 0.1; // 10% regression to 50 (average)
    
    return Math.round(Math.max(1, Math.min(100, regression + (Math.random() - 0.5) * variance)));
  }

  private calculateRarityChances(mare: HorseNFT, stallion: HorseNFT): Record<string, number> {
    const mareRarity = this.getRarityScore(mare.genetics.rarity);
    const stallionRarity = this.getRarityScore(stallion.genetics.rarity);
    const avgRarity = (mareRarity + stallionRarity) / 2;

    const baseChances = {
      Common: 40,
      Uncommon: 30,
      Rare: 20,
      Epic: 8,
      Legendary: 2
    };

    // Adjust based on parent rarities
    const modifier = (avgRarity - 1) * 10; // 0-40 bonus
    
    return {
      Common: Math.max(5, baseChances.Common - modifier),
      Uncommon: baseChances.Uncommon + modifier * 0.3,
      Rare: baseChances.Rare + modifier * 0.4,
      Epic: baseChances.Epic + modifier * 0.2,
      Legendary: Math.min(15, baseChances.Legendary + modifier * 0.1)
    };
  }

  private getRarityScore(rarity: string): number {
    const scores = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
    return scores[rarity] || 1;
  }

  private generateRecommendation(compatibility: number, bloodline: number, diversity: number): string {
    if (compatibility >= 80) {
      return "Excellent match! High chance of superior offspring with enhanced traits.";
    } else if (compatibility >= 60) {
      return "Good compatibility. Likely to produce quality offspring.";
    } else if (compatibility >= 40) {
      return "Moderate match. Results may vary, consider other options.";
    } else {
      return "Poor compatibility. High risk of disappointing results.";
    }
  }

  private predictPotentialTraits(mare: HorseNFT, stallion: HorseNFT): string[] {
    const traits: string[] = [];
    
    if (mare.genetics.baseSpeed > 85 || stallion.genetics.baseSpeed > 85) {
      traits.push("Lightning Fast");
    }
    if (mare.genetics.stamina > 85 || stallion.genetics.stamina > 85) {
      traits.push("Endurance Champion");
    }
    if (mare.genetics.agility > 85 || stallion.genetics.agility > 85) {
      traits.push("Nimble Runner");
    }
    if (mare.genetics.intelligence > 85 || stallion.genetics.intelligence > 85) {
      traits.push("Strategic Racer");
    }
    if (mare.genetics.temperament > 85 || stallion.genetics.temperament > 85) {
      traits.push("Calm Under Pressure");
    }
    
    if (mare.genetics.bloodline === stallion.genetics.bloodline) {
      traits.push("Pure Bloodline");
    } else {
      traits.push("Hybrid Vigor");
    }

    return traits;
  }

  private inheritGenetics(mare: HorseNFT, stallion: HorseNFT): any {
    return {
      baseSpeed: this.calculateInheritedStat(mare.genetics.baseSpeed, stallion.genetics.baseSpeed),
      stamina: this.calculateInheritedStat(mare.genetics.stamina, stallion.genetics.stamina),
      agility: this.calculateInheritedStat(mare.genetics.agility, stallion.genetics.agility),
      temperament: this.calculateInheritedStat(mare.genetics.temperament, stallion.genetics.temperament),
      intelligence: this.calculateInheritedStat(mare.genetics.intelligence, stallion.genetics.intelligence),
      coatColor: Math.random() < 0.6 ? mare.genetics.coatColor : stallion.genetics.coatColor,
      markings: [...new Set([...mare.genetics.markings, ...stallion.genetics.markings])].slice(0, 2),
      bloodline: this.inheritBloodline(mare.genetics.bloodline, stallion.genetics.bloodline),
      generation: Math.max(mare.genetics.generation, stallion.genetics.generation) + 1
    };
  }

  private inheritBloodline(mareBloodline: string, stallionBloodline: string): any {
    if (mareBloodline === stallionBloodline) {
      return mareBloodline;
    }
    
    // Cross-breeding creates hybrid bloodlines
    const hybrids = {
      'Arabian-Thoroughbred': 'Thoroughbred',
      'Arabian-Quarter Horse': 'Arabian',
      'Thoroughbred-Quarter Horse': 'Quarter Horse'
    };
    
    const key1 = `${mareBloodline}-${stallionBloodline}`;
    const key2 = `${stallionBloodline}-${mareBloodline}`;
    
    return hybrids[key1] || hybrids[key2] || (Math.random() < 0.5 ? mareBloodline : stallionBloodline);
  }

  private determineRarity(avgGenetic: number, mareRarity: string, stallionRarity: string): string {
    const parentRarityBonus = (this.getRarityScore(mareRarity) + this.getRarityScore(stallionRarity)) * 5;
    const totalScore = avgGenetic + parentRarityBonus;
    
    if (totalScore >= 99) return 'Legendary';
    if (totalScore >= 95) return 'Epic';
    if (totalScore >= 85) return 'Rare';
    if (totalScore >= 70) return 'Uncommon';
    return 'Common';
  }

  private createOffspring(mare: HorseNFT, stallion: HorseNFT, genetics: any, rarity: string, mutations: string[]): HorseNFT {
    const offspring: HorseNFT = {
      id: `horse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenId: `BRED-${Date.now()}`,
      name: this.generateHorseName(mare, stallion),
      genetics: {
        ...genetics,
        rarity
      },
      stats: {
        age: 12, // 1 year old
        fitness: 70 + Math.random() * 20,
        experience: 0,
        wins: 0,
        races: 0,
        earnings: 0,
        retirementAge: 96 + Math.floor(Math.random() * 48) // 8-12 years
      },
      breeding: {
        canBreed: false, // Must mature first
        breedingCooldown: 0,
        offspring: [],
        studFee: undefined,
        isPublicStud: false
      },
      training: {
        completedSessions: [],
        specializations: []
      },
      appearance: {
        model3D: `bred-horse-${Date.now()}`,
        animations: ['idle', 'run', 'gallop'],
        accessories: []
      },
      lore: {
        backstory: this.generateBackstory(mare, stallion, mutations),
        personality: this.generatePersonality(genetics),
        quirks: this.generateQuirks(genetics, mutations),
        achievements: []
      },
      owner: mare.owner,
      isForSale: false,
      isForLease: false
    };

    return offspring;
  }

  private generateHorseName(mare: HorseNFT, stallion: HorseNFT): string {
    const prefixes = ['Storm', 'Thunder', 'Lightning', 'Star', 'Moon', 'Sun', 'Fire', 'Ice', 'Wind', 'Spirit'];
    const suffixes = ['Walker', 'Runner', 'Dancer', 'Strike', 'Flash', 'Bolt', 'Dream', 'Song', 'Wing', 'Heart'];
    const mareWords = mare.name.split(' ');
    const stallionWords = stallion.name.split(' ');
    
    // 40% chance to inherit from parents, 60% generate new
    if (Math.random() < 0.4) {
      const parentWord = Math.random() < 0.5 ? mareWords[0] : stallionWords[0];
      const newWord = Math.random() < 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] : suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${parentWord} ${newWord}`;
    } else {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${prefix} ${suffix}`;
    }
  }

  private generateBackstory(mare: HorseNFT, stallion: HorseNFT, mutations: string[]): string {
    const stories = [
      `Born from the legendary union of ${mare.name} and ${stallion.name}, this foal shows exceptional promise.`,
      `A product of careful breeding between two champions, inheriting the best traits from both bloodlines.`,
      `This young horse carries the racing spirit of ${mare.name} and the power of ${stallion.name}.`,
      `Bred for greatness, this foal combines speed, stamina, and intelligence in perfect harmony.`
    ];
    
    let story = stories[Math.floor(Math.random() * stories.length)];
    
    if (mutations.length > 0) {
      story += ` Unique genetic variations have created exceptional traits that set this horse apart.`;
    }
    
    return story;
  }

  private generatePersonality(genetics: any): string {
    if (genetics.temperament > 80) return "Calm and focused, excels under pressure";
    if (genetics.intelligence > 80) return "Highly intelligent, quick to learn strategies";
    if (genetics.baseSpeed > 80) return "Eager and energetic, loves to run";
    if (genetics.stamina > 80) return "Determined and persistent, never gives up";
    return "Balanced and adaptable, ready for any challenge";
  }

  private generateQuirks(genetics: any, mutations: string[]): string[] {
    const quirks: string[] = [];
    
    if (genetics.intelligence > 85) quirks.push("Studies the track before races");
    if (genetics.temperament > 85) quirks.push("Stays calm in chaotic situations");
    if (genetics.baseSpeed > 85) quirks.push("Gets excited at the sight of a starting gate");
    if (genetics.stamina > 85) quirks.push("Enjoys long training sessions");
    if (genetics.agility > 85) quirks.push("Loves navigating obstacle courses");
    
    if (mutations.length > 0) {
      quirks.push("Has unique inherited traits from genetic variations");
    }
    
    return quirks.length > 0 ? quirks.slice(0, 2) : ["Friendly and approachable", "Enjoys being groomed"];
  }

  private analyzeInheritancePattern(mare: HorseNFT, stallion: HorseNFT, offspring: HorseNFT): string {
    const mareInfluence = Math.abs(offspring.genetics.baseSpeed - mare.genetics.baseSpeed) < Math.abs(offspring.genetics.baseSpeed - stallion.genetics.baseSpeed);
    const dominantParent = mareInfluence ? mare.name : stallion.name;
    
    return `Primary genetic influence from ${dominantParent} with balanced traits from both parents.`;
  }
}