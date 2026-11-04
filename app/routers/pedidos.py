from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, Pedido, DetallePedido
from app.schemas import PedidoCreateSchema

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.post("")
def crear_pedido(data: PedidoCreateSchema, db: Session = Depends(get_db)):
    # 1. Buscar o registrar al cliente
    usuario = db.query(Usuario).filter(Usuario.nombre == data.nombre_cliente).first()
    if not usuario:
        usuario = Usuario(nombre=data.nombre_cliente)
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    # 2. Crear cabecera del pedido (incluyendo método de pago y dirección de mapas)
    nuevo_pedido = Pedido(
        usuario_id=usuario.id,
        metodo_pago=data.metodo_pago,
        direccion_texto=data.direccion_texto,
        latitud=data.latitud,
        longitud=data.longitud
    )
    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)

    # 3. Registrar los ítems del pedido (soporta cantidades múltiples por tipo de producto)
    for item in data.items:
        nuevo_detalle = DetallePedido(
            pedido_id=nuevo_pedido.id,
            tipo_producto=item.tipo_producto,
            nombre_producto=item.nombre_producto,
            cantidad=item.cantidad
        )
        db.add(nuevo_detalle)
    
    db.commit()
    return {"message": "Pedido registrado exitosamente", "pedido_id": nuevo_pedido.id}

@router.get("")
def listar_pedidos(db: Session = Depends(get_db)):
    # Retorna los pedidos incluyendo los datos del cliente y los detalles asociados
    pedidos = db.query(Pedido).all()
    resultado = []
    for p in pedidos:
        resultado.append({
            "id": p.id,
            "cliente": p.cliente.nombre if p.cliente else "Desconocido",
            "metodo_pago": p.metodo_pago,
            "direccion_texto": p.direccion_texto,
            "items": [
                {
                    "tipo_producto": d.tipo_producto,
                    "nombre_producto": d.nombre_producto,
                    "cantidad": d.cantidad
                } for d in p.detalles
            ]
        })
    return resultado