from app.agents.orchestrator import agent_orchestrator
from app.memory.manager import memory_manager
from app.tools.base import get_tools
import os

def test_veronica_mock():
    print("Initializing Veronica Test...")
    
    # Setup tools
    agent_orchestrator.tools = get_tools()
    
    # Simulated User Input
    user_input = "Hello Veronica, can you please turn on the lights in the living room?"
    
    print(f"User: {user_input}")
    
    # Run Orchestrator
    try:
        response = agent_orchestrator.run(user_input)
        print(f"Veronica: {response}")
    except Exception as e:
        print(f"Error during execution: {e}")
        print("Note: This might be due to missing API keys in .env")

    # Verify Memory
    memories = memory_manager.search_memories("lights")
    print(f"Retrieving from memory: {memories}")

if __name__ == "__main__":
    # Ensure we are in backend dir context or add to path
    import sys
    sys.path.append(os.path.join(os.getcwd(), "backend"))
    test_veronica_mock()
