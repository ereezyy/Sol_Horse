import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarketplaceItem from './MarketplaceItem';
import { HorseNFT, MarketplaceListing } from '../types';

describe('MarketplaceItem', () => {
  const mockHorse: HorseNFT = {
    id: 'horse-1',
    tokenId: '1',
    name: 'Thunderbolt',
    genetics: {
      baseSpeed: 80,
      stamina: 75,
      agility: 85,
      temperament: 70,
      intelligence: 65,
      coatColor: 'Bay',
      markings: ['Star'],
      bloodline: 'Thoroughbred',
      rarity: 'Rare',
      generation: 1
    },
    stats: {
      age: 48,
      fitness: 100,
      experience: 500,
      wins: 10,
      races: 20,
      earnings: 50000,
      retirementAge: 240
    },
    breeding: {
      canBreed: true,
      breedingCooldown: 0,
      offspring: [],
      isPublicStud: false
    },
    training: {
      completedSessions: [],
      specializations: []
    },
    appearance: {
      model3D: 'url',
      animations: [],
      accessories: []
    },
    lore: {
      backstory: 'A fast horse',
      personality: 'Fiery',
      quirks: [],
      achievements: []
    },
    owner: 'owner-1',
    isForSale: true,
    price: 10000,
    isForLease: false
  };

  const mockListing: MarketplaceListing = {
    id: 'listing-1',
    type: 'Horse',
    itemId: 'horse-1',
    sellerId: 'owner-1',
    price: 10000,
    currency: 'TURF',
    negotiable: false,
    title: 'Thunderbolt',
    description: 'A fast horse',
    images: [],
    listedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    status: 'Active',
    views: 100,
    watchers: ['user-1']
  };

  it('renders correctly in grid mode', () => {
    const onBuy = vi.fn();
    render(
      <MarketplaceItem
        listing={mockListing}
        horse={mockHorse}
        viewMode="grid"
        onBuy={onBuy}
        isGuest={false}
      />
    );

    expect(screen.getByText('Thunderbolt')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument(); // Win rate
  });

  it('renders correctly in list mode', () => {
    const onBuy = vi.fn();
    render(
      <MarketplaceItem
        listing={mockListing}
        horse={mockHorse}
        viewMode="list"
        onBuy={onBuy}
        isGuest={false}
      />
    );

    expect(screen.getByText('Thunderbolt')).toBeInTheDocument();
    expect(screen.getByText(/10W\/20R/)).toBeInTheDocument();
  });

  it('calls onBuy when buy button is clicked', () => {
    const onBuy = vi.fn();
    render(
      <MarketplaceItem
        listing={mockListing}
        horse={mockHorse}
        viewMode="grid"
        onBuy={onBuy}
        isGuest={false}
      />
    );

    const buyButton = screen.getByText('Buy Now');
    fireEvent.click(buyButton);
    expect(onBuy).toHaveBeenCalledWith(mockListing);
  });
});
