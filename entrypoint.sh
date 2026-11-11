#!/bin/sh

set -e

echo "[ENTRYPOINT] Iniciando contenedor y preparando aplicación..."

# Ejecutar el setup como módulo de Python desde la raíz
python -m app.setup_db

echo "[ENTRYPOINT] Iniciando servidor FastAPI con Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload