import streamlit as st
import sys
import os
from pathlib import Path

# Add project root to path so we can import src modules
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from src.retrieval.graph import crag_app

# --- UI Configuration ---
st.set_page_config(page_title="Multi-Tenant RAG", page_icon="🤖", layout="wide")

st.title("🤖 Enterprise RAG Assistant")
st.markdown("Select a tenant from the sidebar and start chatting. The AI remembers your context!")

# --- Sidebar: Tenant Selection ---
st.sidebar.header("🏢 Tenant Selection")
TENANTS = {
    "PostgreSQL": "619f50ab-df74-4057-9305-05a70fdc2474",
    "Intel Processors": "3780bb27-250a-4a2c-be4b-9252b8e8ce9a",
    "AWS Architecture": "a7f179d0-83b7-4960-843f-3cac536797f3"
}
selected_tenant_name = st.sidebar.selectbox("Active Tenant", list(TENANTS.keys()))
tenant_id = TENANTS[selected_tenant_name]
st.sidebar.caption(f"ID: `{tenant_id[:8]}...`")

# --- Session State (Chat History Memory) ---
# We isolate memory per tenant so switching tenants clears the specific chat
memory_key = f"messages_{tenant_id}"
if memory_key not in st.session_state:
    st.session_state[memory_key] = []

# Display chat history
for msg in st.session_state[memory_key]:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# --- Chat Input & Logic ---
if prompt := st.chat_input(f"Ask about {selected_tenant_name}..."):
    # Add user message to state and display
    st.session_state[memory_key].append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
        
    # Get previous chat history (excluding the current prompt)
    # We pass the last 10 messages for context
    history_for_langgraph = st.session_state[memory_key][:-1][-10:]
    
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                # Invoke LangGraph Brain
                final_state = crag_app.invoke({
                    "tenant_id": tenant_id,
                    "question": prompt,
                    "chat_history": history_for_langgraph,
                    "generation": "",
                    "documents": "",
                    "route": ""
                })
                
                answer = final_state.get("generation", "I'm sorry, I couldn't generate an answer.")
                st.markdown(answer)
                
                # Save assistant response
                st.session_state[memory_key].append({"role": "assistant", "content": answer})
                
            except Exception as e:
                st.error(f"Error connecting to LangGraph: {str(e)}")
