from typing import Annotated, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBasic, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import AuthService

SessionDep = Annotated[Session, Depends(get_db)]

basic_scheme = HTTPBasic(scheme_name="basicScheme", auto_error=False)
bearer_scheme = HTTPBearer(scheme_name="bearerKey", auto_error=False)

TokenDep = Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)]


def get_current_user(token_auth: TokenDep, db: SessionDep) -> User:
    if not token_auth or not token_auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária. Token Bearer não fornecido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = token_auth.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido. Identificador ausente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token com formato de identificador inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = AuthService.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário associado a este token não foi encontrado.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo no sistema.",
        )

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
