async function cargarPedidosAdmin() {
    try {
        const res = await fetch('/pedidos');
        const pedidos = await res.json();
        const contenedor = document.getElementById('listaPedidos');
        const badge = document.getElementById('counterBadge');
        
        contenedor.innerHTML = '';
        
        // Verificamos que el badge exista antes de modificarlo para evitar errores
        if (badge) {
            badge.textContent = pedidos.length;
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
                <h3 style="margin-top: 0; color: #8B0000;">Pedido #${p.id} - ${p.cliente}</h3>
                <p><strong>Método de Pago:</strong> ${p.metodo_pago.toUpperCase()}</p>
                <p><strong>Dirección (Google Maps):</strong> ${p.direccion_texto}</p>
                <p><strong>Detalle de Productos:</strong></p>
                ${itemsHtml}
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        document.getElementById('listaPedidos').innerHTML = '<p style="color: #ff6b6b; text-align: center;">Error al cargar los pedidos del servidor.</p>';
    }
}

// Cargar al iniciar y configurar actualización periódica (polling cada 10s)
cargarPedidosAdmin();
setInterval(cargarPedidosAdmin, 10000);