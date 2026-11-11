from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class ProductoResponseSchema(BaseModel):
    id: int
    categoria: str
    nombre: str
    descripcion: str
    precio: float

    model_config = ConfigDict(from_attributes=True)

class ItemPedidoSchema(BaseModel):
    tipo_producto: str = Field(..., description="Categoría del producto")
    nombre_producto: str = Field(..., description="Nombre específico del producto")
    cantidad: int = Field(..., gt=0)

    model_config = ConfigDict(from_attributes=True)

class PedidoCreateSchema(BaseModel):
    nombre_cliente: str = Field(..., min_length=2, max_length=100)
    metodo_pago: str = Field(..., pattern="^(efectivo|transferencia)$")
    direccion_texto: str = Field(..., min_length=5)
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    items: List[ItemPedidoSchema] = Field(..., min_items=1)

    model_config = ConfigDict(from_attributes=True)

class ItemPedidoResponseSchema(ItemPedidoSchema):
    id: int

class PedidoResponseSchema(BaseModel):
    id: int
    # Mapea automáticamente desde la propiedad 'cliente_nombre' del modelo SQLAlchemy
    cliente: str = Field(validation_alias="cliente_nombre")
    metodo_pago: str
    estado: str
    direccion_texto: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    fecha_creacion: datetime
    
    # Mapea automáticamente desde la relación 'detalles' del modelo SQLAlchemy
    items: List[ItemPedidoResponseSchema] = Field(validation_alias="detalles")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class PedidoUpdateEstadoSchema(BaseModel):
    estado: str = Field(..., pattern="^(pendiente|aceptado|en_camino|entregado|cancelado)$")

    model_config = ConfigDict(from_attributes=True)