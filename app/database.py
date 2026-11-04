import os
import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password123@db:5432/nombres_db")

# Lógica defensiva de reintentos de conexión (Retry Pattern)
def crear_motor_con_reintentos(url, max_intentos=5, espera_inicial=2):
    intentos = 0
    while intentos < max_intentos:
        try:
            logger.info(f"Intentando conectar a la base de datos (Intento {intentos + 1}/{max_intentos})...")
            engine_temp = create_engine(url)
            # Forzar un ping de red a la base de datos
            with engine_temp.connect() as conn:
                logger.info("¡Conexión establecida exitosamente con la base de datos!")
                return engine_temp
        except OperationalError as e:
            intentos += 1
            if intentos >= max_intentos:
                logger.error("Se agotaron los intentos de conexión a la base de datos.")
                raise e
            tiempo_espera = espera_inicial * intentos
            logger.warning(f"La base de datos no está lista. Reintentando en {tiempo_espera} segundos...")
            time.sleep(tiempo_espera)

engine = crear_motor_con_reintentos(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()