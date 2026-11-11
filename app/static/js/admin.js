async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const res = await fetch(`/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (res.ok) {
            cargarPedidosAdmin();
        } else {
            alert('Error al actualizar el estado del pedido.');
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

async function cargarPedidosAdmin() {
    try {
        const res = await fetch('/pedidos');
        const pedidos = await res.json();
        const contenedor = document.getElementById('listaPedidos');
        const badge = document.getElementById('counterBadge');
        
        contenedor.innerHTML = '';
        
        // Filtrar pendientes para el contador operativo
        const pendientes = pedidos.filter(p => p.estado === 'pendiente');
        if (badge) {
            badge.textContent = pendientes.length;
        }

        if (pedidos.length === 0) {
            contenedor.innerHTML = '<p style="color: #f8d7da; text-align: center;">No hay pedidos registrados actualmente.</p>';
            return;
        }

        pedidos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'pedido-card';

            let itemsHtml = '<ul style="margin: 5px 0; padding-left: 20px;">';
            p.items.forEach(i => {
                itemsHtml += `<li><strong>${i.cantidad}x</strong> [${i.tipo_producto.toUpperCase()}] - ${i.nombre_producto}</li>`;
            });
            itemsHtml += '</ul>';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #8B0000;">Pedido #${p.id} - ${p.cliente}</h3>
                    <span style="background: #333; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; color: #ffeb3b;">Estado: ${p.estado.toUpperCase()}</span>
                </div>
                <p style="margin: 8px 0;"><strong>Método de Pago:</strong> ${p.metodo_pago.toUpperCase()}</p>
                <p style="margin: 8px 0;"><strong>Dirección:</strong> ${p.direccion_texto}</p>
                <p style="margin: 8px 0;"><strong>Detalle:</strong></p>
                ${itemsHtml}
                <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="cambiarEstadoPedido(${p.id}, 'aceptado')" style="background: #28a745; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">Aceptar</button>
                    <button onclick="cambiarEstadoPedido(${p.id}, 'en_camino')" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">En Camino</button>
                    <button onclick="cambiarEstadoPedido(${p.id}, 'entregado')" style="background: #6c757d; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">Entregado</button>
                    <button onclick="cambiarEstadoPedido(${p.id}, 'cancelado')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">Cancelar</button>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        document.getElementById('listaPedidos').innerHTML = '<p style="color: #ff6b6b; text-align: center;">Error al cargar los pedidos del servidor.</p>';
    }
}

cargarPedidosAdmin();
setInterval(cargarPedidosAdmin, 10000);