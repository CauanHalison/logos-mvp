from typing import Optional
from uuid import UUID
from sqlalchemy import select, case, func
from sqlalchemy.orm import Session
from fastapi_pagination import Params
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi import Depends, HTTPException, status

from app.models.incident import Incident
from app.models.user import User
from app.models.enums import IncidentCategory, Criticity, Status
from app.schemas.incidents import IncidentCreate, IncidentUpdate, StatsResponse, StatsCountResponse


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

        criticity_order = case(
            (Incident.criticity == Criticity.ALTA, 1),
            (Incident.criticity == Criticity.MEDIA, 2),
            (Incident.criticity == Criticity.BAIXA, 3),
            else_=4
        )
        
        status_order = case(
            (Incident.status == Status.ABERTO, 1),
            (Incident.status == Status.EM_INVESTIGACAO, 2),
            (Incident.status == Status.INCONCLUSIVO, 3),
            (Incident.status == Status.FECHADO, 4),
            else_=5
        )

        query = query.order_by(
            criticity_order.asc(), 
            status_order.asc(),
            Incident.created_at.desc()
        )

        return paginate(db, query, params)

    @staticmethod
    def get_stats(db: Session) -> StatsResponse:
        total_incidents = db.query(Incident).count()

        category_stats = db.query(
            Incident.category,
            func.count(Incident.id).label("count")
        ).group_by(Incident.category).all()

        criticity_stats = db.query(
            Incident.criticity,
            func.count(Incident.id).label("count")
        ).group_by(Incident.criticity).all()

        status_stats = db.query(
            Incident.status,
            func.count(Incident.id).label("count")
        ).group_by(Incident.status).all()

        return StatsResponse(
            total_incidents=total_incidents,
            category_stats=[
                StatsCountResponse(stats_value=getattr(category, "value", str(category)), count=count)
                for category, count in category_stats
            ],
            criticity_stats=[
                StatsCountResponse(stats_value=getattr(criticity, "value", str(criticity)), count=count)
                for criticity, count in criticity_stats
            ],
            status_stats=[
                StatsCountResponse(stats_value=getattr(status, "value", str(status)), count=count)
                for status, count in status_stats
            ],
        )

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
    def update(db: Session, db_incident: Incident, incident_in: IncidentUpdate, current_user: User) -> Incident:
        if db_incident.operator_id and db_incident.operator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o operador responsável que iniciou a investigação pode editar este incidente."
            )
        
        if incident_in.status == Status.EM_INVESTIGACAO and not db_incident.operator_id:
            db_incident.operator_id = current_user.id
            
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
