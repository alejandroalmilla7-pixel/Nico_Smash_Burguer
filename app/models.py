from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    
    pedidos = relationship("Pedido", back_populates="cliente")

class Administrador(Base):
    __tablename__ = "administradores"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String, nullable=False, index=True)  # "hamburguesas", "papas", "bebidas", etc.
    nombre = Column(String, unique=True, nullable=False)
    descripcion = Column(String, nullable=False)
    precio = Column(Float, nullable=False)

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    metodo_pago = Column(String, nullable=False)  # "efectivo" o "transferencia"
    estado = Column(String, nullable=False, default="pendiente") # "pendiente", "aceptado", "en_camino", "entregado", "cancelado"
    direccion_texto = Column(String, nullable=False) 
    latitud = Column(Float, nullable=True)          
    longitud = Column(Float, nullable=True)         
    
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    cliente = relationship("Usuario", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")

    @property
    def cliente_nombre(self) -> str:
        """Propiedad auxiliar para exponer el nombre del cliente como string al serializar."""
        return self.cliente.nombre if self.cliente else "Desconocido"

class DetallePedido(Base):
    __tablename__ = "detalles_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    
    tipo_producto = Column(String, nullable=False)  
    nombre_producto = Column(String, nullable=False) 
    cantidad = Column(Integer, nullable=False, default=1) 

    pedido = relationship("Pedido", back_populates="detalles")