// Professional race simulation engine with real physics
export interface RaceState {
  horses: RaceHorse[];
  distance: number;
  weather: WeatherCondition;
  trackCondition: TrackCondition;
  timeElapsed: number;
  isFinished: boolean;
  results: RaceResult[];
}

export interface RaceHorse {
  id: string;
  name: string;
  position: number;
  distanceCovered: number;
  currentSpeed: number;
  energy: number;
  maxSpeed: number;
  stamina: number;
  agility: number;
  temperament: number;
  intelligence: number;
  lane: number;
  finalTime?: number;
}

export interface RaceResult {
  position: number;
  horseId: string;
  name: string;
  time: number;
  winnings: number;
}

type WeatherCondition = 'Clear' | 'Cloudy' | 'Rainy' | 'Windy';
type TrackCondition = 'Fast' | 'Good' | 'Soft' | 'Heavy';

export class RaceEngine {
  private raceState: RaceState;
  private updateInterval: number = 33; // 33ms updates = 30fps for smoother animation
  
  // Enhanced race physics
  private readonly racePhysics = {
    maxAcceleration: 6.0,      // Increased acceleration for more dynamic races
    maxDeceleration: 8.0,      // Faster deceleration when tired
    energyRecoveryRate: 0.5,   // Slight energy recovery during strategic pacing
    temperamentVariance: 0.15, // 15% variance based on temperament
    intelligenceBonus: 0.02,   // 2% strategy bonus per intelligence point over 50
    agilityCornerBonus: 0.01   // 1% speed bonus in turns per agility point over 50
  };
  private callbacks: {
    onUpdate: (state: RaceState) => void;
    onFinish: (results: RaceResult[]) => void;
  };

  constructor(horses: any[], raceConfig: any, callbacks: any) {
    this.callbacks = callbacks;
    this.raceState = {
      horses: this.initializeHorses(horses),
      distance: raceConfig.distance,
      weather: raceConfig.conditions.weather,
      trackCondition: raceConfig.conditions.trackCondition,
      timeElapsed: 0,
      isFinished: false,
      results: []
    };
  }

  private initializeHorses(horses: any[]): RaceHorse[] {
    return horses.map((horse, index) => {
      const weatherMod = this.getWeatherModifier(this.raceState.weather);
      const trackMod = this.getTrackModifier(this.raceState.trackCondition);
      
      return {
        id: horse.id,
        name: horse.name,
        position: 0,
        distanceCovered: 0,
        currentSpeed: 0,
        energy: 100,
        maxSpeed: (horse.genetics.baseSpeed / 100) * 45 * weatherMod * trackMod, // Max 45 m/s
        stamina: horse.genetics.stamina,
        agility: horse.genetics.agility,
        temperament: horse.genetics.temperament,
        intelligence: horse.genetics.intelligence,
        lane: index
      };
    });
  }

  private getWeatherModifier(weather: WeatherCondition): number {
    switch (weather) {
      case 'Clear': return 1.0;
      case 'Cloudy': return 0.98;
      case 'Rainy': return 0.85;
      case 'Windy': return 0.92;
    }
  }

  private getTrackModifier(condition: TrackCondition): number {
    switch (condition) {
      case 'Fast': return 1.0;
      case 'Good': return 0.95;
      case 'Soft': return 0.88;
      case 'Heavy': return 0.78;
    }
  }

  public startRace(): void {
    const raceLoop = setInterval(() => {
      this.updateRace();
      
      if (this.raceState.isFinished) {
        clearInterval(raceLoop);
        this.callbacks.onFinish(this.raceState.results);
      } else {
        this.callbacks.onUpdate(this.raceState);
      }
    }, this.updateInterval);
  }

