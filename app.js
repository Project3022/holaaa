// main.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const selectEstado = document.getElementById('select-filtro-estado');
  const inputBusqueda = document.getElementById('buscador');
  const phoneNumber = "8292308873";
async function cargarTodosLosProductos() {
  container.innerHTML = '<p>Cargando productos...</p>';

  const { data: productos, error } = await supabase
    .from('Productos')
    .select('*');

  if (error) {
    container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
    return;
  }
  if (!productos || productos.length === 0) {
    container.innerHTML = '<p>No hay productos publicados.</p>';
    return;
  }

  productos.sort(() => Math.random() - 0.5);

  container.innerHTML = '';

  productos.forEach(p => {
    const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                        p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

    const descripcionCompleta = p.descripcion || '';
    const descripcionCorta = descripcionCompleta.length > 100
      ? descripcionCompleta.slice(0, 100) + '...'
      : descripcionCompleta;

    let imagenUrls = [];
    if (p.imagen_url) {
      imagenUrls = p.imagen_url.split(',').map(url => url.trim());
    }

    const phoneNumber = p.whatsapp || "8292308873";

    const div = document.createElement('div');
    div.classList.add('product-card', estadoClass);
    div.dataset.estado = estadoClass;

div.innerHTML = `
  <h3 class="titulo">${p.titulo}</h3>
  <div class="imagenes-producto">
    ${imagenUrls.length > 0
      ? `<img src="${imagenUrls[0]}" alt="${p.titulo}" class="product-image" loading="lazy" data-images='${JSON.stringify(imagenUrls)}' />`
      : `<img src="https://via.placeholder.com/300?text=Sin+imagen" alt="${p.titulo}" />`}
  </div>
  <p class="descripcion">
    <span class="short-desc">${descripcionCorta}</span>
    <span class="full-desc" style="display:none;">${descripcionCompleta}</span>
    ${descripcionCompleta.length > 100 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
  </p>
  <p><strong>Precio:</strong> $<span class="precio">${p.precio}</span></p>
  <p><strong>Estado:</strong> ${p.estado}</p>
  <p><strong>Vendedor:</strong> ${p.vendedor}</p>
  <button class="buy-button" data-whatsapp="${phoneNumber}">💵 Comprar</button>
`;


    container.appendChild(div);
  });

  activarToggleDescripcion();
  activarBotonesComprar();
  aplicarFiltros();
}



function activarToggleDescripcion() {
  document.querySelectorAll('.toggle-desc').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

      const desc = btn.closest('.descripcion');
      desc.classList.toggle('expandida');

      const isExpanded = desc.classList.contains('expandida');
      btn.textContent = isExpanded ? 'Ver menos' : 'Ver más';
    });
  });
}


  function activarBotonesComprar() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();

        const productCard = e.target.closest('.product-card');
        const title = productCard.querySelector('.titulo').textContent.trim();
        const price = productCard.querySelector('.precio').textContent.trim();
        const description = productCard.querySelector('.full-desc').textContent.trim();

        const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${title}\n- Precio: $${price}\n- Descripción: ${description}`;
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsapp, '_blank');
      });
    });
  }

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

  selectEstado?.addEventListener('change', aplicarFiltros);
  inputBusqueda?.addEventListener('input', aplicarFiltros);

  cargarTodosLosProductos();
});

