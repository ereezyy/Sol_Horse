// Advanced AI Service with multiple providers and real-time capabilities
import { HorseNFT, Race, Player } from '../types';

interface AIServiceConfig {
  provider: 'openai' | 'huggingface' | 'local' | 'ollama';
  apiKey?: string;
  modelEndpoint?: string;
  localModel?: string;
}

interface HorsePersonality {
  backstory: string;
  personality: string;
  quirks: string[];
  preferredConditions: string;
  rivalries: string[];
  strengths: string[];
  weaknesses: string[];
  motivation: string;
}

interface RaceAnalysis {
  predictions: Array<{
    horseId: string;
    winProbability: number;
    expectedPosition: number;
    confidence: number;
    reasoning: string;
  }>;
  raceNarrative: string;
  keyFactors: string[];
  weatherImpact: string;
  trackAnalysis: string;
}

interface TrainingRecommendation {
  horseId: string;
  recommendedPrograms: Array<{
    programType: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    expectedGain: number;
    riskLevel: string;
  }>;
  shortTermGoals: string[];
  longTermStrategy: string;
  budgetOptimization: string;
}

interface MarketIntelligence {
  priceProjections: Array<{
    horseId: string;
    currentValue: number;
    projectedValue: number;
    timeframe: string;
    reasoning: string;
  }>;
  marketTrends: string[];
  investmentOpportunities: string[];
  riskAnalysis: string;
}

class AIService {
  private config: AIServiceConfig;
  private fallbackProviders: AIServiceConfig[];
  private cache: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  constructor(primaryConfig: AIServiceConfig, fallbacks: AIServiceConfig[] = []) {
    this.config = primaryConfig;
    this.fallbackProviders = fallbacks;
  }

  async initialize(): Promise<void> {
    try {
      // Test primary provider
      await this.testProvider(this.config);
      this.isInitialized = true;
      console.log('AI Service initialized successfully');
    } catch (error) {
      console.warn('Primary AI provider failed, testing fallbacks');
      for (const fallback of this.fallbackProviders) {
        try {
          await this.testProvider(fallback);
          this.config = fallback;
          this.isInitialized = true;
          console.log(`Fallback AI provider ${fallback.provider} initialized`);
          return;
        } catch (fallbackError) {
          console.warn(`Fallback ${fallback.provider} failed`);
        }
      }
      console.error('All AI providers failed, using fallback responses');
    }
  }

  // Generate comprehensive horse personality with AI
  async generateHorsePersonality(horse: HorseNFT): Promise<HorsePersonality> {
    const cacheKey = `personality_${horse.id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const prompt = this.buildPersonalityPrompt(horse);
      const personality = await this.callAIProvider(prompt, 'personality');
      this.cache.set(cacheKey, personality);
      return personality;
    } catch (error) {
      return this.getFallbackPersonality(horse);
    }
  }

  // AI-powered race analysis and predictions
  async analyzeRace(race: Race, horses: HorseNFT[]): Promise<RaceAnalysis> {
    const cacheKey = `race_analysis_${race.id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const prompt = this.buildRaceAnalysisPrompt(race, horses);
      const analysis = await this.callAIProvider(prompt, 'race_analysis');
      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      return this.getFallbackRaceAnalysis(race, horses);
    }
  }

  // Intelligent training recommendations
  async generateTrainingRecommendations(horse: HorseNFT, player: Player): Promise<TrainingRecommendation> {
    try {
      const prompt = this.buildTrainingPrompt(horse, player);
      return await this.callAIProvider(prompt, 'training');
    } catch (error) {
      return this.getFallbackTrainingRecommendation(horse);
    }
  }

  // Market intelligence and investment insights
  async generateMarketIntelligence(horses: HorseNFT[], marketData: any): Promise<MarketIntelligence> {
    try {
      const prompt = this.buildMarketPrompt(horses, marketData);
      return await this.callAIProvider(prompt, 'market');
    } catch (error) {
      return this.getFallbackMarketIntelligence(horses);
    }
  }

