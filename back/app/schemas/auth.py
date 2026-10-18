from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Token(BaseModel):
    access_token: str = Field(..., description="Token de acesso JWT")
    token_type: str = Field(..., description="Tipo do token (ex: bearer)")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="E-mail cadastrado do operador")
    password: str = Field(..., description="Senha do operador")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return str(v).strip().lower()


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Nome completo do operador")
    email: EmailStr = Field(..., description="E-mail corporativo do operador")
    password: str = Field(..., min_length=6, description="Senha de acesso")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return str(v).strip().lower()


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)