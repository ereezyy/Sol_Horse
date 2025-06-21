# Sol Horse - AI-Powered Solana Horse Racing Game

<div align="center">

![Sol Horse Banner](sol_horse_banner.png)

![Sol Horse Logo](sol_horse_logo.png)

[![Made by ereezyy](https://img.shields.io/badge/Made%20by-ereezyy-blue?style=for-the-badge&logo=github)](https://github.com/ereezyy)
[![TypeScript](https://img.shields.io/badge/TypeScript-React-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Blockchain](https://img.shields.io/badge/Blockchain-Solana-gold?style=for-the-badge&logo=solana)](https://solana.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**🏇 NFT Horse Racing • 🎮 Blockchain Gaming • 🤖 AI-Powered • ⚡ Solana Network**

</div>

---

## 🏇 Overview

Sol Horse is an innovative blockchain-based horse racing game built on the Solana network. This decentralized application combines the excitement of horse racing with cutting-edge AI technology and NFT ownership, creating an immersive gaming experience where players can own, breed, train, and race virtual horses.

## ✨ Features

### 🐎 Horse NFTs
- **Unique Genetics**: Each horse has distinct attributes including speed, stamina, agility, temperament, and intelligence
- **Bloodlines**: Multiple bloodlines including Arabian, Thoroughbred, Quarter Horse, Mustang, and Legendary
- **Rarity System**: Common, Uncommon, Rare, Epic, and Legendary horses with varying capabilities
- **Visual Customization**: Different coat colors, markings, and visual traits

### 🏁 Racing System
- **Real-time Racing**: Experience thrilling races with dynamic outcomes based on horse genetics and AI
- **Betting Mechanics**: Place bets on races and earn rewards
- **Tournament System**: Participate in competitive tournaments with prize pools
- **Race Analytics**: Detailed performance tracking and statistics

### 🧬 Breeding & Training
- **Genetic Breeding**: Combine horses to create offspring with inherited traits
- **Training Centers**: Improve your horses' abilities through specialized training programs
- **Bloodline Management**: Strategic breeding to develop superior racing lineages

### 🎮 Gameplay Features
- **Daily Quests**: Complete challenges to earn rewards and experience
- **Player Profiles**: Track your achievements, statistics, and horse collection
- **Wallet Integration**: Seamless Solana wallet connectivity for NFT management
- **Analytics Dashboard**: Comprehensive insights into your racing performance

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Animation**: Framer Motion for smooth UI transitions
- **Blockchain**: Solana Web3.js for blockchain integration
- **Wallet**: Solana Wallet Adapter for multi-wallet support
- **State Management**: Zustand for efficient state handling
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React for consistent iconography

## 🚀 Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ereezyy/Sol_Horse.git
   cd Sol_Horse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Project Structure

```
Sol_Horse/
├── src/
│   ├── components/          # React components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── BettingPanel.tsx
│   │   ├── BreedingCenter.tsx
│   │   ├── DailyQuests.tsx
│   │   ├── HorseCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── PlayerProfile.tsx
│   │   ├── RaceTrack.tsx
│   │   ├── TournamentCenter.tsx
│   │   ├── TrainingCenter.tsx
│   │   └── WalletConnection.tsx
│   ├── services/           # API and blockchain services
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # Vite environment types
├── docs/                  # Documentation
├── public/                # Static assets
├── .bolt/                 # Bolt configuration
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🎯 Game Mechanics

### Horse Attributes

Each horse NFT contains the following genetic attributes that determine racing performance:

| Attribute | Description | Impact |
|-----------|-------------|---------|
| **Speed** | Base running velocity | Primary factor in race times |
| **Stamina** | Endurance over distance | Affects performance in longer races |
| **Agility** | Cornering and maneuvering ability | Important for complex track layouts |
| **Temperament** | Consistency and reliability | Reduces performance variance |
| **Intelligence** | Learning and adaptation | Improves with training and experience |

### Breeding System

The breeding system allows players to combine two horses to create offspring with inherited traits:

- **Genetic Inheritance**: Offspring inherit attributes from both parents with some randomization
- **Bloodline Preservation**: Certain bloodlines have higher chances of producing superior horses
- **Rarity Enhancement**: Breeding rare horses increases chances of legendary offspring
- **Cooldown Periods**: Horses require rest between breeding sessions

### Racing Dynamics

Races are determined by a combination of factors:

- **Horse Genetics**: Base attributes provide the foundation for performance
- **Track Conditions**: Different tracks favor different horse types
- **Weather Effects**: Environmental conditions impact race outcomes
- **Jockey Skills**: AI-driven jockey performance adds strategic depth
- **Training History**: Well-trained horses perform better over time

## 🔗 Solana Integration

### Wallet Connection

The application supports multiple Solana wallets through the Wallet Adapter:
- Phantom
- Solflare
- Slope
- Sollet
- And many more...

### NFT Management

- **Minting**: Create new horse NFTs through breeding or purchasing
- **Trading**: Buy and sell horses on integrated marketplaces
- **Metadata**: Rich metadata stored on-chain for each horse
- **Ownership**: Transparent ownership verification through blockchain

### Token Economics

- **SOL Integration**: Primary currency for transactions and betting
- **Reward Distribution**: Winners receive SOL rewards from race pools
- **Breeding Costs**: Breeding requires SOL payment for genetic combination
- **Training Fees**: Improving horses requires investment in training programs

## 🎨 User Interface

The application features a modern, responsive design with:

- **Dark Theme**: Sleek dark interface optimized for gaming
- **Smooth Animations**: Framer Motion provides fluid transitions
- **Mobile Responsive**: Fully functional on desktop and mobile devices
- **Intuitive Navigation**: Easy-to-use interface for all game features
- **Real-time Updates**: Live data updates for races and statistics

## 🔧 Development

### Code Quality

The project maintains high code quality through:

- **TypeScript**: Strong typing for better development experience
- **ESLint**: Automated code linting and formatting
- **Component Architecture**: Modular, reusable React components
- **State Management**: Centralized state with Zustand
- **Error Handling**: Comprehensive error handling and user feedback

### Performance Optimization

- **Vite Build System**: Fast development and optimized production builds
- **Code Splitting**: Lazy loading for improved performance
- **Asset Optimization**: Optimized images and resources
- **Caching Strategies**: Efficient data caching for better UX

## 🤝 Contributing

We welcome contributions to Sol Horse! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting with ESLint
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/) for detailed guides
2. Search existing [issues](https://github.com/ereezyy/Sol_Horse/issues)
3. Create a new issue with detailed information
4. Join our community discussions

## 🚀 Roadmap

### Phase 1: Core Features ✅
- Basic horse NFT system
- Racing mechanics
- Wallet integration
- User interface

### Phase 2: Enhanced Gameplay 🚧
- Advanced breeding system
- Tournament competitions
- Daily quests and rewards
- Analytics dashboard

### Phase 3: Community Features 📋
- Multiplayer tournaments
- Guild system
- Marketplace integration
- Social features

### Phase 4: Advanced AI 🔮
- Machine learning race predictions
- Dynamic difficulty adjustment
- Personalized training recommendations
- Advanced genetic algorithms

## 🏆 Achievements

Track your progress with various achievements:

- **First Race**: Complete your first race
- **Breeding Master**: Successfully breed 10 horses
- **Tournament Champion**: Win a tournament
- **Collector**: Own horses from all bloodlines
- **Trainer**: Max out a horse's training
- **Lucky Bettor**: Win 100 bets

---

**Built with ❤️ on Solana**

*Experience the future of horse racing gaming with Sol Horse - where blockchain meets the track!*

