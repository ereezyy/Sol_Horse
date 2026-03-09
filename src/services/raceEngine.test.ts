import { describe, it, expect } from 'vitest';
import { RaceEngine, RaceHorse } from './raceEngine';

describe('RaceEngine', () => {
  const mockHorses = [
    {
      id: '1',
      name: 'Test Horse',
      genetics: { baseSpeed: 50, stamina: 50, agility: 50, temperament: 50, intelligence: 50 }
    }
  ];
  const mockConfig = {
    distance: 1000,
    conditions: { weather: 'Clear', trackCondition: 'Fast' }
  };
  const mockCallbacks = {
    onUpdate: () => {},
    onFinish: () => {}
  };

  const engine = new RaceEngine(mockHorses, mockConfig, mockCallbacks);

  describe('calculateEnergyFactor', () => {
    it('returns 0.25 when energy is 0 or less', () => {
      const horse = { energy: 0, stamina: 100 } as RaceHorse;
      expect(engine.calculateEnergyFactor(horse)).toBe(0.25);

      const exhaustedHorse = { energy: -10, stamina: 100 } as RaceHorse;
      expect(engine.calculateEnergyFactor(exhaustedHorse)).toBe(0.25);
    });

    it('returns 1.0 when energy is 100 and stamina is 0', () => {
      const horse = { energy: 100, stamina: 0 } as RaceHorse;
      // baseFactor = Math.pow(100/100, 0.45) = 1
      // staminaBonus = 0 / 200 = 0
      // result = 1 * (1 + 0) = 1
      expect(engine.calculateEnergyFactor(horse)).toBe(1.0);
    });

    it('returns 1.5 when energy is 100 and stamina is 100', () => {
      const horse = { energy: 100, stamina: 100 } as RaceHorse;
      // baseFactor = 1
      // staminaBonus = 100 / 200 = 0.5
      // result = 1 * (1 + 0.5) = 1.5
      expect(engine.calculateEnergyFactor(horse)).toBe(1.5);
    });

    it('calculates factor correctly for mid-range values', () => {
      const horse = { energy: 50, stamina: 50 } as RaceHorse;
      const baseFactor = Math.pow(50 / 100, 0.45);
      const staminaBonus = 50 / 200;
      const expected = baseFactor * (1 + staminaBonus);
      expect(engine.calculateEnergyFactor(horse)).toBeCloseTo(expected, 5);
    });
  });
});
