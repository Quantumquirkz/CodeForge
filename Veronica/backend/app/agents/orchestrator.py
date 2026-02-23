from __future__ import annotations

from typing import AsyncIterator

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.core.config import settings
from app.core.llm_factory import LLMFactory
from app.memory.manager import memory_manager


class AgentOrchestrator:
    """Coordinates LLM, tools, and memory for Veronica chat interactions."""

    def __init__(self, provider: str = "openai", model: str = "gpt-4o") -> None:
        self.llm = LLMFactory.get_llm(provider=provider, model=model, streaming=True)
        self.tools = []
        self._prompt = ChatPromptTemplate.from_messages(
            [
                ("system", settings.VERONICA_PERSONA),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
        self._build_executor()

    def _build_executor(self) -> None:
        """Rebuild the agent/executor pair to reflect current tool registrations."""
        self.agent = create_openai_functions_agent(self.llm, self.tools, self._prompt)
        self.executor = AgentExecutor(agent=self.agent, tools=self.tools, verbose=True)

    def configure_tools(self, tools: list) -> None:
        """Set available tools and rebuild internals so bindings stay consistent."""
        self.tools = tools
        self._build_executor()

    def _build_enhanced_input(self, user_input: str) -> str:
        context = memory_manager.search_memories(user_input)
        context_str = "\n".join(context)
        return f"Context from your memory:\n{context_str}\n\nUser Question: {user_input}"

    def run(self, user_input: str, history: list[BaseMessage] | None = None) -> str:
        """Synchronous run used by non-streaming endpoints."""
        enhanced_input = self._build_enhanced_input(user_input)
        response = self.executor.invoke(
            {
                "input": enhanced_input,
                "chat_history": history or [],
            }
        )

        output_text = response["output"]
        memory_manager.add_memory(f"User: {user_input}\nVeronica: {output_text}")
        return output_text

    async def astream_responses(
        self, user_input: str, history: list[BaseMessage] | None = None
    ) -> AsyncIterator[str]:
        """Asynchronous response streaming for websocket chat."""
        enhanced_input = self._build_enhanced_input(user_input)

        full_response = ""
        async for chunk in self.executor.astream(
            {
                "input": enhanced_input,
                "chat_history": history or [],
            }
        ):
            if "output" in chunk:
                full_response += chunk["output"]
                yield chunk["output"]

        if full_response:
            memory_manager.add_memory(f"User: {user_input}\nVeronica: {full_response}")


agent_orchestrator = AgentOrchestrator()
