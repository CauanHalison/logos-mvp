from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi_pagination import Page, Params

from app.api.deps import CurrentUserDep, SessionDep
from app.models.enums import IncidentCategory, Criticity, Status
from app.schemas.incidents import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
    OptionItem,
    IncidentOptionsResponse,
    INCIDENT_CATEGORY_LABELS,
    CRITICITY_LABELS,
    STATUS_LABELS,
    StatsResponse,
)
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=Page[IncidentResponse], summary="Listar incidentes paginados com filtros")
def list_incidents(
    db: SessionDep,
    params: Params = Depends(),
    status: Optional[Status] = Query(None, description="Filtrar por status"),
    criticity: Optional[Criticity] = Query(None, description="Filtrar por criticidade"),
    category: Optional[IncidentCategory] = Query(None, description="Filtrar por categoria"),
    truck_plate: Optional[str] = Query(None, description="Filtrar por placa do caminhão"),
):
    return IncidentService.get_paginated(
        db=db,
        params=params,
        status=status,
        criticity=criticity,
        category=category,
        truck_plate=truck_plate,
    )


@router.get("/stats", response_model=StatsResponse, summary="Obter estatísticas consolidadas de incidentes")
def get_incident_stats(db: SessionDep) -> StatsResponse:
    return IncidentService.get_stats(db=db)


@router.get("/options", response_model=IncidentOptionsResponse, summary="Obter opções de categorias, criticidades e status para o frontend")
def get_incident_options() -> IncidentOptionsResponse:
    return IncidentOptionsResponse(
        categories=[OptionItem(value=e.value, label=INCIDENT_CATEGORY_LABELS[e]) for e in IncidentCategory],
        criticities=[OptionItem(value=e.value, label=CRITICITY_LABELS[e]) for e in Criticity],
        statuses=[OptionItem(value=e.value, label=STATUS_LABELS[e]) for e in Status],
    )


@router.get("/options/categories", response_model=list[OptionItem], summary="Listar opções de categorias")
def get_category_options() -> list[OptionItem]:
    return [OptionItem(value=e.value, label=INCIDENT_CATEGORY_LABELS[e]) for e in IncidentCategory]


@router.get("/options/criticities", response_model=list[OptionItem], summary="Listar opções de criticidade")
def get_criticity_options() -> list[OptionItem]:
    return [OptionItem(value=e.value, label=CRITICITY_LABELS[e]) for e in Criticity]


@router.get("/options/statuses", response_model=list[OptionItem], summary="Listar opções de status")
def get_status_options() -> list[OptionItem]:
    return [OptionItem(value=e.value, label=STATUS_LABELS[e]) for e in Status]


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED, summary="Registrar novo incidente")
def create_incident(
    incident_in: IncidentCreate,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    return IncidentService.create(db=db, incident_in=incident_in)


@router.get("/{incident_id}", response_model=IncidentResponse, summary="Buscar incidente por ID")
def get_incident(
    incident_id: UUID,
    db: SessionDep,
):
    incident = IncidentService.get_by_id(db=db, incident_id=incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incidente com ID {incident_id} não encontrado",
        )
    return incident


@router.put("/{incident_id}", response_model=IncidentResponse, summary="Atualizar incidente")
def update_incident(
    incident_id: UUID,
    incident_in: IncidentUpdate,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    incident = IncidentService.get_by_id(db=db, incident_id=incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incidente com ID {incident_id} não encontrado",
        )
    return IncidentService.update(db=db, db_incident=incident, incident_in=incident_in, current_user=current_user)


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remover incidente")
def delete_incident(
    incident_id: UUID,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    incident = IncidentService.get_by_id(db=db, incident_id=incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incidente com ID {incident_id} não encontrado",
        )
    IncidentService.delete(db=db, db_incident=incident, current_user=current_user)
    return None
