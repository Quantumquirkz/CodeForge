# ADR 0003: WhatsappBot hexagonal architecture and optional Redis

## Status

Accepted.

## Context

WhatsappBot receives webhooks from Twilio/Meta and uses an LLM (Groq) to generate responses. We need maintainability, testability, and the option to scale rate limiting and context storage across restarts and instances.

## Decision

- **Hexagonal architecture**: The core is organized around **ports** (interfaces) in the domain and **adapters** in integrations/infrastructure. The use case (ProcessIncomingMessage) depends only on LLMPort and ContextStorePort; concrete implementations (GroqClient, InMemoryContextStore, RedisRateLimiter) are wired in the application bootstrap.
- **Context store**: A ContextStorePort is injected into the use case; default implementation is InMemoryContextStore. Future Redis-backed context can be added as another adapter without changing the use case.
- **Rate limiting**: When `redis_url` is set and `redis_disabled` is false, use RedisRateLimiter (sliding window in Redis) so limits survive restarts and are shared across instances. Otherwise use InMemoryRateLimiter.

## Consequences

- Use case and domain stay free of infrastructure imports; tests can inject fakes.
- Redis is optional; the bot runs with in-memory storage when Redis is not configured.
- New adapters (e.g. another LLM provider, persistent context store) can be added by implementing the port and wiring in bootstrap.
