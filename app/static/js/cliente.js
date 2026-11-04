// Definición del menú de productos basado en tus capturas
const menuProductos = {
    hamburguesas: [
        { nombre: "Bacon Jam", descripcion: "La favorita de la casa con mermelada de tocino.", precio: 209 },
        { nombre: "Cheesy", descripcion: "Nuestra clásica e irresistible con doble queso.", precio: 175 }
    ],
    papas: [
        { nombre: "Orden de Papas", descripcion: "Crujientes papas a la francesa.", precio: 85 },
        { nombre: "Papas Smash", descripcion: "Con 75g de carne smash, queso y aderezo especial.", precio: 165 }
    ],
    bebidas: [
        { nombre: "Soda Italiana", descripcion: "Preparada al momento con sabores frutales.", precio: 80 },
        { nombre: "Refresco 600 ml", descripcion: "Bien frío en presentación de 600ml.", precio: 30 }
    ]
};

// Estado del carrito de compras
let carrito = [];
let categoriaActual = 'hamburguesas';

// Renderizar el catálogo según la categoría seleccionada
function cambiarCategoria(categoria) {
    categoriaActual = categoria;
    
    // Actualizar botones activos
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const container = document.getElementById('catalogContainer');
    container.innerHTML = '';

    menuProductos[categoria].forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-info">
                <h4>${prod.nombre}</h4>
                <p>${prod.descripcion}</p>
                <div class="product-price">$${prod.precio} MXN</div>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito('${categoria}', '${prod.nombre}')">+ Agregar</button>
        `;
        container.appendChild(card);
    });
}

// Agregar un producto al carrito
function agregarAlCarrito(tipo, nombre) {
    const itemExistente = carrito.find(item => item.nombre_producto === nombre);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            tipo_producto: tipo === 'bebidas' ? 'refresco' : (tipo === 'papas' ? 'papas' : 'hamburguesa'),
            nombre_producto: nombre,
            cantidad: 1
        });
    }
    actualizarVistaCarrito();
}

// Modificar cantidad o eliminar del carrito
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

// Actualizar la interfaz HTML del carrito
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

// Inicializar la vista al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cambiarCategoria('hamburguesas');
});

// Enviar el pedido completo al backend FastAPI
document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_cliente = document.getElementById('nombreCliente').value;
    const metodo_pago = document.getElementById('metodoPago').value;
    const direccion_texto = document.getElementById('direccionTexto').value;

    const payload = {
        nombre_cliente,
        metodo_pago,
        direccion_texto,
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
            alert('¡Pedido realizado con éxito! La comanda ha sido enviada.');
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