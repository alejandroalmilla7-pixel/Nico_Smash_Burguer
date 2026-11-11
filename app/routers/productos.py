from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Producto
from app.schemas import ProductoResponseSchema

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

CATALOGO_INICIAL = [
    {"categoria": "hamburguesas", "nombre": "Bacon Jam", "descripcion": "La favorita de la casa con mermelada de tocino.", "precio": 209.0},
    {"categoria": "hamburguesas", "nombre": "Cheesy", "descripcion": "Nuestra clásica e irresistible con doble queso.", "precio": 175.0},
    {"categoria": "papas", "nombre": "Orden de Papas", "descripcion": "Crujientes papas a la francesa.", "precio": 85.0},
    {"categoria": "papas", "nombre": "Papas Smash", "descripcion": "Con 75g de carne smash, queso y aderezo especial.", "precio": 165.0},
    {"categoria": "bebidas", "nombre": "Soda Italiana", "descripcion": "Preparada al momento con sabores frutales.", "precio": 80.0},
    {"categoria": "bebidas", "nombre": "Refresco 600 ml", "descripcion": "Bien frío en presentación de 600ml.", "precio": 30.0}
]

def sembrar_productos_iniciales(db: Session):
    """Inserta el catálogo base de forma idempotente si la tabla está vacía."""
    conteo = db.query(Producto).count()
    if conteo == 0:
        for item in CATALOGO_INICIAL:
            db.add(Producto(**item))
        db.commit()

@router.get("", response_model=List[ProductoResponseSchema])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(Producto).all()