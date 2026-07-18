"""Cria o primeiro usuário ADMIN (idempotente; permitido em produção).

Uso (Railway: aba do serviço da API -> Settings -> ou via `railway run`):
    ADMIN_EMAIL=voce@empresa.com ADMIN_PASSWORD='senha-forte-aqui' \
        python scripts/create_admin.py

A conta é criada com troca de senha obrigatória no primeiro login.
"""

import os
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_engine
from app.core.security import hash_password
from app.models import User, UserRole


def main() -> None:
    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "")
    if not email or "@" not in email:
        sys.exit("Defina ADMIN_EMAIL com um e-mail válido.")
    if len(password) < 10:
        sys.exit("Defina ADMIN_PASSWORD com pelo menos 10 caracteres.")

    with Session(get_engine()) as session:
        if session.scalar(select(User).where(User.email == email)) is not None:
            print(f"Usuário {email} já existe; nada a fazer.")  # noqa: T201
            return
        session.add(
            User(
                name="Administrador",
                email=email,
                hashed_password=hash_password(password),
                role=UserRole.ADMIN,
                must_change_password=True,
            )
        )
        session.commit()
    print(f"ADMIN criado: {email} (troca de senha obrigatória no primeiro login)")  # noqa: T201


if __name__ == "__main__":
    main()
