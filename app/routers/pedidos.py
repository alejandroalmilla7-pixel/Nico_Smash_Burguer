from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Usuario, Pedido, DetallePedido
from app.schemas import PedidoCreateSchema, PedidoResponseSchema, PedidoUpdateEstadoSchema

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreateSchema, db: Session = Depends(get_db)):
    # Buscar o crear el usuario cliente de manera transaccional
    usuario = db.query(Usuario).filter(Usuario.nombre == data.nombre_cliente).first()
    if not usuario:
        usuario = Usuario(nombre=data.nombre_cliente)
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # Crear la entidad principal del pedido
    nuevo_pedido = Pedido(
        usuario_id=usuario.id,
        metodo_pago=data.metodo_pago,
        estado="pendiente",
        direccion_texto=data.direccion_texto,
        latitud=data.latitud,
        longitud=data.longitud
    )
    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)

    # Registrar los detalles (ítems) del pedido
    for item in data.items:
        nuevo_detalle = DetallePedido(
            pedido_id=nuevo_pedido.id,
            tipo_producto=item.tipo_producto,
            nombre_producto=item.nombre_producto,
            cantidad=item.cantidad
        )
        db.add(nuevo_detalle)
    
    db.commit()
    return {"message": "Pedido registrado exitosamente", "pedido_id": nuevo_pedido.id, "estado": nuevo_pedido.estado}

@router.get("", response_model=List[PedidoResponseSchema])
def listar_pedidos(estado: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Pedido)
    if estado:
        query = query.filter(Pedido.estado == estado)
    
    # Retorna directamente los objetos ORM; Pydantic se encarga de serializarlos limpiamente
    return query.order_by(Pedido.fecha_creacion.desc()).all()

@router.patch("/{pedido_id}/estado", response_model=dict)
def actualizar_estado_pedido(pedido_id: int, data: PedidoUpdateEstadoSchema, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    
    pedido.estado = data.estado
    db.commit()
    return {"message": f"Estado actualizado a {pedido.estado}", "pedido_id": pedido.id, "estado": pedido.estado}