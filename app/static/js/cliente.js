let menuProductos = {};
let carrito = [];
let categoriaActual = 'Smash';

// Funciones de Control de Vistas
function iniciarPedido() {
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('mainAppView').style.display = 'block';
}

function volverAlInicio() {
    document.getElementById('mainAppView').style.display = 'none';
    document.getElementById('landingView').style.display = 'flex';
}

function toggleCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

async function cargarCatalogo() {
    try {
        const res = await fetch('/productos');
        const productos = await res.json();
        
        const smashProds = productos.filter(p => p.categoria === 'Smash');

        menuProductos = {
            'Smash': smashProds,
            'Papas': productos.filter(p => p.categoria === 'Papas'),
            'Sodas Italianas': productos.filter(p => p.categoria === 'Sodas Italianas'),
            'Refrescos': productos.filter(p => p.categoria === 'Refrescos')
        };

        // Renderizar la tarjeta gancho superior (por ejemplo, la primera hamburguesa Smash)
        if (smashProds.length > 0) {
            renderizarFavorita(smashProds[0]);
        }

        cambiarCategoria('Smash');
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
    }
}

function renderizarFavorita(prod) {
    const container = document.getElementById('featuredProductContainer');
    container.innerHTML = `
        <div class="product-card favorite-card hero-favorite">
            <span class="badge-favorite">★ Favorita de la Casa</span>
            <div class="product-info">
                <h4>${prod.nombre}</h4>
                <p>${prod.descripcion}</p>
                <div class="product-price">$${prod.precio.toFixed(2)} MXN</div>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito('${prod.categoria}', '${prod.nombre}', ${prod.precio})">+ Agregar</button>
        </div>
    `;
}

function cambiarCategoria(categoria) {
    categoriaActual = categoria;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    
    const botonActivo = Array.from(document.querySelectorAll('.cat-btn')).find(b => b.getAttribute('onclick').includes(categoria));
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    const container = document.getElementById('catalogContainer');
    container.innerHTML = '';

    if (!menuProductos[categoria] || menuProductos[categoria].length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; font-style: italic;">No hay productos disponibles en esta categoría.</p>';
        return;
    }

    menuProductos[categoria].forEach((prod) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-info">
                <h4>${prod.nombre}</h4>
                <p>${prod.descripcion}</p>
                <div class="product-price">$${prod.precio.toFixed(2)} MXN</div>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito('${prod.categoria}', '${prod.nombre}', ${prod.precio})">+ Agregar</button>
        `;
        container.appendChild(card);
    });
}

function agregarAlCarrito(tipo, nombre, precio) {
    const itemExistente = carrito.find(item => item.nombre_producto === nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            tipo_producto: tipo,
            nombre_producto: nombre,
            precio_unitario: precio,
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
    const floatingBar = document.getElementById('floatingCartBar');
    const cartItemCount = document.getElementById('cartItemCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    
    lista.innerHTML = '';

    if (carrito.length === 0) {
        lista.innerHTML = '<p class="empty-cart">No hay productos seleccionados aún.</p>';
        submitBtn.disabled = true;
        floatingBar.style.display = 'none';
        return;
    }

    submitBtn.disabled = false;
    floatingBar.style.display = 'flex';

    let totalItems = 0;
    let precioTotal = 0;

    carrito.forEach(item => {
        totalItems += item.cantidad;
        precioTotal += (item.precio_unitario * item.cantidad);

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

    cartItemCount.innerText = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    cartTotalPrice.innerText = `$${precioTotal.toFixed(2)} MXN`;
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
        items: carrito.map(i => ({
            tipo_producto: i.tipo_producto,
            nombre_producto: i.nombre_producto,
            cantidad: i.cantidad
        }))
    };

    try {
        const response = await fetch('/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('¡Pedido realizado con éxito! Comanda enviada a cocina.');
            carrito = [];
            document.getElementById('pedidoForm').reset();
            actualizarVistaCarrito();
            toggleCartModal();
            volverAlInicio();
        } else {
            alert('Hubo al registrar el pedido.');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
}); 