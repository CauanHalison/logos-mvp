from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasicCredentials

from app.api.deps import CurrentUserDep, SessionDep, basic_scheme
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, Token, UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Cadastrar novo operador")
def register(user_in: UserCreate, db: SessionDep) -> UserResponse:
    if AuthService.get_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado no sistema.",
        )
    return AuthService.create_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token, summary="Login do operador (retorna token JWT)")
def login(
    db: SessionDep,
    login_data: Optional[LoginRequest] = None,
    credentials: Annotated[Optional[HTTPBasicCredentials], Depends(basic_scheme)] = None,
) -> Token:
    email = None
    password = None

    if credentials and credentials.username and credentials.password:
        email = credentials.username
        password = credentials.password
    elif login_data and login_data.email and login_data.password:
        email = login_data.email
        password = login_data.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais de autenticação não fornecidas. Informe o e-mail e senha no corpo da requisição ou utilize Basic Auth.",
            headers={"WWW-Authenticate": "Basic"},
        )

    user = AuthService.authenticate(db, email=email, password=password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo no sistema.",
        )

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse, summary="Obter dados do operador autenticado")
def get_me(current_user: CurrentUserDep) -> UserResponse:
    return current_user
