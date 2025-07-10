import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const selectEstado = document.getElementById('select-filtro-estado');
  const inputBusqueda = document.getElementById('buscador');
  const phoneNumber = "8292308873"; // Número WhatsApp fijo

  // Cargar productos desde Supabase
  async function cargarTodosLosProductos() {
    try {
      // Asegurarnos que el contenedor está vacío antes de comenzar
      container.innerHTML = '<p>Cargando productos...</p>';

      const { data: productos, error } = await supabase
        .from('Productos')
        .select('*')
        .order('id', { ascending: false });

      // Verificación de error en la consulta
      if (error) throw new Error(error.message);
      if (!productos || productos.length === 0) {
        container.innerHTML = '<p>No hay productos publicados.</p>';
        return;
      }

      // Limpiar contenedor después de obtener los datos
      container.innerHTML = '';

      // Mostrar cada producto en el contenedor
      productos.forEach(p => {
        const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                            p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

        const imagenSrc = Array.isArray(p.imagen_url) && p.imagen_url.length > 0
                          ? p.imagen_url[0]  // Usar la primera imagen si es un array
                          : 'https://via.placeholder.com/300?text=Sin+imagen';  // Imagen predeterminada

        // Crear el elemento de producto
        const div = document.createElement('div');
        div.classList.add('product-card');
        div.classList.add(estadoClass);
        div.dataset.estado = estadoClass;

        div.innerHTML = `
          <h3 class="titulo">${p.titulo}</h3>
          <img class="main-image" 
               src="${imagenSrc}" 
               alt="${p.titulo}" 
               loading="lazy" 
               data-images='${JSON.stringify(p.imagen_url)}' />
          <p class="descripcion">
            <span class="short-desc">${p.descripcion.slice(0, 100)}</span>
            <span class="full-desc" style="display:none;">${p.descripcion}</span>
            ${p.descripcion.length > 100 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
          </p>
          <p><strong>Precio:</strong> $<span class="precio">${p.precio}</span></p>
          <p><strong>Estado:</strong> ${p.estado}</p>
          <p><strong>Vendedor:</strong> ${p.vendedor}</p>
          <button class="buy-button">💵 Comprar</button>
        `;
        container.appendChild(div);
      });

      activarToggleDescripcion();
      activarBotonesComprar();
      aplicarFiltros();
      activarLightbox();
    } catch (error) {
      // Manejamos el error y mostramos el mensaje de error
      container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
    }
  }

  // Función para alternar entre la descripción corta y larga
  function activarToggleDescripcion() {
    document.querySelectorAll('.toggle-desc').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const desc = btn.closest('.descripcion');
        const shortDesc = desc.querySelector('.short-desc');
        const fullDesc = desc.querySelector('.full-desc');
        const isExpanded = fullDesc.style.display === 'inline' || fullDesc.style.display === 'block';

        shortDesc.style.display = isExpanded ? 'inline' : 'none';
        fullDesc.style.display = isExpanded ? 'none' : 'inline';
        btn.textContent = isExpanded ? 'Ver más' : 'Ver menos';
      });
    });
  }

  // Configuración de botones "Comprar"
  function activarBotonesComprar() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();

        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        const productTitle = productCard.querySelector('.titulo').textContent.trim();
        const productPrice = productCard.querySelector('.precio').textContent.trim();
        const fullDescEl = productCard.querySelector('.full-desc');
        const productDescription = fullDescEl ? fullDescEl.textContent.trim() : '';

        const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${productTitle}\n- Precio: $${productPrice}\n- Descripción: ${productDescription}`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${mensajeCodificado}`;

        window.open(urlWhatsapp, '_blank');
      });
    });
  }

  // Aplicar filtros
  function aplicarFiltros() {
    const estadoSel = selectEstado?.value.toLowerCase() || 'todos';
    const textoBusq = inputBusqueda?.value.toLowerCase() || '';

    document.querySelectorAll('.product-card').forEach(card => {
      const estadoProd = card.dataset.estado || 'otro';
      const titulo = card.querySelector('.titulo')?.textContent.toLowerCase() || '';
      const descripcion = card.querySelector('.descripcion')?.textContent.toLowerCase() || '';

      const coincideEstado = estadoSel === 'todos' || estadoProd === estadoSel;
      const coincideTexto = titulo.includes(textoBusq) || descripcion.includes(textoBusq);

      card.style.display = (coincideEstado && coincideTexto) ? 'block' : 'none';
    });
  }

  // Event listeners para filtros
  selectEstado?.addEventListener('change', aplicarFiltros);
  inputBusqueda?.addEventListener('input', aplicarFiltros);

  // Cargar productos inicialmente
  cargarTodosLosProductos();
});
