import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { AIService } from './aiService';

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fail initialization if primary OpenAI key is missing and no fallbacks are provided', async () => {
    const primaryConfig = { provider: 'openai' as const };
    const service = new AIService(primaryConfig, []);

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await service.initialize();

    expect(consoleWarnSpy).toHaveBeenCalledWith('Primary AI provider failed, testing fallbacks');
    expect(consoleErrorSpy).toHaveBeenCalledWith('All AI providers failed, using fallback responses');
  });

  it('should attempt fallback if primary OpenAI key is missing', async () => {
    const primaryConfig = { provider: 'openai' as const };
    const fallbackConfig = {
      provider: 'ollama' as const,
      localModel: 'llama2'
    };

    const service = new AIService(primaryConfig, [fallbackConfig]);

    // Mock successful Ollama response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: JSON.stringify({ connected: true }) }),
    });

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await service.initialize();

    expect(consoleLogSpy).toHaveBeenCalledWith('Fallback AI provider ollama initialized');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.any(Object));
  });

  it('should throw error in callAIProvider if OpenAI key is missing', async () => {
    const service = new AIService({ provider: 'openai' as const }, []);

    // @ts-ignore - accessing private method for testing
    await expect(service.callAIProvider('test', 'test')).rejects.toThrow('OpenAI API key is missing');
  });

  it('should throw error in callAIProvider if Hugging Face key is missing', async () => {
    const service = new AIService({
      provider: 'huggingface' as const,
      modelEndpoint: 'http://test'
    }, []);

    // @ts-ignore - accessing private method for testing
    await expect(service.callAIProvider('test', 'test')).rejects.toThrow('Hugging Face API key is missing');
  });
});
