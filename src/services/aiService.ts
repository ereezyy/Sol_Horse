// AI Service for horse racing game
// Optimized for multiple AI providers including local models

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
}

class AIService {
  private config: AIServiceConfig;
  private fallbackProviders: AIServiceConfig[];

  constructor(primaryConfig: AIServiceConfig, fallbacks: AIServiceConfig[] = []) {
    this.config = primaryConfig;
    this.fallbackProviders = fallbacks;
  }

  // Generate unique horse backstory and personality
  async generateHorsePersonality(genetics: any): Promise<HorsePersonality> {
    try {
      return await this.callAIProvider(this.config, this.buildHorsePersonalityPrompt(genetics));
    } catch (error) {
      console.warn('Primary AI provider failed, trying fallbacks:', error);
      return await this.tryFallbackProviders(genetics);
    }
  }

  private buildHorsePersonalityPrompt(genetics: any): string {
    return `Create a unique personality and backstory for a racing horse with these genetics:
- Speed: ${genetics.baseSpeed}/100
- Stamina: ${genetics.stamina}/100
- Agility: ${genetics.agility}/100

Return JSON format:
{
  "backstory": "Brief compelling backstory (2-3 sentences)",
  "personality": "Key personality traits",
  "quirks": ["unique racing quirk 1", "behavioral quirk 2"],
  "preferredConditions": "weather/track preferences"
}`;
  }

  private async callAIProvider(config: AIServiceConfig, prompt: string): Promise<HorsePersonality> {
    switch (config.provider) {
      case 'openai':
        return await this.callOpenAI(prompt, config.apiKey!);
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

  private async callOpenAI(prompt: string, apiKey: string): Promise<HorsePersonality> {
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
            { role: 'system', content: 'You are a creative writer specializing in horse racing stories.' },
            { role: 'user', content: prompt }
          ]
        }),
      });

      const result = await response.json();
      return JSON.parse(result.choices[0].message.content);
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  private async callHuggingFace(prompt: string, apiKey: string, modelEndpoint: string): Promise<HorsePersonality> {
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
      const generatedText = result[0]?.generated_text || result.generated_text;
      return JSON.parse(generatedText);
    } catch (error) {
      throw new Error(`Hugging Face API error: ${error}`);
    }
  }

  private async callOllama(prompt: string, model: string): Promise<HorsePersonality> {
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

  private async callLocalModel(prompt: string, endpoint: string): Promise<HorsePersonality> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      return result.personality;
    } catch (error) {
      throw new Error(`Local model API error: ${error}`);
    }
  }

  private async tryFallbackProviders(genetics: any): Promise<HorsePersonality> {
    for (const fallback of this.fallbackProviders) {
      try {
        return await this.callAIProvider(fallback, this.buildHorsePersonalityPrompt(genetics));
      } catch (error) {
        console.warn(`Fallback provider ${fallback.provider} failed:`, error);
        continue;
      }
    }
    
    // Final fallback to predefined personalities
    return this.getFallbackPersonality(genetics);
  }

  // Generate dynamic race commentary
  async generateRaceCommentary(raceState: any): Promise<string> {
    // Implementation
  }

  private getFallbackPersonality(genetics: any): HorsePersonality {
    // Implementation
  }
}

// Initialize AI service with multiple provider support
const aiService = new AIService(
  // Primary provider - OpenAI for production quality
  {
    provider: 'openai',
    apiKey: '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'
  },
  // Fallback providers for cost optimization
  [
    {
      provider: 'huggingface',
      apiKey: 'your-hf-token',
      modelEndpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large'
    },
    {
      provider: 'ollama',
      localModel: 'llama2:7b'
    }
  ]
);

export default aiService;