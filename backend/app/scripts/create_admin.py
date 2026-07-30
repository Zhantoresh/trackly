"""
Создаёт первого admin, если в базе ещё нет ни одного пользователя с ролью admin.

Безопасно запускать при каждом деплое (idempotent) — если admin уже есть, скрипт
просто ничего не делает и выходит с кодом 0.

Использование:
    python -m app.scripts.create_admin

Переменные окружения (обязательные):
    ADMIN_EMAIL
    ADMIN_PASSWORD
    ADMIN_NAME (опционально, по умолчанию "Admin")
"""
import os
import sys

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.routers.auth import hash_password


def main() -> int:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    name = os.environ.get("ADMIN_NAME", "Admin")

    if not email or not password:
        print("ADMIN_EMAIL и ADMIN_PASSWORD обязательны для создания первого admin.")
        return 1

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
        if existing_admin:
            print(f"Admin уже существует ({existing_admin.email}), пропускаю.")
            return 0

        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            # Пользователь с таким email уже есть — просто повышаем его до admin,
            # вместо того чтобы падать с ошибкой уникальности.
            existing_email.role = UserRole.admin
            db.commit()
            print(f"Пользователь {email} повышен до admin.")
            return 0

        admin = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print(f"Admin создан: {email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
