# Veronica - Project Roadmap & Status

This document tracks the development progress and future roadmap of Veronica.

## 1. Project Configuration & Environment
The initial setup of the project involved creating a well-organized directory structure and essential base files to ensure a solid foundation. A virtual environment was established to manage dependencies efficiently, with all required packages listed in the `requirements.txt` file. An `.env.example` file was created to outline the key environment variables necessary for the project's configuration. Docker Compose was implemented to facilitate the deployment of auxiliary services such as ChromaDB, ensuring that these services can be easily managed and scaled. The main script (`main.py`) was developed using FastAPI to provide a robust starting point for the application.
- [x] Base structure and FastAPI setup.
- [x] Dockerization and environment config.

## 2. Real-time Communication (WebSockets)
The implementation of WebSocket endpoints enables seamless real-time communication for text messages. This includes handling connection and disconnection events as well as managing message flow effectively. The integration with the main agent ensures that messages are processed and responses are delivered in real-time, providing a responsive and interactive user experience.
- [x] WebSocket integration for text.

## 3. LLM Integration (Multiple Providers)
The project currently supports configuration for multiple language model providers, including OpenAI and Anthropic. An abstract class for LLM providers is planned to enhance flexibility and maintainability. API key configuration and model selection are already in place, with basic error handling and retries implemented to ensure reliability. Response streaming is currently implemented as full-message delivery, with plans to enhance this feature for more efficient data transmission.
- [x] OpenAI & Anthropic support.
- [x] Abstract provider class (Refactoring).
- [x] Response streaming.

## 4. Autonomous Agent with LangChain
An autonomous agent has been created using LangChain, equipped with essential tools such as lights control and email simulation. The agent's personality is defined through a sophisticated prompt system, and conversation handling with memory ensures context-aware interactions. The base structure for integration with the main agent exists, with further enhancements planned for specialized agent definitions and task creation.
- [x] Agent logic and core tools.
- [x] Personality prompting.

## 5. Orchestration with CrewAI (Multi-agent Tasks)
The project includes a base structure for integrating CrewAI to manage multi-agent tasks. This involves defining specialized agents such as a Personal Assistant and a House Controller. Task and process creation are key components of this section, with the aim of achieving seamless orchestration among multiple agents to perform complex tasks efficiently.
- [ ] CrewAI multi-agent workflows.

## 6. Long-term Memory with Vector DB
ChromaDB has been configured to provide long-term memory capabilities, with functions to save and retrieve conversations. Text embeddings using OpenAI defaults enable efficient storage and retrieval of information. Semantic search functionality allows the system to retrieve relevant context based on user queries, enhancing the overall interaction experience.
- [x] ChromaDB integration and semantic search.

## 7. Voice Module: Speech-to-Text (Whisper)
A dedicated endpoint/function has been developed to process audio inputs, utilizing OpenAI Whisper for accurate speech-to-text transcription. The system is capable of handling various audio formats and integrating the transcribed text into the message flow, ensuring smooth communication between the user and the system.
- [x] Whisper integration.

## 8. Voice Module: Text-to-Speech (ElevenLabs)
The text-to-speech module uses ElevenLabs to generate audio from text, with the Rachel voice configured for optimal stability and clarity. Audio can be delivered via WebSocket or API response, providing flexibility in how the user receives feedback. Plans include implementing an audio cache for common responses to improve performance and reduce latency.
- [x] ElevenLabs integration.
- [ ] Audio response caching.

## 9. Vision Module (GPT-4o Vision)
The vision module includes an endpoint to receive images, which are then processed and sent to the vision model for analysis. The system can provide contextual responses based on visual inputs, with use cases including scene description and text reading. This module enhances the system's ability to interact with the user in a multimodal manner.
- [x] GPT-4o Vision integration.

## 10. Modular Tool System
A standard interface for tools has been established using the `@tool` decorator, allowing for dynamic tool registration and easy integration of new functionalities. Example tools such as email handling and home assistant simulations have been implemented. Future plans include adding OAuth and authentication handling for real APIs, ensuring secure and efficient tool usage.
- [x] `@tool` based modular system.
- [ ] OAuth integration.

## 11. Personality & Prompt Engineering
The system prompt for Veronica has been carefully crafted to define her personality, with instructions for empathy, proactivity, and politeness. Temperature and parameter tuning in the orchestrator ensure that the agent's responses are appropriate and contextually relevant, providing a more engaging and personalized user experience.
- [x] Empathetic prompt design.

## 12. Basic User Interface (Frontend)
A simple chat interface has been developed with text input and response display capabilities. Placeholders for voice and vision interactions have been included to prepare for future enhancements. The frontend communicates with the backend via WebSocket, ensuring real-time updates and a seamless user experience.
- [x] Streamlit Chat UI.

## 13. Unit & Integration Tests
Basic test scripts (`test_veronica.py`) have been created to ensure the reliability and functionality of the system. Mocks for external services, such as ElevenLabs key checks, are in place to facilitate testing without dependencies on external APIs. Plans include developing a comprehensive test suite using `pytest` to cover all aspects of the project thoroughly.
- [x] Basic test script.
- [ ] Pytest suite.

## 14. Deployment & Documentation
Detailed installation instructions are provided in the `README`, along with an API configuration guide and usage examples to assist users in setting up and using the system. Dockerization is ready with Docker Compose, making it easy to deploy the application in various environments. Comprehensive documentation ensures that users can quickly get started and make the most of Veronica's capabilities.
- [x] Detailed README.
- [x] Docker Compose deployment.
