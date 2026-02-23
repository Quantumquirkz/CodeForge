# Veronica - Empathetic AI Assistant

Veronica is an autonomous AI agent inspired by J.A.R.V.I.S., designed with the philosophy of **Empathetic Intelligence**. She is proactive, polite, and capable of reasoning, planning, and executing tasks.

## 🚀 Features

- **Empathetic Personality**: Polite, warm, and proactive interactions.
- **Autonomous Reasoning**: Uses LangChain and GPT-4o to decompose and execute complex tasks.
- **Long-term Memory**: Persistent memory using ChromaDB to remember user preferences.
- **Voice Integration**: Speech-to-Text (OpenAI Whisper) and Text-to-Speech (ElevenLabs).
- **Computer Vision**: Image analysis using GPT-4o Vision.
- **Modular Tools**: Easily extendable tool system (e.g., Email, Home Automation).

## 🛠️ Project Structure

```text
Veronica/
├── backend/
│   ├── app/
│   │   ├── agents/      # LangChain & CrewAI logic
│   │   ├── api/         # FastAPI & WebSockets
│   │   ├── core/        # Config & Utils
│   │   ├── memory/      # ChromaDB integration
│   │   ├── tools/       # Multi-agent tools
│   │   ├── vision/      # Visual analysis
│   │   └── voice/       # TTS & STT modules
│   ├── main.py          # Entry point
│   └── requirements.txt
├── frontend/
│   └── app.py           # Streamlit UI
├── docker-compose.yml   # Services (ChromaDB, etc.)
└── README.md
```

## ⚙️ Setup

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- API Keys: OpenAI, Anthropic, ElevenLabs

### Installation

1. **Clone the repository** (or navigate to the directory).
2. **Install dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Configure Environment**:
   Copy `.env.example` to `.env` in the `backend/` directory and fill in your API keys.
4. **Start Services**:
   ```bash
   docker-compose up -d
   ```
5. **Run Backend**:
   ```bash
   python backend/main.py
   ```
6. **Run Frontend**:
   ```bash
   streamlit run frontend/app.py
   ```

## 🧪 Testing

Run the included test script to verify core logic:
```bash
python test_veronica.py
```

## 🤝 Philosophy: Empathetic Intelligence
Veronica doesn't just process data; she understands context and strives to be helpful in a way that feels human-centric and respectful.
