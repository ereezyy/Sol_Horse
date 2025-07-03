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
    maxAcceleration: 7.5,      // Increased acceleration for more dynamic races
    maxDeceleration: 9.0,      // Faster deceleration when tired
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
      horses: this.initializeHorses(horses, raceConfig.conditions.weather, raceConfig.conditions.trackCondition),
      distance: raceConfig.distance,
      weather: raceConfig.conditions.weather,
      trackCondition: raceConfig.conditions.trackCondition,
      timeElapsed: 0,
      isFinished: false,
      results: []
    };
  }

  private initializeHorses(horses: any[], weather: WeatherCondition, trackCondition: TrackCondition): RaceHorse[] {
    return horses.map((horse, index) => {
      const weatherMod = this.getWeatherModifier(weather);
      const trackMod = this.getTrackModifier(trackCondition);
      
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
      case 'Stormy': return 0.80;
      case 'Drizzle': return 0.90;
      default: return 0.95;
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
      try {
        const raceProgress = horse.distanceCovered / this.raceState.distance;
        const energyFactor = this.calculateEnergyFactor(horse, raceProgress);
        const strategicSpeed = this.calculateStrategicSpeed(horse, raceProgress);
        
        // Update speed with realistic acceleration/deceleration
        const targetSpeed = strategicSpeed * energyFactor;
        const speedDiff = targetSpeed - horse.currentSpeed;
        
        // Apply max acceleration/deceleration constraints
        const maxAccel = speedDiff > 0 ? this.racePhysics.maxAcceleration : this.racePhysics.maxDeceleration;
        const acceleration = Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), maxAccel * (this.updateInterval / 1000));
        
        // Apply jockey skill and temperament variance (small random factor)
        const varianceFactor = 1 + (Math.random() - 0.5) * 0.1 * this.racePhysics.temperamentVariance;
        
        horse.currentSpeed = Math.max(0, horse.currentSpeed + acceleration * varianceFactor);
        
        // Add track condition effect - horses can slip or lose momentum
        if (this.raceState.trackCondition === 'Soft' || this.raceState.trackCondition === 'Heavy') {
          // More variance on poor track conditions
          if (Math.random() < 0.05) {
            horse.currentSpeed *= (0.85 + Math.random() * 0.1);
          }
        }
        
        // Apply weather effects - gusts of wind can slow or speed up horses
        if (this.raceState.weather === 'Windy' && Math.random() < 0.03) {
          horse.currentSpeed *= (0.9 + Math.random() * 0.2);
        }
        
        // Calculate actual distance covered with more precise physics
        horse.distanceCovered += horse.currentSpeed * (this.updateInterval / 1000);
        
        // Update energy with more realistic consumption
        const energyDrain = this.calculateEnergyDrain(horse);
        
        // Slight energy recovery for strategic pacing
        let energyChange = -energyDrain;
        if (horse.currentSpeed < horse.maxSpeed * 0.7 && horse.energy < 90) {
          energyChange += this.racePhysics.energyRecoveryRate * (this.updateInterval / 1000);
        }
        
        horse.energy = Math.max(0, Math.min(100, horse.energy + energyChange));
        
        // Check if finished
        if (horse.distanceCovered >= this.raceState.distance && !horse.finalTime) {
          horse.finalTime = this.raceState.timeElapsed;
          horse.distanceCovered = this.raceState.distance;
          horse.currentSpeed = 0;
        }
      } catch (error) {
        console.error('Error updating horse in race:', error);
        // Fallback to simple movement in case of error
        horse.distanceCovered += Math.max(1, horse.currentSpeed * (this.updateInterval / 1000));
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
    if (horse.energy <= 0) return 0.25; // Even completely exhausted horses move a little
    
    // More pronounced effect of energy on speed
    const baseFactor = Math.pow(horse.energy / 100, 0.45);
    
    // Add stamina influence - high stamina horses can maintain performance better
    const staminaBonus = (horse.stamina / 200); // Up to 0.5 bonus for max stamina
    
    return baseFactor * (1 + staminaBonus);
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
    const speedFactor = Math.pow(horse.currentSpeed / horse.maxSpeed, 2); // Exponential energy cost at high speeds
    const weatherDrain = this.getWeatherEnergyDrain();
    const trackDrain = this.getTrackEnergyDrain();
    const temperamentBonus = (horse.temperament / 200); // Up to 0.5 reduction for good temperament
    
    // Higher speeds drain more energy exponentially with more factors
    const drainRate = speedFactor * (1.8 - baseStamina) * weatherDrain * trackDrain * (1 - temperamentBonus);
    
    // Add small random factor for realism
    const varianceFactor = 0.9 + Math.random() * 0.2;
    
    return drainRate * (this.updateInterval / 1000) * 0.85 * varianceFactor;
  }
  
  private getWeatherEnergyDrain(): number {
    switch (this.raceState.weather) {
      case 'Rainy': return 1.3;
      case 'Windy': return 1.2;
      case 'Stormy': return 1.5;
      case 'Drizzle': return 1.15;
      case 'Cloudy': return 1.05;
      default: return 1.0; // Clear weather
    }
  }
  
  private getTrackEnergyDrain(): number {
    switch (this.raceState.trackCondition) {
      case 'Heavy': return 1.4;
      case 'Soft': return 1.25;
      case 'Good': return 1.1;
      default: return 1.0; // Fast track
    }
  }

  private updatePositions(): void {
    try {
      // More sophisticated positioning that considers "lengths" and racing terminology
      // Sort by distance covered, then by current speed for ties
      const sorted = [...this.raceState.horses].sort((a, b) => {
        if (Math.abs(a.distanceCovered - b.distanceCovered) < 0.1) {
          // Near ties are resolved by speed and intelligence (smarter horses position better)
          return (b.currentSpeed + b.intelligence * 0.1) - (a.currentSpeed + a.intelligence * 0.1);
        }
        return b.distanceCovered - a.distanceCovered;
      });

      sorted.forEach((horse, index) => {
        horse.position = index + 1;
      });
    } catch (error) {
      console.error('Error updating positions:', error);
      // Fallback to simple position assignment by current index
      this.raceState.horses.forEach((horse, index) => {
        horse.position = index + 1;
      });
    }
  }

  private finishRace(): void {
    const finishedHorses = this.raceState.horses
      .filter(h => h.finalTime !== undefined)
      .sort((a, b) => a.finalTime! - b.finalTime!);

    this.raceState.results = finishedHorses.map((horse, index) => ({
      position: index + 1,
      id: horse.id,
      name: horse.name,
      position: 0,
      distanceCovered: 0,
      currentSpeed: 0,
      energy: 100,
    this.raceState.isFinished = true;
  }

  public getCurrentState(): RaceState {
    return { ...this.raceState };
  }
}