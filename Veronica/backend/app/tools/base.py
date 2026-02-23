from langchain.tools import tool

@tool
def control_lights(room: str, state: str):
    """Controls the lights in a specific room. state can be 'on' or 'off'."""
    # Simulated integration with Home Assistant or similar
    return f"The lights in the {room} are now {state}. Is there anything else I can help you with?"

@tool
def send_email(recipient: str, subject: str, body: str):
    """Sends an email to a recipient with a subject and body."""
    # Simulated email sending
    return f"Email sent to {recipient} with subject: {subject}. I've taken care of that for you."

def get_tools():
    return [control_lights, send_email]
