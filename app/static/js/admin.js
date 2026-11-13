// Variable para almacenar los pedidos globales y procesar finanzas
let cachePedidos = [];

// Alternar entre vistas del panel de administración
function cambiarVistaAdmin(vista) {
    const comandasView = document.getElementById('comandasView');
    const ventasView = document.getElementById('ventasView');
    const botones = document.querySelectorAll('.admin-tab-btn');

    botones.forEach(b => b.classList.remove('active'));

    if (vista === 'comandas') {
        comandasView.style.display = 'block';
        ventasView.style.display = 'none';
        botones[0].classList.add('active');
    } else {
        comandasView.style.display = 'none';
        ventasView.style.display = 'block';
        botones[1].classList.add('active');
        calcularMetricasVentas(cachePedidos);
    }
}

async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const res = await fetch(`/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (res.ok) {
            cargarDatosAdmin();
        } else {
            alert('Error al actualizar el estado del pedido.');
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

async function cargarDatosAdmin() {
    try {
        const res = await fetch('/pedidos');
        const pedidos = await res.json();
        cachePedidos = pedidos; // Guardamos en caché para analítica

        renderizarComandas(pedidos);
        
        // Si el usuario está viendo la pestaña de ventas, actualizamos métricas al vuelo
        if (document.getElementById('ventasView').style.display === 'block') {
            calcularMetricasVentas(pedidos);
        }
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        document.getElementById('listaPedidos').innerHTML = '<p style="color: #ff6b6b; text-align: center;">Error al cargar los pedidos del servidor.</p>';
    }
}

function renderizarComandas(pedidos) {
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
        let subtotalCalculado = 0;
        
        if (p.items && Array.isArray(p.items)) {
            p.items.forEach(i => {
                const subItem = (i.precio_unitario || 0) * i.cantidad;
                subtotalCalculado += subItem;
                itemsHtml += `<li><strong>${i.cantidad}x</strong> [${i.tipo_producto.toUpperCase()}] - ${i.nombre_producto} ($${subItem.toFixed(2)})</li>`;
            });
        }
        itemsHtml += '</ul>';

        // Color distintivo según el estado
        let colorEstado = '#ffeb3b';
        if (p.estado === 'aceptado') colorEstado = '#28a745';
        if (p.estado === 'en_camino') colorEstado = '#17a2b8';
        if (p.estado === 'entregado') colorEstado = '#6c757d';
        if (p.estado === 'cancelado') colorEstado = '#dc3545';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #8B0000;">Pedido #${p.id} - ${p.nombre_cliente || p.cliente || 'Cliente'}</h3>
                <span style="background: #333; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; color: ${colorEstado}; font-weight: bold;">Estado: ${p.estado.toUpperCase()}</span>
            </div>
            <p style="margin: 8px 0;"><strong>Método de Pago:</strong> ${(p.metodo_pago || 'efectivo').toUpperCase()}</p>
            <p style="margin: 8px 0;"><strong>Dirección:</strong> ${p.direccion_texto || 'No especificada'}</p>
            <p style="margin: 8px 0;"><strong>Detalle de Comanda:</strong></p>
            ${itemsHtml}
            <div style="margin-top: 8px; font-size: 14px; font-weight: bold; color: #333;">
                Total estimado: $${subtotalCalculado.toFixed(2)} MXN
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="cambiarEstadoPedido(${p.id}, 'aceptado')" style="background: #28a745; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Aceptar</button>
                <button onclick="cambiarEstadoPedido(${p.id}, 'en_camino')" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">En Camino</button>
                <button onclick="cambiarEstadoPedido(${p.id}, 'entregado')" style="background: #6c757d; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Entregado</button>
                <button onclick="cambiarEstadoPedido(${p.id}, 'cancelado')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Cancelar</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function calcularMetricasVentas(pedidos) {
    let ventasHoy = 0;
    let ventasSemana = 0;
    let totalComandasValidas = 0;
    let sumaTotalIngresos = 0;

    const contenedorHistorico = document.getElementById('listaVentasHistorico');
    contenedorHistorico.innerHTML = '';

    if (pedidos.length === 0) {
        contenedorHistorico.innerHTML = '<p style="color: #888; text-align: center; font-style: italic;">No hay registros de ventas.</p>';
        document.getElementById('metricHoy').textContent = '$0.00 MXN';
        document.getElementById('metricTicket').textContent = '$0.00 MXN';
        document.getElementById('metricSemana').textContent = '$0.00 MXN';
        return;
    }

    // Filtrar pedidos que no estén cancelados para el cálculo financiero real
    const pedidosValidos = pedidos.filter(p => p.estado !== 'cancelado');

    pedidosValidos.forEach(p => {
        let totalPedido = 0;
        if (p.items && Array.isArray(p.items)) {
            p.items.forEach(i => {
                totalPedido += (i.precio_unitario || 0) * i.cantidad;
            });
        }

        sumaTotalIngresos += totalPedido;
        totalComandasValidas++;

        // Sumarización simulada/estándar (ej. sumamos al acumulado semanal general)
        ventasSemana += totalPedido;
        ventasHoy += totalPedido; // Ajustable si el backend provee timestamps reales por fecha

        // Renderizar tarjeta en el histórico
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.style.margin = '8px 0';
        itemRow.innerHTML = `
            <span><strong>#${p.id}</strong> - ${p.nombre_cliente || p.cliente || 'Cliente'} (${p.estado.toUpperCase()})</span>
            <span style="color: #d9534f; font-weight: bold;">$${totalPedido.toFixed(2)} MXN</span>
        `;
        contenedorHistorico.appendChild(itemRow);
    });

    const ticketPromedio = totalComandasValidas > 0 ? (sumaTotalIngresos / totalComandasValidas) : 0;

    // Inyectar en el DOM del panel de finanzas
    document.getElementById('metricHoy').textContent = `$${ventasHoy.toFixed(2)} MXN`;
    document.getElementById('metricTicket').textContent = `$${ticketPromedio.toFixed(2)} MXN`;
    document.getElementById('metricSemana').textContent = `$${ventasSemana.toFixed(2)} MXN`;
}

// Inicialización y Polling Automático cada 10 segundos
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosAdmin();
    setInterval(cargarDatosAdmin, 10000);
});