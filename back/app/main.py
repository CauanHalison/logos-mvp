from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models


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

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    """Rota raiz fornecendo status e links para a documentação."""
    return {
        "message": f"Bem-vindo à API: {settings.PROJECT_NAME}",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": f"{settings.API_V1_STR}/health",
    }
