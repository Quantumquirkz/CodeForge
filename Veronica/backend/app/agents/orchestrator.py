from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.core.config import settings
from app.memory.manager import memory_manager
from app.core.llm_factory import LLMFactory

class AgentOrchestrator:
    def __init__(self, provider: str = "openai", model: str = "gpt-4o"):
        self.llm = LLMFactory.get_llm(provider=provider, model=model, streaming=True)
        self.tools = [] # To be populated by tools module
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", settings.VERONICA_PERSONA),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        self.agent = create_openai_functions_agent(self.llm, self.tools, prompt)
        self.executor = AgentExecutor(agent=self.agent, tools=self.tools, verbose=True)

    def run(self, user_input: str, history: list = []):
        # Synchronous run (still used for some endpoints)
        context = memory_manager.search_memories(user_input)
        context_str = "\n".join(context)
        enhanced_input = f"Context from your memory:\n{context_str}\n\nUser Question: {user_input}"
        
        response = self.executor.invoke({
            "input": enhanced_input,
            "chat_history": history
        })
        
        memory_manager.add_memory(f"User: {user_input}\nVeronica: {response['output']}")
        return response["output"]

    async def astream_responses(self, user_input: str, history: list = []):
        # Asynchronous streaming
        context = memory_manager.search_memories(user_input)
        context_str = "\n".join(context)
        enhanced_input = f"Context from your memory:\n{context_str}\n\nUser Question: {user_input}"
        
        full_response = ""
        async for chunk in self.executor.astream({
            "input": enhanced_input,
            "chat_history": history
        }):
            # AgentExecutor streaming yields events
            if "output" in chunk:
                full_response += chunk["output"]
                yield chunk["output"]
            elif "actions" in chunk:
                # You could yield tool calling info here if desired
                pass
        
        if full_response:
            memory_manager.add_memory(f"User: {user_input}\nVeronica: {full_response}")

agent_orchestrator = AgentOrchestrator()
