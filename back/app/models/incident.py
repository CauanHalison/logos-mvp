from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import CheckConstraint, DateTime, Enum as SQLEnum, Float, String, Text, Uuid, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import IncidentCategory, Criticity, Status
import uuid

if TYPE_CHECKING:
    from app.models.user import User


class Incident(Base):
    __tablename__ = "incident"

    __table_args__ = (
        CheckConstraint("latitude >= -90.0 AND latitude <= 90.0", name="check_latitude_range"),
        CheckConstraint("longitude >= -180.0 AND longitude <= 180.0", name="check_longitude_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True, 
        default=uuid.uuid4
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc)
    )

    truck_plate: Mapped[str] = mapped_column(
        String(7),
        nullable=False,
        index=True
    )

    driver_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    category: Mapped[IncidentCategory] = mapped_column(
        SQLEnum(IncidentCategory, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )

    criticity: Mapped[Criticity] = mapped_column(
        SQLEnum(Criticity, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=Criticity.BAIXA,
    )

    status: Mapped[Status] = mapped_column(
        SQLEnum(Status, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=Status.ABERTO,
    )

    operator_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid,
        ForeignKey("users.id"),
        nullable=True,
        default=None
    )

    operator: Mapped[Optional["User"]] = relationship("User")