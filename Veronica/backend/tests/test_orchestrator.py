"""Tests for the LangGraph orchestrator."""

import pytest
from unittest.mock import patch, MagicMock

from app.agents.state import VeronicaState
from app.agents.orchestrator import _route, build_graph


def test_route_defaults_to_analysis_agent():
    """Router routes chat messages to analysis_agent."""
    from langchain_core.messages import HumanMessage

    state: VeronicaState = {"messages": [HumanMessage(content="Hola")]}
    assert _route(state) == "analysis_agent"


def test_build_graph_compiles():
    """Graph builds without error."""
    g = build_graph()
    assert g is not None


@patch("app.agents.orchestrator._retrieve_context", return_value=[])
@patch("app.agents.orchestrator.analysis_subgraph")
def test_process_message_returns_string(mock_subgraph, mock_retrieve):
    """process_message returns a string response."""
    mock_subgraph.invoke.return_value = {"output": "Hola, ¿cómo puedo ayudarte?"}

    from app.agents.orchestrator import process_message

    resp = process_message("Hola", session_id="test")
    assert isinstance(resp, str)
    assert "Hola" in resp
