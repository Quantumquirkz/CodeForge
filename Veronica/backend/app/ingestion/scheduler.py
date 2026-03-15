"""Scheduled ingestion for learning goals. Uses APScheduler."""

from typing import Callable

_scheduler = None


def get_scheduler():
    """Return APScheduler instance."""
    global _scheduler
    if _scheduler is None:
        from apscheduler.schedulers.background import BackgroundScheduler

        _scheduler = BackgroundScheduler()
        _scheduler.start()
    return _scheduler


def schedule_ingestion(
    topic: str,
    interval_hours: float = 24,
    fn: Callable[[str], None] | None = None,
) -> None:
    """Schedule periodic ingestion for a topic."""
    from app.ingestion.pipeline import run_ingestion_pipeline

    sched = get_scheduler()
    job_fn = fn or (lambda: run_ingestion_pipeline(topic))
    sched.add_job(job_fn, "interval", hours=interval_hours, id=f"ingest_{topic}")
