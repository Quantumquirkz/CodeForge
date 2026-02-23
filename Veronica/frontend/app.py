import streamlit as st
import asyncio
import websockets
import json

st.set_page_config(page_title="Veronica AI", page_icon="🤖")

st.title("Veronica - Empathetic AI Assistant")
st.markdown("Inspired by J.A.R.V.I.S. | Built with ❤️")

if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

async def stream_from_backend(user_input, placeholder):
    uri = "ws://localhost:8001/ws/chat"
    full_response = ""
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps({"text": user_input}))
            
            while True:
                response_data = await websocket.recv()
                data = json.loads(response_data)
                
                if data.get("type") == "chunk":
                    chunk = data.get("text", "")
                    full_response += chunk
                    placeholder.markdown(full_response + "▌")
                elif data.get("type") == "end":
                    break
                    
        placeholder.markdown(full_response)
        return full_response
    except Exception as e:
        st.error(f"Connection error: {e}")
        return None

if prompt := st.chat_input("How can I help you today, Sir?"):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Add assistant response placeholder
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        
        # Run the async streaming in the current event loop
        # Note: Streamlit usually runs in a way that requires careful handling of async
        # We'll use a wrapper or run it synchronously for simplicity in this prototype
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        full_response = loop.run_until_complete(stream_from_backend(prompt, message_placeholder))
        
        if full_response:
            st.session_state.messages.append({"role": "assistant", "content": full_response})

# Sidebar for Voice/Vision demo
with st.sidebar:
    st.header("Veronica Capabilities")
    st.info("Streaming and Multi-Provider LLM integration active.")
    
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()

    st.divider()
    
    uploaded_file = st.file_uploader("Analyze Image", type=["jpg", "jpeg", "png"])
    if uploaded_file is not None:
        st.image(uploaded_file, caption="Image for Veronica", use_column_width=True)
        if st.button("Analyze with GPT-4o Vision"):
            st.write("Processing image...")
            # Vision logic would go here
