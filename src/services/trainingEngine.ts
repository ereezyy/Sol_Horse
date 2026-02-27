// Complete training engine with real progression mechanics
import { HorseNFT } from '../types';

export interface TrainingProgram {
  id: string;
  name: string;
  type: 'Speed' | 'Stamina' | 'Agility' | 'Intelligence' | 'Temperament';
  level: 1 | 2 | 3;
  duration: number; // in minutes
  cost: number;
  requirements: {
    facilityLevel: number;
    minAge: number;
    maxAge: number;
    minFitness: number;
  };
  effects: {
    statBoost: number;
    fitnessChange: number;
    successRate: number;
    experienceGain: number;
  };
  description: string;
}

export interface TrainingSession {
  id: string;
  horseId: string;
  programId: string;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'failed';
  results?: {
    success: boolean;
    statChanges: Record<string, number>;
    fitnessChange: number;
    experienceGained: number;
  };
}

export interface TrainingResult {
  success: boolean;
  statChanges: Record<string, number>;
  fitnessChange: number;
  experienceGained: number;
  message: string;
}

export class TrainingEngine {
  private programs: TrainingProgram[] = [
    // Speed Training
    {
      id: 'speed-1',
      name: 'Sprint Drills',
      type: 'Speed',
      level: 1,
      duration: 30,
      cost: 500,
      requirements: { facilityLevel: 1, minAge: 24, maxAge: 180, minFitness: 50 },
      effects: { statBoost: 2, fitnessChange: -5, successRate: 85, experienceGain: 15 },
      description: 'Basic sprint training to improve acceleration and top speed'
    },
    {
      id: 'speed-2',
      name: 'Track Work',
      type: 'Speed',
      level: 2,
      duration: 45,
      cost: 1000,
      requirements: { facilityLevel: 2, minAge: 36, maxAge: 180, minFitness: 60 },
      effects: { statBoost: 4, fitnessChange: -8, successRate: 75, experienceGain: 25 },
      description: 'Intermediate track training for sustained speed development'
    },
    {
      id: 'speed-3',
      name: 'Elite Conditioning',
      type: 'Speed',
      level: 3,
      duration: 60,
      cost: 2000,
      requirements: { facilityLevel: 3, minAge: 48, maxAge: 180, minFitness: 75 },
      effects: { statBoost: 6, fitnessChange: -12, successRate: 65, experienceGain: 40 },
      description: 'Advanced speed training for elite performance'
    },

    // Stamina Training
    {
      id: 'stamina-1',
      name: 'Distance Jogs',
      type: 'Stamina',
      level: 1,
      duration: 45,
      cost: 400,
      requirements: { facilityLevel: 1, minAge: 24, maxAge: 180, minFitness: 50 },
      effects: { statBoost: 2, fitnessChange: -3, successRate: 90, experienceGain: 15 },
      description: 'Build endurance with steady distance work'
    },
    {
      id: 'stamina-2',
      name: 'Hill Training',
      type: 'Stamina',
      level: 2,
      duration: 60,
      cost: 800,
      requirements: { facilityLevel: 2, minAge: 36, maxAge: 180, minFitness: 60 },
      effects: { statBoost: 4, fitnessChange: -6, successRate: 80, experienceGain: 25 },
      description: 'Challenging hill work to build stamina and strength'
    },
    {
      id: 'stamina-3',
      name: 'Marathon Prep',
      type: 'Stamina',
      level: 3,
      duration: 90,
      cost: 1500,
      requirements: { facilityLevel: 3, minAge: 48, maxAge: 180, minFitness: 70 },
      effects: { statBoost: 6, fitnessChange: -10, successRate: 70, experienceGain: 40 },
      description: 'Elite endurance training for long-distance racing'
    },

    // Agility Training
    {
      id: 'agility-1',
      name: 'Pole Work',
      type: 'Agility',
      level: 1,
      duration: 30,
      cost: 600,
      requirements: { facilityLevel: 1, minAge: 24, maxAge: 180, minFitness: 55 },
      effects: { statBoost: 2, fitnessChange: -4, successRate: 85, experienceGain: 15 },
      description: 'Basic agility work with poles and obstacles'
    },
    {
      id: 'agility-2',
      name: 'Course Navigation',
      type: 'Agility',
      level: 2,
      duration: 45,
      cost: 1200,
      requirements: { facilityLevel: 2, minAge: 36, maxAge: 180, minFitness: 65 },
      effects: { statBoost: 4, fitnessChange: -7, successRate: 75, experienceGain: 25 },
      description: 'Navigate complex courses to improve turning and balance'
    },
    {
      id: 'agility-3',
      name: 'Elite Maneuvering',
      type: 'Agility',
      level: 3,
      duration: 60,
      cost: 2200,
      requirements: { facilityLevel: 3, minAge: 48, maxAge: 180, minFitness: 75 },
      effects: { statBoost: 6, fitnessChange: -10, successRate: 65, experienceGain: 40 },
      description: 'Advanced agility training for precision racing'
    },

    // Intelligence Training
    {
      id: 'intelligence-1',
      name: 'Basic Commands',
      type: 'Intelligence',
      level: 1,
      duration: 20,
      cost: 300,
      requirements: { facilityLevel: 1, minAge: 18, maxAge: 240, minFitness: 40 },
      effects: { statBoost: 2, fitnessChange: 0, successRate: 95, experienceGain: 20 },
      description: 'Teach basic racing commands and signals'
    },
    {
      id: 'intelligence-2',
      name: 'Strategy Training',
      type: 'Intelligence',
      level: 2,
      duration: 40,
      cost: 700,
      requirements: { facilityLevel: 2, minAge: 36, maxAge: 240, minFitness: 50 },
      effects: { statBoost: 4, fitnessChange: 0, successRate: 85, experienceGain: 30 },
      description: 'Advanced race strategy and positioning'
    },
    {
      id: 'intelligence-3',
      name: 'Tactical Mastery',
      type: 'Intelligence',
      level: 3,
      duration: 60,
      cost: 1500,
      requirements: { facilityLevel: 3, minAge: 48, maxAge: 240, minFitness: 60 },
      effects: { statBoost: 6, fitnessChange: 0, successRate: 75, experienceGain: 50 },
      description: 'Master-level tactical racing intelligence'
    },

    // Temperament Training
    {
      id: 'temperament-1',
      name: 'Calm Training',
      type: 'Temperament',
      level: 1,
      duration: 25,
      cost: 400,
      requirements: { facilityLevel: 1, minAge: 18, maxAge: 240, minFitness: 40 },
      effects: { statBoost: 2, fitnessChange: 5, successRate: 90, experienceGain: 15 },
      description: 'Basic relaxation and stress management'
    },
    {
      id: 'temperament-2',
      name: 'Focus Work',
      type: 'Temperament',
      level: 2,
      duration: 40,
      cost: 800,
      requirements: { facilityLevel: 2, minAge: 36, maxAge: 240, minFitness: 50 },
      effects: { statBoost: 4, fitnessChange: 3, successRate: 80, experienceGain: 25 },
      description: 'Improve concentration and crowd tolerance'
    },
    {
      id: 'temperament-3',
      name: 'Mental Toughness',
      type: 'Temperament',
      level: 3,
      duration: 50,
      cost: 1200,
      requirements: { facilityLevel: 3, minAge: 48, maxAge: 240, minFitness: 60 },
      effects: { statBoost: 6, fitnessChange: 2, successRate: 70, experienceGain: 40 },
      description: 'Elite mental conditioning for high-pressure racing'
    }
  ];

