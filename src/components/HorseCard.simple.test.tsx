import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HorseCard from './HorseCard';
import { HorseNFT } from '../../types';

// Simple test to verify component renders without crashing
describe('HorseCard Component - Basic Test', () => {
  it('renders without crashing', () => {
    const mockHorse: HorseNFT = {
      id: 'test-horse-1',
      tokenId: 'TOKEN-1001',
      name: 'Thunder Strike',
      genetics: {
        baseSpeed: 85,
        stamina: 78,
        agility: 82,
        temperament: 75,
        intelligence: 80,
        bloodline: 'Arabian',
        coatColor: 'Bay',
        markings: ['Blaze'],
        rarity: 'Rare',
        generation: 1
      },
      stats: {
        age: 24,
        fitness: 85,
        experience: 2400,
        wins: 8,
        races: 15,
        earnings: 25000,
        retirementAge: 120
      },
      breeding: {
        canBreed: true,
        breedingCooldown: Date.now() - 86400000,
        offspring: [],
        studFee: 5000,
        isPublicStud: true
      },
      training: {
        completedSessions: [],
        specializations: ['Speed', 'Endurance']
      },
      appearance: {
        imageUrl: '/test-horse.jpg',
        description: 'A magnificent Arabian horse with exceptional speed'
      },
      owner: 'test-owner',
      price: 50000,
      forSale: false,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    };

    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    // Just check that the horse name renders
    expect(screen.getByText('Thunder Strike')).toBeInTheDocument();
  });
});