  // Dynamic race commentary generation
  async generateRaceCommentary(raceState: any, horses: HorseNFT[]): Promise<string> {
    try {
      const prompt = this.buildCommentaryPrompt(raceState, horses);
      const response = await this.callAIProvider(prompt, 'commentary');
      return response.commentary;
    } catch (error) {
      return this.getFallbackCommentary(raceState, horses);
    }
  }

  // Generate personalized quest narratives
  async generatePersonalizedQuest(player: Player): Promise<any> {
    try {
      const prompt = this.buildQuestPrompt(player);
      return await this.callAIProvider(prompt, 'quest');
    } catch (error) {
      return this.getFallbackQuest(player);
    }
  }

  // AI-powered breeding optimization
  async optimizeBreeding(mare: HorseNFT, stallions: HorseNFT[]): Promise<any> {
    try {
      const prompt = this.buildBreedingPrompt(mare, stallions);
      return await this.callAIProvider(prompt, 'breeding');
    } catch (error) {
      return this.getFallbackBreedingAdvice(mare, stallions);
    }
  }

  private async testProvider(config: AIServiceConfig): Promise<void> {
    const testPrompt = "Test connection. Respond with 'Connected' only.";
    await this.callAIProvider(testPrompt, 'test', config);
  }

  private async callAIProvider(prompt: string, type: string, configOverride?: AIServiceConfig): Promise<any> {
    const config = configOverride || this.config;
    
    switch (config.provider) {
      case 'openai':
        return await this.callOpenAI(prompt, type, config.apiKey!);
      case 'huggingface':
        return await this.callHuggingFace(prompt, config.apiKey!, config.modelEndpoint!);
      case 'ollama':
        return await this.callOllama(prompt, config.localModel!);
      case 'local':
        return await this.callLocalModel(prompt, config.modelEndpoint!);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private async callOpenAI(prompt: string, type: string, apiKey: string): Promise<any> {
    const systemPrompts = {
      personality: 'You are a creative storyteller specializing in horse racing narratives. Return detailed JSON with backstory, personality traits, quirks, and racing preferences.',
      race_analysis: 'You are a professional horse racing analyst. Provide detailed race predictions with probabilities and strategic insights in JSON format.',
      training: 'You are an expert horse trainer. Provide specific training recommendations with priorities and expected outcomes in JSON format.',
      market: 'You are a market analyst for NFT gaming assets. Provide market intelligence and investment insights in JSON format.',
      commentary: 'You are an energetic race commentator. Generate exciting, real-time race commentary.',
      quest: 'You are a quest designer. Create engaging, personalized gaming objectives.',
      breeding: 'You are a genetics expert. Provide breeding optimization advice.',
      test: 'You are a test system.'
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompts[type] || systemPrompts.test },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      if (type === 'commentary' || type === 'test') {
        return { commentary: content };
      }
      
      try {
        return JSON.parse(content);
      } catch {
        return { raw: content };
      }
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  private async callHuggingFace(prompt: string, apiKey: string, modelEndpoint: string): Promise<any> {
    // Hugging Face implementation
    try {
      const response = await fetch(modelEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      });

      const result = await response.json();
      return { raw: result[0]?.generated_text || result.generated_text };
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error}`);
    }
  }

  private async callOllama(prompt: string, model: string): Promise<any> {
    // Ollama local model implementation
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          format: 'json'
        }),
      });

      const result = await response.json();
      return JSON.parse(result.response);
    } catch (error) {
      throw new Error(`Ollama API error: ${error}`);
    }
  }

  private async callLocalModel(prompt: string, endpoint: string): Promise<any> {
    // Local model implementation
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Local model API error: ${error}`);
    }
  }