  private activeSessions: Map<string, TrainingSession> = new Map();

  public getAvailablePrograms(horse: HorseNFT, facilityLevel: number): TrainingProgram[] {
    return this.programs.filter(program => {
      return (
        program.requirements.facilityLevel <= facilityLevel &&
        horse.stats.age >= program.requirements.minAge &&
        horse.stats.age <= program.requirements.maxAge &&
        horse.stats.fitness >= program.requirements.minFitness
      );
    });
  }

  public startTraining(horse: HorseNFT, programId: string, facilityLevel: number): TrainingSession | null {
    const program = this.programs.find(p => p.id === programId);
    if (!program) return null;

    // Check if horse is already training
    if (this.activeSessions.has(horse.id)) {
      return null;
    }

    // Validate requirements
    if (!this.canStartTraining(horse, program, facilityLevel)) {
      return null;
    }

    const session: TrainingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      horseId: horse.id,
      programId: program.id,
      startTime: Date.now(),
      endTime: Date.now() + (program.duration * 60 * 1000), // Convert minutes to milliseconds
      status: 'active'
    };

    this.activeSessions.set(horse.id, session);
    return session;
  }

  public completeTraining(horse: HorseNFT, sessionId: string): TrainingResult | null {
    const session = Array.from(this.activeSessions.values()).find(s => s.id === sessionId);
    if (!session || session.horseId !== horse.id) return null;

    const program = this.programs.find(p => p.id === session.programId);
    if (!program) return null;

    // Calculate success based on various factors
    const ageModifier = this.calculateAgeModifier(horse.stats.age);
    const fitnessModifier = Math.min(1.2, horse.stats.fitness / 80);
    const experienceModifier = Math.min(1.1, 1 + (horse.stats.experience / 1000) * 0.1);
    
    const finalSuccessRate = program.effects.successRate * ageModifier * fitnessModifier * experienceModifier;
    const success = Math.random() * 100 < finalSuccessRate;

    const statChanges: Record<string, number> = {};
    let fitnessChange = program.effects.fitnessChange;
    let experienceGained = program.effects.experienceGain;
    let message = '';

    if (success) {
      // Successful training
      const effectiveBoost = this.calculateEffectiveBoost(horse, program);
      statChanges[program.type.toLowerCase()] = effectiveBoost;
      
      message = `Training successful! ${program.type} increased by ${effectiveBoost} points.`;
      
      // Chance for bonus gains
      if (Math.random() < 0.15) {
        const bonusGain = Math.floor(effectiveBoost * 0.5);
        statChanges[program.type.toLowerCase()] += bonusGain;
        message += ` Exceptional performance granted bonus ${bonusGain} points!`;
      }
    } else {
      // Failed training
      statChanges[program.type.toLowerCase()] = 0;
      fitnessChange = Math.floor(fitnessChange * 0.5); // Less fitness loss on failure
      experienceGained = Math.floor(experienceGained * 0.3); // Some experience still gained
      message = `Training failed. The horse couldn't complete the program successfully.`;
    }

    // Update session with results
    session.status = success ? 'completed' : 'failed';
    session.results = {
      success,
      statChanges,
      fitnessChange,
      experienceGained
    };

    // Remove from active sessions
    this.activeSessions.delete(horse.id);

    return {
      success,
      statChanges,
      fitnessChange,
      experienceGained,
      message
    };
  }

  private canStartTraining(horse: HorseNFT, program: TrainingProgram, facilityLevel: number): boolean {
    return (
      program.requirements.facilityLevel <= facilityLevel &&
      horse.stats.age >= program.requirements.minAge &&
      horse.stats.age <= program.requirements.maxAge &&
      horse.stats.fitness >= program.requirements.minFitness
    );
  }

  private calculateAgeModifier(age: number): number {
    // Optimal training age is 2-8 years (24-96 months)
    if (age < 24) return 0.7; // Too young
    if (age <= 96) return 1.0; // Optimal age
    if (age <= 144) return 0.8; // Getting older
    return 0.6; // Old age
  }

  private calculateEffectiveBoost(horse: HorseNFT, program: TrainingProgram): number {
    const baseStat = this.getCurrentStat(horse, program.type);
    const baseBoost = program.effects.statBoost;
    
    // Diminishing returns for high stats
    if (baseStat >= 90) return Math.max(1, Math.floor(baseBoost * 0.3));
    if (baseStat >= 80) return Math.max(1, Math.floor(baseBoost * 0.6));
    if (baseStat >= 70) return Math.max(1, Math.floor(baseBoost * 0.8));
    
    return baseBoost;
  }

  private getCurrentStat(horse: HorseNFT, statType: string): number {
    switch (statType) {
      case 'Speed': return horse.genetics.baseSpeed;
      case 'Stamina': return horse.genetics.stamina;
      case 'Agility': return horse.genetics.agility;
      case 'Intelligence': return horse.genetics.intelligence;
      case 'Temperament': return horse.genetics.temperament;
      default: return 0;
    }
  }

  public getActiveSession(horseId: string): TrainingSession | undefined {
    return this.activeSessions.get(horseId);
  }

  public isTraining(horseId: string): boolean {
    const session = this.activeSessions.get(horseId);
    return session !== undefined && session.status === 'active';
  }

  public getSessionProgress(horseId: string): number {
    const session = this.activeSessions.get(horseId);
    if (!session) return 0;
    
    const now = Date.now();
    const elapsed = now - session.startTime;
    const total = session.endTime - session.startTime;
    
    return Math.min(100, (elapsed / total) * 100);
  }

  public getProgram(programId: string): TrainingProgram | undefined {
    return this.programs.find(p => p.id === programId);
  }

  public getRecommendedPrograms(horse: HorseNFT, facilityLevel: number): TrainingProgram[] {
    const available = this.getAvailablePrograms(horse, facilityLevel);
    
    // Sort by what the horse needs most
    return available.sort((a, b) => {
      const aNeeded = 100 - this.getCurrentStat(horse, a.type);
      const bNeeded = 100 - this.getCurrentStat(horse, b.type);
      return bNeeded - aNeeded;
    }).slice(0, 3);
  }
}