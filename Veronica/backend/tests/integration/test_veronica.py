"""Integration test for Veronica orchestrator and memory."""

from app.agents.orchestrator import agent_orchestrator
from app.memory.manager import memory_manager
from app.tools.base import get_tools


def test_veronica_mock():
    """Smoke test: run orchestrator with simulated user input."""
    print("Initializing Veronica Test...")

    agent_orchestrator.configure_tools(get_tools())

    user_input = "Hello Veronica, can you please turn on the lights in the living room?"

    print(f"User: {user_input}")

    try:
        response = agent_orchestrator.run(user_input)
        print(f"Veronica: {response}")
    except Exception as e:
        print(f"Error during execution: {e}")
        print("Note: This might be due to missing API keys in .env")

    memories = memory_manager.search_memories("lights")
    print(f"Retrieving from memory: {memories}")