  // Prompt builders
  private buildPersonalityPrompt(horse: HorseNFT): string {
    return `Create a compelling personality for this racing horse:
    
Name: ${horse.name}
Bloodline: ${horse.genetics.bloodline}
Rarity: ${horse.genetics.rarity}
Stats: Speed ${horse.genetics.baseSpeed}, Stamina ${horse.genetics.stamina}, Agility ${horse.genetics.agility}
Record: ${horse.stats.wins} wins in ${horse.stats.races} races
Age: ${Math.floor(horse.stats.age / 12)} years old

Return JSON:
{
  "backstory": "Compelling 2-3 sentence origin story",
  "personality": "Core personality traits and racing style",
  "quirks": ["unique behavior 1", "racing habit 2", "training preference 3"],
  "preferredConditions": "Optimal weather/track conditions",
  "rivalries": ["potential rival characteristics"],
  "strengths": ["racing strengths based on stats"],
  "weaknesses": ["areas for improvement"],
  "motivation": "What drives this horse to race"
}`;
  }

  private buildRaceAnalysisPrompt(race: Race, horses: HorseNFT[]): string {
    const horseData = horses.map(h => ({
      name: h.name,
      bloodline: h.genetics.bloodline,
      stats: {
        speed: h.genetics.baseSpeed,
        stamina: h.genetics.stamina,
        agility: h.genetics.agility
      },
      record: `${h.stats.wins}W/${h.stats.races}R`,
      winRate: h.stats.races > 0 ? (h.stats.wins / h.stats.races * 100).toFixed(1) : '0'
    }));

    return `Analyze this horse race and provide predictions:

Race: ${race.name}
Distance: ${race.distance}m
Surface: ${race.surface}
Weather: ${race.conditions.weather}
Track: ${race.conditions.trackCondition}

Horses: ${JSON.stringify(horseData, null, 2)}

Provide detailed analysis in JSON format with win probabilities, position predictions, and strategic insights.`;
  }

  private buildTrainingPrompt(horse: HorseNFT, player: Player): string {
    return `Optimize training for this horse:

Horse: ${horse.name}
Current Stats: Speed ${horse.genetics.baseSpeed}, Stamina ${horse.genetics.stamina}, Agility ${horse.genetics.agility}
Performance: ${horse.stats.wins}W/${horse.stats.races}R
Budget: ${player.assets.turfBalance} $TURF
Facilities: Level ${player.assets.facilities[0]?.level || 1}

Recommend training programs with priorities, expected gains, and budget optimization.`;
  }

  private buildMarketPrompt(horses: HorseNFT[], marketData: any): string {
    return `Analyze the horse NFT market:

Available Horses: ${horses.length}
Average Price: ${marketData.avgPrice}
Market Volume: ${marketData.totalVolume}

Provide market intelligence including price projections, trends, and investment opportunities.`;
  }

  private buildCommentaryPrompt(raceState: any, horses: HorseNFT[]): string {
    const positions = raceState.horses.map(h => {
      const horse = horses.find(horse => horse.id === h.id);
      return `${horse?.name}: Position ${h.position}, ${h.distanceCovered.toFixed(1)}m covered`;
    }).join(', ');

    return `Generate exciting race commentary for this moment:
Time: ${raceState.timeElapsed.toFixed(1)}s
Race Progress: ${(raceState.horses[0]?.distanceCovered / raceState.distance * 100).toFixed(1)}%
Positions: ${positions}

Create 1-2 sentences of dynamic, energetic commentary.`;
  }

  private buildQuestPrompt(player: Player): string {
    return `Create a personalized quest for this player:
Level: ${player.stats.reputation}
Horses: ${player.assets.horses.length}
Wins: ${player.stats.wins}
Specialization: Based on their racing patterns

Design an engaging quest with story, objectives, and meaningful rewards.`;
  }

  private buildBreedingPrompt(mare: HorseNFT, stallions: HorseNFT[]): string {
    return `Optimize breeding selection:
Mare: ${mare.name} (${mare.genetics.rarity})
Stats: ${mare.genetics.baseSpeed}/${mare.genetics.stamina}/${mare.genetics.agility}

Available Stallions: ${stallions.map(s => 
      `${s.name} (${s.genetics.rarity}) - ${s.genetics.baseSpeed}/${s.genetics.stamina}/${s.genetics.agility}`
    ).join(', ')}

Recommend the best stallion match with genetic analysis and expected offspring quality.`;
  }

