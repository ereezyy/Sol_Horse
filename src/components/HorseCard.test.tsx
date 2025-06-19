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
    rarity: 'Rare'
  },
  stats: {
    races: 15,
    wins: 8,
    places: 4,
    shows: 2,
    earnings: 25000,
    winRate: 53.33,
    avgFinishPosition: 2.1,
    bestTime: 118.5,
    consistency: 78
  },
  breeding: {
    breedCount: 2,
    maxBreeds: 5,
    lastBreedTime: Date.now() - 86400000,
    cooldownPeriod: 604800000,
    fertility: 85,
    offspringCount: 2
  },
  training: {
    level: 12,
    experience: 2400,
    nextLevelExp: 3000,
    skillPoints: 8,
    specializations: ['Speed', 'Endurance'],
    lastTrainingTime: Date.now() - 43200000,
    trainingCooldown: 86400000
  },
  owner: 'test-owner',
  price: 50000,
  forSale: false,
  imageUrl: '/test-horse.jpg',
  metadata: {
    description: 'A magnificent Arabian horse with exceptional speed',
    attributes: [],
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

    const card = screen.getByRole('button');
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

    expect(screen.getByText('53%')).toBeInTheDocument(); // Win rate
    expect(screen.getByText('8/15')).toBeInTheDocument(); // Wins/Races
  });
});

