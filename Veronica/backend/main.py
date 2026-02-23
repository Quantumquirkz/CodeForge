import uvicorn

from app.agents.orchestrator import agent_orchestrator
from app.api.endpoints import app
from app.tools.base import get_tools

# Ensure tools are fully registered in the internal agent executor.
agent_orchestrator.configure_tools(get_tools())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