  // Fallback implementations for when AI providers are unavailable
  private getFallbackPersonality(horse: HorseNFT): HorsePersonality {
    const personalities = [
      "Fierce and competitive, never backing down from a challenge",
      "Calm and strategic, calculating every move on the track",
      "Energetic and spirited, bringing excitement to every race",
      "Intelligent and adaptable, learning from each experience",
      "Bold and fearless, taking risks others wouldn't dare"
    ];

    const quirks = [
      ["Loves thunderstorms", "Gets excited by crowd cheers"],
      ["Prefers morning races", "Always hungry after competing"],
      ["Responds to music", "Has a lucky pre-race ritual"],
      ["Enjoys cooler weather", "Forms strong bonds with jockeys"],
      ["Competitive with other horses", "Loves speed training"]
    ];

    return {
      backstory: `${horse.name} emerged from the ${horse.genetics.bloodline} lineage with exceptional ${horse.genetics.rarity.toLowerCase()} genetics. This remarkable horse has shown tremendous potential since birth.`,
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      quirks: quirks[Math.floor(Math.random() * quirks.length)],
      preferredConditions: `Performs best in ${['clear', 'cloudy', 'cool'][Math.floor(Math.random() * 3)]} weather on ${horse.genetics.baseSpeed > 80 ? 'fast' : 'good'} tracks`,
      rivalries: [`Other ${horse.genetics.bloodline} horses`, "Speed-focused competitors"],
      strengths: [`Exceptional ${horse.genetics.baseSpeed > horse.genetics.stamina ? 'speed' : 'endurance'}`],
      weaknesses: [`Could improve ${horse.genetics.baseSpeed < horse.genetics.stamina ? 'acceleration' : 'stamina'}`],
      motivation: "Driven by the thrill of competition and the roar of the crowd"
    };
  }

  private getFallbackRaceAnalysis(race: Race, horses: HorseNFT[]): RaceAnalysis {
    const predictions = horses.map((horse, index) => {
      const baseProb = 100 / horses.length;
      const statBonus = (horse.genetics.baseSpeed + horse.genetics.stamina + horse.genetics.agility) / 300 * 50;
      const recordBonus = horse.stats.races > 0 ? (horse.stats.wins / horse.stats.races) * 30 : 0;
      
      return {
        horseId: horse.id,
        winProbability: Math.min(85, Math.max(5, baseProb + statBonus + recordBonus)),
        expectedPosition: index + 1,
        confidence: 75 + Math.random() * 20,
        reasoning: `Strong ${horse.genetics.baseSpeed > 80 ? 'speed' : 'endurance'} stats favor this ${race.distance > 2000 ? 'distance' : 'sprint'}`
      };
    }).sort((a, b) => b.winProbability - a.winProbability);

    return {
      predictions,
      raceNarrative: `This ${race.distance}m ${race.surface.toLowerCase()} race promises exciting competition with ${horses.length} talented horses.`,
      keyFactors: [`${race.surface} surface favors certain bloodlines`, `${race.conditions.weather} conditions impact performance`],
      weatherImpact: `${race.conditions.weather} weather expected to ${['boost', 'challenge', 'test'][Math.floor(Math.random() * 3)]} performance`,
      trackAnalysis: `${race.conditions.trackCondition} track conditions favor ${race.conditions.trackCondition === 'Fast' ? 'speed-focused' : 'stamina-heavy'} horses`
    };
  }

