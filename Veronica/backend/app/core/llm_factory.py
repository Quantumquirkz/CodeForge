from abc import ABC, abstractmethod
from typing import Any, List, Optional, AsyncIterator
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from app.core.config import settings

class BaseLLMProvider(ABC):
    @abstractmethod
    def get_llm(self, model_name: str, streaming: bool = False) -> Any:
        pass

class OpenAIProvider(BaseLLMProvider):
    def get_llm(self, model_name: str, streaming: bool = False) -> ChatOpenAI:
        return ChatOpenAI(
            model=model_name,
            api_key=settings.OPENAI_API_KEY,
            streaming=streaming
        )

class AnthropicProvider(BaseLLMProvider):
    def get_llm(self, model_name: str, streaming: bool = False) -> ChatAnthropic:
        return ChatAnthropic(
            model=model_name,
            anthropic_api_key=settings.ANTHROPIC_API_KEY,
            streaming=streaming
        )

class LLMFactory:
    _providers = {
        "openai": OpenAIProvider(),
        "anthropic": AnthropicProvider()
    }

    @classmethod
    def get_llm(cls, provider: str = "openai", model: str = "gpt-4o", streaming: bool = False) -> Any:
        provider_instance = cls._providers.get(provider.lower())
        if not provider_instance:
            raise ValueError(f"Unsupported provider: {provider}")
        return provider_instance.get_llm(model, streaming=streaming)
