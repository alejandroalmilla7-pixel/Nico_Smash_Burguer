from pydantic import BaseModel
from typing import List, Optional

class ItemPedidoSchema(BaseModel):
    tipo_producto: str    # "hamburguesa", "papas", "refresco"
    nombre_producto: str  # "Doble con queso", "Francesas", "Manzana Light"
    cantidad: int         # 1, 3, 6, 4, etc.

class PedidoCreateSchema(BaseModel):
    nombre_cliente: str
    metodo_pago: str      # "efectivo" o "transferencia"
    
    # Dirección de Google Maps
    direccion_texto: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    
    # La lista de productos que el usuario está comprando (¡Aquí está la flexibilidad!)
    items: List[ItemPedidoSchema]

    class Config:
        from_attributes = True