import uvicorn
from app.api.endpoints import app
from app.agents.orchestrator import agent_orchestrator
from app.tools.base import get_tools

# Update agent with tools at startup
agent_orchestrator.tools = get_tools()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