  private getFallbackTrainingRecommendation(horse: HorseNFT): TrainingRecommendation {
    const stats = [
      { name: 'Speed', value: horse.genetics.baseSpeed },
      { name: 'Stamina', value: horse.genetics.stamina },
      { name: 'Agility', value: horse.genetics.agility }
    ].sort((a, b) => a.value - b.value);

    return {
      horseId: horse.id,
      recommendedPrograms: [
        {
          programType: stats[0].name,
          priority: 'high',
          reasoning: `Lowest stat needs immediate attention`,
          expectedGain: 3,
          riskLevel: 'low'
        },
        {
          programType: stats[1].name,
          priority: 'medium',
          reasoning: `Secondary improvement area`,
          expectedGain: 2,
          riskLevel: 'medium'
        }
      ],
      shortTermGoals: [`Improve ${stats[0].name} to 70+`, "Maintain fitness above 80%"],
      longTermStrategy: `Focus on ${stats[2].name} specialization for competitive advantage`,
      budgetOptimization: "Start with basic programs to build foundation before advanced training"
    };
  }

  private getFallbackMarketIntelligence(horses: HorseNFT[]): MarketIntelligence {
    return {
      priceProjections: horses.slice(0, 3).map(horse => ({
        horseId: horse.id,
        currentValue: horse.price || 50000,
        projectedValue: (horse.price || 50000) * (1 + (Math.random() - 0.5) * 0.4),
        timeframe: "30 days",
        reasoning: `Based on ${horse.genetics.rarity} rarity and performance history`
      })),
      marketTrends: ["Legendary horses showing strong appreciation", "Sprint specialists in high demand"],
      investmentOpportunities: ["Young horses with high potential", "Undervalued breeding pairs"],
      riskAnalysis: "Market volatility expected due to upcoming tournament season"
    };
  }

  private getFallbackCommentary(raceState: any, horses: HorseNFT[]): string {
    const leader = raceState.horses[0];
    const leaderHorse = horses.find(h => h.id === leader.id);
    const progress = (leader.distanceCovered / raceState.distance * 100).toFixed(0);
    
    const commentaries = [
      `${leaderHorse?.name} takes the lead as we're ${progress}% through the race!`,
      `What a performance from ${leaderHorse?.name} setting the pace early!`,
      `${leaderHorse?.name} showing why they're a champion, pulling ahead of the field!`,
      `Incredible speed from ${leaderHorse?.name} as they dominate this race!`
    ];
    
    return commentaries[Math.floor(Math.random() * commentaries.length)];
  }

  private getFallbackQuest(player: Player): any {
    return {
      id: `quest_${Date.now()}`,
      title: "Rising Champion",
      description: "Prove your skills by winning races and improving your reputation",
      objectives: [
        { task: "Win 3 races", reward: "5000 $TURF", completed: false },
        { task: "Train a horse to 80+ stats", reward: "Training boost", completed: false }
      ],
      narrative: "The racing community is watching. Show them what you're made of!",
      timeLimit: 7 // days
    };
  }

  private getFallbackBreedingAdvice(mare: HorseNFT, stallions: HorseNFT[]): any {
    const bestStallion = stallions.reduce((best, current) => {
      const bestScore = (best.genetics.baseSpeed + best.genetics.stamina + best.genetics.agility) / 3;
      const currentScore = (current.genetics.baseSpeed + current.genetics.stamina + current.genetics.agility) / 3;
      return currentScore > bestScore ? current : best;
    });

    return {
      recommendedStallion: bestStallion.id,
      reasoning: "Highest overall genetic potential for superior offspring",
      projectedOffspring: {
        speed: Math.round((mare.genetics.baseSpeed + bestStallion.genetics.baseSpeed) / 2),
        stamina: Math.round((mare.genetics.stamina + bestStallion.genetics.stamina) / 2),
        agility: Math.round((mare.genetics.agility + bestStallion.genetics.agility) / 2)
      },
      successProbability: 85,
      estimatedValue: "High market value expected due to genetic combination"
    };
  }
}

// Initialize AI service with multiple providers for redundancy
const aiService = new AIService(
  {
    provider: 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key'
  },
  [
    {
      provider: 'huggingface',
      apiKey: import.meta.env.VITE_HF_API_KEY,
      modelEndpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large'
    },
    {
      provider: 'ollama',
      localModel: 'llama2:7b'
    }
  ]
);

export default aiService;
export { AIService, type HorsePersonality, type RaceAnalysis, type TrainingRecommendation, type MarketIntelligence };