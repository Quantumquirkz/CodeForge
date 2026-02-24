"""create bot tables

Revision ID: 0001_init
Revises:
Create Date: 2026-02-24
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bot_config",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("bot_name", sa.String(length=120), nullable=False, server_default="Asistente Virtual"),
        sa.Column("default_language", sa.String(length=10), nullable=False, server_default="es"),
        sa.Column("temperature", sa.Float(), nullable=False, server_default="0.7"),
        sa.Column("max_tokens", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("context_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("context_memory_size", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("response_length_policy", sa.String(length=20), nullable=False, server_default="balanced"),
        sa.Column("emoji_policy", sa.String(length=20), nullable=False, server_default="moderate"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "persona_profile",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tone", sa.String(length=30), nullable=False, server_default="friendly"),
        sa.Column("formality", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("humor_level", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("brevity_level", sa.Integer(), nullable=False, server_default="6"),
        sa.Column("signature_phrases", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("forbidden_phrases", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("writing_rules", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "writing_sample",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "persona_style_guide",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guide_text", sa.Text(), nullable=False),
        sa.Column("signals", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("sample_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "config_audit_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.execute("INSERT INTO bot_config (id) VALUES (1)")
    op.execute("INSERT INTO persona_profile (id) VALUES (1)")
    op.execute("INSERT INTO persona_style_guide (id, guide_text, signals, sample_count) VALUES (1, 'Mantener tono amistoso y claro.', '{}', 0)")


def downgrade() -> None:
    op.drop_table("config_audit_log")
    op.drop_table("persona_style_guide")
    op.drop_table("writing_sample")
    op.drop_table("persona_profile")
    op.drop_table("bot_config")
