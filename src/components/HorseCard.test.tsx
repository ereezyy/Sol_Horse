import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HorseCard from './HorseCard';
import { HorseNFT } from '../../types';

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

describe('HorseCard Component', () => {
  it('renders horse information correctly', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText('Thunder Strike')).toBeInTheDocument();
    expect(screen.getByText('Arabian')).toBeInTheDocument();
    expect(screen.getByText('Bay')).toBeInTheDocument();
  });

  it('displays horse statistics', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText('85')).toBeInTheDocument(); // Speed
    expect(screen.getByText('78')).toBeInTheDocument(); // Stamina
    expect(screen.getByText('82')).toBeInTheDocument(); // Agility
  });

  it('shows selected state correctly', () => {
    const mockOnSelect = vi.fn();
    
    const { rerender } = render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    // Test unselected state
    const card = screen.getByRole('button');
    expect(card).not.toHaveClass('ring-4');

    // Test selected state
    rerender(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );

    expect(card).toHaveClass('ring-4');
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    const card = screen.getAllByRole('button')[0]; // Get first button if multiple exist
    card.click();

    expect(mockOnSelect).toHaveBeenCalledWith('test-horse-1');
  });

  it('displays rarity badge', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText('Rare')).toBeInTheDocument();
  });

  it('shows win rate and race statistics', () => {
    const mockOnSelect = vi.fn();
    
    render(
      <HorseCard 
        horse={mockHorse} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    expect(screen.getByText('53.3%')).toBeInTheDocument(); // Win rate with decimal
    expect(screen.getByText('8')).toBeInTheDocument(); // Wins
  });
});

