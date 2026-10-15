from datetime import datetime, timezone
from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SessionDep
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check do Sistema")
def health_check(db: SessionDep):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "project": settings.PROJECT_NAME,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
