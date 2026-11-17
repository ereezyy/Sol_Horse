import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Grandfathered files: pre-existing code not in this PR's scope.
  // Rules were previously disabled globally; these files retain exceptions
  // so they can be fixed incrementally without blocking the PR.
  {
    files: [
      'src/components/AIAssistant.tsx',
      'src/components/AchievementSystem.tsx',
      'src/components/AnalyticsDashboard.tsx',
      'src/components/BreedingCenter.tsx',
      'src/components/DailyCheckIn.tsx',
      'src/components/DailyQuests.tsx',
      'src/components/DailyRewardPopup.tsx',
      'src/components/DailyRewards.tsx',
      'src/components/GuildSystem.tsx',
      'src/components/HorseCard.test.tsx',
      'src/components/HorseCard.tsx',
      'src/components/Navigation.tsx',
      'src/components/PlayerProfile.tsx',
      'src/components/PredictiveAnalytics.tsx',
      'src/components/SeasonalEvents.tsx',
      'src/components/SolanaProvider.tsx',
      'src/components/SolanaWalletConnection.tsx',
      'src/components/TournamentCenter.tsx',
      'src/components/TournamentSystem.tsx',
      'src/components/TrainingCenter.tsx',
      'src/components/WelcomeScreen.tsx',
      'src/services/aiService.ts',
      'src/services/breedingEngine.ts',
      'src/services/horseService.ts',
      'src/services/playerService.ts',
      'src/services/solanaService.ts',
      'src/services/tournamentService.ts',
      'src/services/trainingEngine.ts',
      'src/test/setup.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'prefer-const': 'off',
    },
  }
);
