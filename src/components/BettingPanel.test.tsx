import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import BettingPanel from './BettingPanel';
import { Race, HorseNFT } from '../types';

// Mock race data
const mockRace: Race = {
  id: 'race-1',
  name: 'Thunder Derby',
  type: 'Middle Distance',
  surface: 'Dirt',
  distance: 1200,
  tier: 'Amateur',
  conditions: {
    weather: 'Clear',
    temperature: 22,
    trackCondition: 'Fast',
  },
  requirements: {
    minAge: 2,
    maxAge: 10,
    minExperience: 0,
  },
  entryFee: 100,
  prizePool: 1000,
  prizeDistribution: [60, 30, 10],
  participants: [],
  maxParticipants: 8,
  registrationDeadline: Date.now() + 3600000,
  raceTime: Date.now() + 7200000,
  status: 'Registration',
};

// Mock horses data
const mockHorses: HorseNFT[] = [
  {
    id: 'horse-1',
    tokenId: 'T1',
    name: 'Swift Runner',
    genetics: {
      baseSpeed: 80,
      stamina: 70,
      agility: 75,
      temperament: 80,
      intelligence: 85,
      coatColor: 'Bay',
      markings: [],
      bloodline: 'Thoroughbred',
      rarity: 'Rare',
      generation: 1,
    },
    stats: {
      age: 36,
      fitness: 90,
      experience: 1000,
      wins: 5,
      races: 10,
      earnings: 5000,
      retirementAge: 120,
    },
    breeding: { canBreed: true, breedingCooldown: 0, offspring: [], isPublicStud: false },
    training: { completedSessions: [], specializations: [] },
    appearance: { model3D: '', animations: [], accessories: [] },
    lore: { backstory: '', personality: '', quirks: [], achievements: [] },
    owner: 'owner-1',
    isForSale: false,
    isForLease: false,
  },
];

describe('BettingPanel Performance', () => {
  it('should maintain consistent odds between re-renders', () => {
    const TestWrapper = () => {
      const [count, setCount] = useState(0);
      return (
        <div>
          <button onClick={() => setCount(count + 1)}>Re-render</button>
          <BettingPanel race={mockRace} horses={mockHorses} />
        </div>
      );
    };

    render(<TestWrapper />);

    // Get initial odds
    const oddsTextInitial = screen.getByText(/:1/i).textContent;
    console.log('Initial odds:', oddsTextInitial);

    // Force re-render
    fireEvent.click(screen.getByText('Re-render'));

    // Get odds after re-render
    const oddsTextAfter = screen.getByText(/:1/i).textContent;
    console.log('Odds after re-render:', oddsTextAfter);

    // This should fail currently because calculateOdds uses Math.random()
    expect(oddsTextInitial).toBe(oddsTextAfter);
  });
});
