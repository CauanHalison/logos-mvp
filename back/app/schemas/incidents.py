import re
from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import IncidentCategory, Criticity, Status


INCIDENT_CATEGORY_LABELS: dict[IncidentCategory, str] = {
    IncidentCategory.ACIDENTE_COM_VEICULO: "Acidente com veículo",
    IncidentCategory.ACIDENTE_COM_VITIMAS: "Acidente com vítimas",
    IncidentCategory.CLIMA_ATIPICO: "Condição Climática Atípica na Pista",
    IncidentCategory.PROBLEMA_MECANICO: "Problema mecânico",
    IncidentCategory.BLOQUEIO_DE_PISTA: "Bloqueio de pista",
}

CRITICITY_LABELS: dict[Criticity, str] = {
    Criticity.BAIXA: "Baixa",
    Criticity.MEDIA: "Média",
    Criticity.ALTA: "Alta",
}

STATUS_LABELS: dict[Status, str] = {
    Status.ABERTO: "Aberto",
    Status.FECHADO: "Fechado",
    Status.EM_INVESTIGACAO: "Em Investigação",
    Status.INCONCLUSIVO: "Inconclusivo",
}


class OptionItem(BaseModel):
    value: str = Field(..., description="Valor identificador utilizado nas requisições da API")
    label: str = Field(..., description="Rótulo amigável para exibição no frontend")


class IncidentOptionsResponse(BaseModel):
    categories: list[OptionItem] = Field(..., description="Lista de categorias de incidentes disponíveis")
    criticities: list[OptionItem] = Field(..., description="Lista de níveis de criticidade disponíveis")
    statuses: list[OptionItem] = Field(..., description="Lista de status de incidentes disponíveis")



class IncidentBase(BaseModel):
    truck_plate: str = Field(
        ..., 
        min_length=7, 
        max_length=8, 
        description="Placa do caminhão (ex: ABC1D23 ou ABC-1234)"
    )
    driver_name: str = Field(
        ..., 
        min_length=2, 
        max_length=150, 
        description="Nome do motorista responsável"
    )
    latitude: float = Field(
        ..., 
        ge=-90.0, 
        le=90.0, 
        description="Latitude das coordenadas GPS"
    )
    longitude: float = Field(
        ..., 
        ge=-180.0, 
        le=180.0, 
        description="Longitude das coordenadas GPS"
    )
    title: str = Field(
        ..., 
        min_length=3, 
        max_length=150, 
        description="Resumo do incidente"
    )
    description: Optional[str] = Field(
        None, 
        description="Relato detalhado do ocorrido"
    )
    category: IncidentCategory = Field(
        ..., 
        description="Categoria do incidente"
    )
    criticity: Criticity = Field(
        default=Criticity.BAIXA, 
        description="Nível de criticidade"
    )

    @field_validator("truck_plate")
    @classmethod
    def validar_e_formatar_placa(cls, v: str) -> str:
        placa_limpa = v.upper().replace("-", "").strip()
        padrao = r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$"
        if not re.match(padrao, placa_limpa):
            raise ValueError(
                "Placa inválida. Utilize o formato Mercosul (ABC1D23) ou Tradicional (ABC-1234)"
            )
        return placa_limpa
        


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    truck_plate: Optional[str] = Field(
        None,
        min_length=7,
        max_length=8,
        description="Placa do caminhão (ex: ABC1D23 ou ABC-1234)"
    )
    driver_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150,
        description="Nome do motorista responsável"
    )
    latitude: Optional[float] = Field(
        None,
        ge=-90.0,
        le=90.0,
        description="Latitude das coordenadas GPS"
    )
    longitude: Optional[float] = Field(
        None,
        ge=-180.0,
        le=180.0,
        description="Longitude das coordenadas GPS"
    )
    title: Optional[str] = Field(
        None, 
        min_length=3, 
        max_length=150
    )
    description: Optional[str] = None
    category: Optional[IncidentCategory] = None
    criticity: Optional[Criticity] = None
    status: Optional[Status] = Field(
        None, 
        description="Permite à central mudar o status (ex: Em Investigação, Fechado)"
    )

    @field_validator("truck_plate")
    @classmethod
    def validar_e_formatar_placa(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        placa_limpa = v.upper().replace("-", "").strip()
        padrao = r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$"
        if not re.match(padrao, placa_limpa):
            raise ValueError(
                "Placa inválida. Utilize o formato Mercosul (ABC1D23) ou Tradicional (ABC-1234)"
            )
        return placa_limpa

class OperatorSummary(BaseModel):
    id: UUID
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class IncidentResponse(IncidentBase):
    id: UUID
    status: Status
    operator: Optional[OperatorSummary] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StatsCountResponse(BaseModel):
    stats_value: str
    count: int

    model_config = ConfigDict(from_attributes=True)

class StatsResponse(BaseModel):
    total_incidents: int
    category_stats: list[StatsCountResponse]
    criticity_stats: list[StatsCountResponse]
    status_stats: list[StatsCountResponse]

    model_config = ConfigDict(from_attributes=True)
