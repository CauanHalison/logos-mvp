from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


class AuthService:
    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            hashed_password=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = AuthService.get_by_email(db, email)
        if user and verify_password(password, user.hashed_password):
            return user
        return None