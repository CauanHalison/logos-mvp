import uuid
from app.db.base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Uuid, String, DateTime, Boolean
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True, 
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True
    )

    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False,
        index=True
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
