from app.memory.session_store import SessionStore


def test_session_store_appends_and_caps_messages() -> None:
    store = SessionStore(max_messages=4)

    store.append_turn("s1", "u1", "a1")
    store.append_turn("s1", "u2", "a2")
    store.append_turn("s1", "u3", "a3")

    history = store.get_history("s1")

    assert len(history) == 4
    assert history[0].content == "u2"
    assert history[-1].content == "a3"


def test_session_store_clear_removes_session() -> None:
    store = SessionStore()
    store.append_turn("s1", "hello", "hi")

    store.clear("s1")

    assert store.get_history("s1") == []