  private updateRace(): void {
    this.raceState.timeElapsed += this.updateInterval / 1000;

    // Update each horse
    this.raceState.horses.forEach(horse => {
      if (horse.distanceCovered >= this.raceState.distance) return;

      // Calculate acceleration based on horse stats and race progress
      const raceProgress = horse.distanceCovered / this.raceState.distance;
      const energyFactor = this.calculateEnergyFactor(horse, raceProgress);
      const strategicSpeed = this.calculateStrategicSpeed(horse, raceProgress);
      
      // Update speed with realistic acceleration/deceleration
      const targetSpeed = strategicSpeed * energyFactor;
      const speedDiff = targetSpeed - horse.currentSpeed;
      const maxAcceleration = 5.0; // m/s² max acceleration
      const acceleration = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), maxAcceleration * (this.updateInterval / 1000));
      
      horse.currentSpeed = Math.max(0, horse.currentSpeed + acceleration);
      
      // Update position
      horse.distanceCovered += horse.currentSpeed * (this.updateInterval / 1000);
      
      // Update energy
      const energyDrain = this.calculateEnergyDrain(horse);
      horse.energy = Math.max(0, horse.energy - energyDrain);
      
      // Check if finished
      if (horse.distanceCovered >= this.raceState.distance && !horse.finalTime) {
        horse.finalTime = this.raceState.timeElapsed;
        horse.distanceCovered = this.raceState.distance;
        horse.currentSpeed = 0;
      }
    });

    // Update positions
    this.updatePositions();
    
    // Check if race is finished
    const finishedHorses = this.raceState.horses.filter(h => h.finalTime !== undefined);
    if (finishedHorses.length === this.raceState.horses.length) {
      this.finishRace();
    }
  }

  private calculateEnergyFactor(horse: RaceHorse): number {
    // Energy affects performance exponentially
    if (horse.energy <= 0) return 0.3;
    return Math.pow(horse.energy / 100, 0.4);
  }

  private calculateStrategicSpeed(horse: RaceHorse, raceProgress: number): number {
    const intelligence = horse.intelligence / 100;
    const temperament = horse.temperament / 100;
    
    // Early race strategy (0-30%)
    if (raceProgress < 0.3) {
      // Intelligent horses pace themselves, temperamental ones go fast early
      const earlyPace = intelligence * 0.7 + (1 - temperament) * 0.5;
      return horse.maxSpeed * (0.6 + earlyPace * 0.3);
    }
    // Mid race (30-70%)
    else if (raceProgress < 0.7) {
      return horse.maxSpeed * 0.85;
    }
    // Final sprint (70-100%)
    else {
      // Final kick based on remaining energy and intelligence
      const finalKick = (horse.energy / 100) * intelligence;
      return horse.maxSpeed * (0.9 + finalKick * 0.2);
    }
  }

  private calculateEnergyDrain(horse: RaceHorse): number {
    const baseStamina = horse.stamina / 100;
    const speedFactor = horse.currentSpeed / horse.maxSpeed;
    const weatherDrain = this.raceState.weather === 'Rainy' ? 1.3 : 1.0;
    
    // Higher speeds drain more energy exponentially
    const drainRate = Math.pow(speedFactor, 1.8) * (2 - baseStamina) * weatherDrain;
    return drainRate * (this.updateInterval / 1000) * 0.8; // 0.8% per second at full speed with average stamina
  }

  private updatePositions(): void {
    // Sort by distance covered, then by current speed for ties
    const sorted = [...this.raceState.horses].sort((a, b) => {
      if (Math.abs(a.distanceCovered - b.distanceCovered) < 0.1) {
        return b.currentSpeed - a.currentSpeed;
      }
      return b.distanceCovered - a.distanceCovered;
    });

    sorted.forEach((horse, index) => {
      horse.position = index + 1;
    });
  }

  private finishRace(): void {
    const finishedHorses = this.raceState.horses
      .filter(h => h.finalTime !== undefined)
      .sort((a, b) => a.finalTime! - b.finalTime!);

    this.raceState.results = finishedHorses.map((horse, index) => ({
      position: index + 1,
      horseId: horse.id,
      name: horse.name,
      time: horse.finalTime!,
      winnings: 0 // Will be calculated by betting system
    }));

    this.raceState.isFinished = true;
  }

  public getCurrentState(): RaceState {
    return { ...this.raceState };
  }
}