import { ChainType } from '@/chainFactory';
import { ChatPromptTemplate } from "langchain/prompts";

export interface ModelConfig {
  modelName: string,
  temperature: number,
  streaming: boolean,
  maxRetries: number,
  maxConcurrency: number,
  maxTokens?: number,
  openAIApiKey?: string,
  anthropicApiKey?: string,
  azureOpenAIApiKey?: string,
  azureOpenAIApiInstanceName?: string,
  azureOpenAIApiDeploymentName?: string,
  azureOpenAIApiVersion?: string,
  // Google and TogetherAI API key share this property
  apiKey?: string,
  openAIProxyBaseUrl?: string,
  ollamaModel?: string,
  openRouterModel?: string,
  lmStudioPort?: string,
}

export interface LangChainParams {
  openAIApiKey: string,
  huggingfaceApiKey: string,
  cohereApiKey: string,
  anthropicApiKey: string,
  azureOpenAIApiKey: string,
  azureOpenAIApiInstanceName: string,
  azureOpenAIApiDeploymentName: string,
  azureOpenAIApiVersion: string,
  azureOpenAIApiEmbeddingDeploymentName: string,
  googleApiKey: string,
  openRouterAiApiKey: string,
  model: string,
  modelDisplayName: string,
  temperature: number,
  maxTokens: number,
  systemMessage: string,
  chatContextTurns: number,
  embeddingProvider: string,
  chainType: ChainType,  // Default ChainType is set in main.ts getAIStateParams
  options: SetChainOptions,
  ollamaModel: string,
  openRouterModel: string,
  lmStudioPort: string,
  openAIProxyBaseUrl?: string,
}

export interface SetChainOptions {
  prompt?: ChatPromptTemplate;
  noteContent?: string;
  forceNewCreation?: boolean;
}