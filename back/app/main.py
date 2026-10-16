from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_pagination import add_pagination

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models


MENSAGENS_PADRAO = {
    "missing": "Este campo é obrigatório.",
    "string_too_short": "Deve ter no mínimo {min_length} caracteres.",
    "string_too_long": "Deve ter no máximo {max_length} caracteres.",
    "greater_than_equal": "O valor mínimo permitido é {ge}.",
    "less_than_equal": "O valor máximo permitido é {le}.",
    "greater_than": "O valor deve ser maior que {gt}.",
    "less_than": "O valor deve ser menor que {lt}.",
    "enum": "Opção inválida. Escolha uma das opções permitidas.",
    "float_parsing": "Deve ser um número decimal válido.",
    "int_parsing": "Deve ser um número inteiro válido.",
    "value_error": "Valor inválido.",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia eventos de ciclo de vida da aplicação (startup e shutdown)."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API desenvolvida com FastAPI para o projeto Logos.",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

if settings.BACKEND_CORS_ORIGINS:
    origins = (
        settings.BACKEND_CORS_ORIGINS
        if isinstance(settings.BACKEND_CORS_ORIGINS, list)
        else [settings.BACKEND_CORS_ORIGINS]
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    erros = []
    for erro in exc.errors():
        loc = erro["loc"]
        campo = str(loc[-1]) if loc else "geral"
        tipo = erro["type"]
        ctx = erro.get("ctx", {})
        msg_original = str(erro.get("msg", ""))

        if "Value error, " in msg_original:
            mensagem = msg_original.replace("Value error, ", "")
        elif tipo in MENSAGENS_PADRAO:
            template = MENSAGENS_PADRAO[tipo]
            try:
                mensagem = template.format(**ctx) if ctx else template
            except Exception:
                mensagem = template
        else:
            mensagem = msg_original

        erros.append({"campo": campo, "mensagem": mensagem})

    return JSONResponse(
        status_code=422,
        content={"erros": erros},
    )


app.include_router(api_router, prefix=settings.API_V1_STR)

add_pagination(app)


@app.get("/", tags=["Root"])
def root():
    """Rota raiz fornecendo status e links para a documentação."""
    return {
        "message": f"Bem-vindo à API: {settings.PROJECT_NAME}",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": f"{settings.API_V1_STR}/health",
    }
