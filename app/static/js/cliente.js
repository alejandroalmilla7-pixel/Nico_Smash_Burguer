let menuProductos = {};
let carrito = [];
let categoriaActual = 'Smash';

async function cargarCatalogo() {
    try {
        const res = await fetch('/productos');
        const productos = await res.json();
        
        menuProductos = {
            'Smash': productos.filter(p => p.categoria === 'Smash'),
            'Sodas Italianas': productos.filter(p => p.categoria === 'Sodas Italianas'),
            'Refrescos': productos.filter(p => p.categoria === 'Refrescos')
        };
        cambiarCategoria('Smash');
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
    }
}

function cambiarCategoria(categoria) {
    categoriaActual = categoria;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    
    // Identificar el botón activo de forma robusta
    const botonActivo = Array.from(document.querySelectorAll('.cat-btn')).find(b => b.getAttribute('onclick').includes(categoria));
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    const container = document.getElementById('catalogContainer');
    container.innerHTML = '';

    if (!menuProductos[categoria]) return;

    menuProductos[categoria].forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-info">
                <h4>${prod.nombre}</h4>
                <p>${prod.descripcion}</p>
                <div class="product-price">$${prod.precio.toFixed(2)} MXN</div>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito('${prod.categoria}', '${prod.nombre}')">+ Agregar</button>
        `;
        container.appendChild(card);
    });
}

function agregarAlCarrito(tipo, nombre) {
    const itemExistente = carrito.find(item => item.nombre_producto === nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            tipo_producto: tipo,
            nombre_producto: nombre,
            cantidad: 1
        });
    }
    actualizarVistaCarrito();
}

function cambiarCantidad(nombre, delta) {
    const item = carrito.find(i => i.nombre_producto === nombre);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(i => i.nombre_producto !== nombre);
        }
    }
    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('cartItemsList');
    const submitBtn = document.getElementById('submitOrderBtn');
    lista.innerHTML = '';

    if (carrito.length === 0) {
        lista.innerHTML = '<p class="empty-cart">No hay productos seleccionados aún.</p>';
        submitBtn.disabled = true;
        return;
    }

    submitBtn.disabled = false;

    carrito.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <span><strong>${item.cantidad}x</strong> ${item.nombre_producto}</span>
            <div>
                <button type="button" onclick="cambiarCantidad('${item.nombre_producto}', -1)" style="padding: 2px 6px;">-</button>
                <button type="button" onclick="cambiarCantidad('${item.nombre_producto}', 1)" style="padding: 2px 6px;">+</button>
            </div>
        `;
        lista.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
});

document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre_cliente: document.getElementById('nombreCliente').value,
        metodo_pago: document.getElementById('metodoPago').value,
        direccion_texto: document.getElementById('direccionTexto').value,
        latitud: null,
        longitud: null,
        items: carrito
    };

    try {
        const response = await fetch('/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('¡Pedido realizado con éxito!');
            carrito = [];
            document.getElementById('pedidoForm').reset();
            actualizarVistaCarrito();
        } else {
            alert('Hubo un error al registrar el pedido.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
});