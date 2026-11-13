import sys

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Producto

def seed_productos(db: Session):
    # Menú inicial extraído exactamente de la información oficial del sistema
    menu_inicial = [
        # --- CATEGORÍA: Smash ---
        {
            "categoria": "Papas",
            "nombre": "Papas Smash",
            "descripcion": "300 g de papas a la francesa, aderezo de la casa, 75 g de carne, doble queso americano y trozos de tocino",
            "precio": 165.00
        },
        {
            "categoria": "Papas",
            "nombre": "Orden de papas",
            "descripcion": "300 g de papas fritas a la francesa",
            "precio": 85.00
        },
        {
            "categoria": "Smash",
            "nombre": "Cheesy",
            "descripcion": "150 g de carne smash, 2 rebanadas de queso americano y aderezo especial de la casa",
            "precio": 165.00
        },
        {
            "categoria": "Smash",
            "nombre": "Bacon Cheesy",
            "descripcion": "150 g de carne smash, doble queso americano, tocino crujiente y aderezo de la casa",
            "precio": 175.00
        },
        {
            "categoria": "Smash",
            "nombre": "Hawaiana",
            "descripcion": "150 g de carne smash, doble queso americano, piña asada y aderezo de la casa",
            "precio": 175.00
        },
        {
            "categoria": "Smash",
            "nombre": "Bacon Jam",
            "descripcion": "150 g de carne smash, doble queso americano, mermelada de tocino artesanal y aderezo especial",
            "precio": 209.00
        },

        # --- CATEGORÍA: Sodas Italianas ---
        {
            "categoria": "Sodas Italianas",
            "nombre": "Soda Cereza",
            "descripcion": "Agua mineral, hielo, jarabe de cereza y perlas explosivas",
            "precio": 80.00
        },
        {
            "categoria": "Sodas Italianas",
            "nombre": "Soda Kiwi",
            "descripcion": "Agua mineral, hielo, jarabe de kiwi y perlas explosivas",
            "precio": 80.00
        },

        # --- CATEGORÍA: Refrescos ---
        {
            "categoria": "Refrescos",
            "nombre": "Coca Cola Regular",
            "descripcion": "",
            "precio": 30.00
        },
        {
            "categoria": "Refrescos",
            "nombre": "Coca Cola Zero",
            "descripcion": "",
            "precio": 30.00
        },
        {
            "categoria": "Refrescos",
            "nombre": "Fanta de Fresa",
            "descripcion": "",
            "precio": 30.00
        }
    ]

    print("[SEEDS] Verificando estado del catálogo de productos...")
    
    productos_agregados = 0
    for item in menu_inicial:
        # Verificar si el producto ya existe por su nombre exacto para evitar duplicados
        existe = db.query(Producto).filter(Producto.nombre == item["nombre"]).first()
        if not existe:
            db_producto = Producto(
                categoria=item["categoria"],
                nombre=item["nombre"],
                descripcion=item["descripcion"],
                precio=item["precio"]
            )
            db.add(db_producto)
            productos_agregados += 1

    db.commit()
    print(f"[SEEDS] Proceso finalizado. Se insertaron {productos_agregados} nuevos productos en el menú.")

if __name__ == "__main__":
    # Asegurar que las tablas existan antes de sembrar
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_productos(db)
    except Exception as e:
        print(f"[ERROR SEEDS] Ocurrió un error al poblar la base de datos: {e}")
        sys.exit(1)
    finally:
        db.close()