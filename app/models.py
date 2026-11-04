from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    
    pedidos = relationship("Pedido", back_populates="cliente")

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    # Datos generales del envío y pago
    metodo_pago = Column(String, nullable=False)  # "efectivo" o "transferencia"
    direccion_texto = Column(String, nullable=False) # Dirección formateada de Google Maps
    latitud = Column(Float, nullable=True)          # Opcional
    longitud = Column(Float, nullable=True)         # Opcional

    # Relaciones
    cliente = relationship("Usuario", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")

class DetallePedido(Base):
    __tablename__ = "detalles_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    
    tipo_producto = Column(String, nullable=False)  # Ej: "hamburguesa", "papas", "refresco"
    nombre_producto = Column(String, nullable=False) # Ej: "Doble con tocino", "Gajo", "Cola Zero"
    cantidad = Column(Integer, nullable=False, default=1) # ¡Aquí permites 3, 6, 4 unidades!

    pedido = relationship("Pedido", back_populates="detalles")