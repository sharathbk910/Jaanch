import { GoogleGenAI } from '@google/genai';
import { loadEnv } from '../config/env.js';
import { logger } from './logger.js';

export interface EmbeddingProvider {
  readonly modelId: string;
  readonly dimension: number;
  generateEmbedding(text: string): Promise<number[] | null>;
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = 'text-embedding-004';
  readonly dimension = 768;
  private client: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || loadEnv().GEMINI_API_KEY;
    if (key) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.client || !text || text.trim().length === 0) {
      return null;
    }

    try {
      // AbortController 5-second timeout guard
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await this.client.models.embedContent({
          model: this.modelId,
          contents: [text.slice(0, 2048)],
        });

        clearTimeout(timeoutId);

        // Extract embedding vector from SDK response
        const values =
          (response as any).embedding?.values ||
          (response as any).embeddings?.[0]?.values ||
          null;

        if (Array.isArray(values) && values.length > 0) {
          return values;
        }

        return null;
      } catch (innerErr) {
        clearTimeout(timeoutId);
        logger.warn({ err: innerErr }, 'Gemini embedding generation failed soft');
        return null;
      }
    } catch (err) {
      logger.warn({ err }, 'Gemini embedding provider invocation error');
      return null;
    }
  }
}

export class NullEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = 'none';
  readonly dimension = 0;

  async generateEmbedding(_text: string): Promise<number[] | null> {
    return null;
  }
}

let activeProvider: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (activeProvider) return activeProvider;

  const env = loadEnv();
  if (env.GEMINI_API_KEY) {
    activeProvider = new GeminiEmbeddingProvider(env.GEMINI_API_KEY);
  } else {
    activeProvider = new NullEmbeddingProvider();
  }
  return activeProvider;
}

export function resetEmbeddingProvider(): void {
  activeProvider = null;
}

export function setEmbeddingProviderForTest(provider: EmbeddingProvider | null): void {
  activeProvider = provider;
}

/**
 * Computes cosine similarity between two equal-length float vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

