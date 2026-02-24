from pydantic import ValidationError

from app.domain.context import ConversationContext, UserProfile


def test_user_profile_defaults() -> None:
    profile = UserProfile(user_id="user-1")
    assert profile.language == "en"
    assert profile.warmth == 0.7


def test_conversation_context_validates_turn_count() -> None:
    try:
        ConversationContext(session_id="s1", user_id="u1", turn_count=-1)
    except ValidationError:
        assert True
    else:
        raise AssertionError("Expected ValidationError for negative turn_count")
