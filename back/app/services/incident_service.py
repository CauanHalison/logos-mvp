from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi_pagination import Params
from fastapi_pagination.ext.sqlalchemy import paginate

from app.models.incident import Incident
from app.models.enums import IncidentCategory, Criticity, Status
from app.schemas.incidents import IncidentCreate, IncidentUpdate


class IncidentService:
    @staticmethod
    def get_by_id(db: Session, incident_id: UUID) -> Optional[Incident]:
        return db.get(Incident, incident_id)

    @staticmethod
    def get_paginated(
        db: Session,
        params: Params,
        status: Optional[Status] = None,
        criticity: Optional[Criticity] = None,
        category: Optional[IncidentCategory] = None,
        truck_plate: Optional[str] = None,
    ):
        query = select(Incident)

        if status:
            query = query.where(Incident.status == status)
        if criticity:
            query = query.where(Incident.criticity == criticity)
        if category:
            query = query.where(Incident.category == category)
        if truck_plate:
            query = query.where(Incident.truck_plate.ilike(f"%{truck_plate}%"))

        query = query.order_by(Incident.created_at.desc())

        return paginate(db, query, params)

    @staticmethod
    def create(db: Session, incident_in: IncidentCreate) -> Incident:
        db_incident = Incident(
            truck_plate=incident_in.truck_plate,
            driver_name=incident_in.driver_name,
            latitude=incident_in.latitude,
            longitude=incident_in.longitude,
            title=incident_in.title,
            description=incident_in.description,
            category=incident_in.category,
            criticity=incident_in.criticity,
        )
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
        return db_incident

    @staticmethod
    def update(db: Session, db_incident: Incident, incident_in: IncidentUpdate) -> Incident:
        update_data = incident_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_incident, field, value)
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
        return db_incident

    @staticmethod
    def delete(db: Session, db_incident: Incident) -> None:
        db.delete(db_incident)
        db.commit()
