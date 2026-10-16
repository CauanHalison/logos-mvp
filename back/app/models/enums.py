from enum import Enum


class IncidentCategory(str, Enum):
    ACIDENTE_COM_VEICULO = "acidente_veiculo"
    ACIDENTE_COM_VITIMAS = "acidente_vitimas"
    CLIMA_ATIPICO = "clima_atipico"
    PROBLEMA_MECANICO = "problema_mecanico"
    BLOQUEIO_DE_PISTA = "bloqueio_de_pista"


class Criticity(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"


class Status(str, Enum):
    ABERTO = "aberto"
    FECHADO = "fechado"
    EM_INVESTIGACAO = "em_investigacao"
    INCONCLUSIVO = "inconclusivo"