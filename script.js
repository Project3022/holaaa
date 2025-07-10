document.addEventListener("DOMContentLoaded", () => {
  // --- Filtro por estado y búsqueda ---
  const selectEstado = document.getElementById("select-filtro-estado");
  const inputBusqueda = document.getElementById("buscador");

  const aplicarFiltros = () => {
    const estadoSeleccionado = selectEstado?.value.toLowerCase() || "todos";
    const textoBusqueda = inputBusqueda?.value.toLowerCase() || "";

    const productos = document.querySelectorAll(".product-card");

    productos.forEach(producto => {
      const claseEstado = producto.classList.contains("nuevo") ? "nuevo" :
                          producto.classList.contains("usado") ? "usado" : "otro";
      const titulo = producto.querySelector(".titulo").textContent.toLowerCase();
      const descripcion = producto.querySelector(".descripcion").textContent.toLowerCase();

      const coincideEstado = estadoSeleccionado === "todos" || claseEstado === estadoSeleccionado;
      const coincideTexto = titulo.includes(textoBusqueda) || descripcion.includes(textoBusqueda);

      producto.style.display = (coincideEstado && coincideTexto) ? "block" : "none";
    });
  };

  selectEstado?.addEventListener("change", aplicarFiltros);
  inputBusqueda?.addEventListener("input", aplicarFiltros);

  // --- Botones de compra por WhatsApp ---
  const phoneNumber = "8292308873";
  const buyButtons = document.querySelectorAll(".buy-button");

  buyButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const productCard = e.target.closest(".product-card");
      if (!productCard) return;

      const productTitle = productCard.querySelector(".titulo").textContent.trim();
      const productPrice = productCard.querySelector(".precio").textContent.trim();
      const productDescription = productCard.querySelector(".descripcion").textContent.trim();

      const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${productTitle}\n- Precio: ${productPrice}\n- Descripción: ${productDescription}`;
      const mensajeCodificado = encodeURIComponent(mensaje);
      const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${mensajeCodificado}`;

      window.open(urlWhatsapp, "_blank");
    });
  });

  // --- Abrir/Cerrar Menú Lateral ---
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');

  if (menuToggle && sideMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sideMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      const isClickInsideMenu = sideMenu.contains(e.target);
      const isClickOnToggle = menuToggle.contains(e.target);

      if (!isClickInsideMenu && !isClickOnToggle) {
        sideMenu.classList.remove('open');
      }
    });
  }

  // --- Submenú de botones (si tienes alguno con .submenu-buttons) ---
  const buttons = document.querySelectorAll('.submenu-buttons button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const targetPage = button.getAttribute('data-url');
      window.location.href = targetPage;
    });
  });

  // --- Lightbox (si tienes imágenes con .main-image) ---
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.querySelector(".lightbox-image");
  const closeBtn = document.querySelector(".close-btn");
  let currentImages = [];
  let currentIndex = 0;

  if (lightbox && lightboxImg && closeBtn) {
    document.querySelectorAll('.main-image').forEach(img => {
      img.addEventListener('click', () => {
        currentImages = JSON.parse(img.dataset.images);
        currentIndex = 0;
        lightboxImg.src = currentImages[currentIndex];
        lightbox.style.display = "flex";
      });
    });

    lightbox.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      lightbox.style.display = "none";
    });
  }

  // --- Marcar enlace activo en el menú lateral ---
  const enlaces = document.querySelectorAll(".side-menu a");
  const paginaActual = window.location.pathname.split("/").pop();

  enlaces.forEach(enlace => {
    const href = enlace.getAttribute("href");
    if (href && href.includes(paginaActual)) {
      enlace.classList.add("active");
    }
  });

  // --- Ordenar tarjetas al azar ---
  const container = document.querySelector(".container");
  const cards = Array.from(container?.children || []);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  container.innerHTML = "";
  cards.forEach(card => container.appendChild(card));
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-desc').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.closest('.descripcion');
      const shortDesc = parent.querySelector('.short-desc');
      const fullDesc = parent.querySelector('.full-desc');

      const isExpanded = fullDesc.style.display === 'inline';
      
      shortDesc.style.display = isExpanded ? 'inline' : 'none';
      fullDesc.style.display = isExpanded ? 'none' : 'inline';
      this.textContent = isExpanded ? 'Ver más' : 'Ver menos';
    });
  });
});

// Crear cliente Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const selectEstado = document.getElementById('select-filtro-estado');
  const inputBusqueda = document.getElementById('buscador');
  const phoneNumber = "8292308873"; // Número fijo WhatsApp

  async function cargarTodosLosProductos() {
    container.innerHTML = '<p>Cargando productos...</p>';

    const { data: productos, error } = await supabase
      .from('Productos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      container.innerHTML = `<p>Error cargando productos: ${error.message}</p>`;
      return;
    }
    if (!productos || productos.length === 0) {
      container.innerHTML = '<p>No hay productos publicados.</p>';
      return;
    }

    container.innerHTML = '';

    productos.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

      const descripcionCorta = p.descripcion.length > 100 ? p.descripcion.slice(0, 100) + '...' : p.descripcion;
      const descripcionCompleta = p.descripcion;

      const div = document.createElement('div');
      div.classList.add('product-card');
      if (estadoClass) div.classList.add(estadoClass);
      div.dataset.estado = estadoClass || 'otro';

  div.innerHTML = `
  <h3 class="titulo">${p.titulo}</h3>
  <img class="product-image" src="${p.imagen_url || 'https://via.placeholder.com/300?text=Sin+imagen'}" alt="${p.titulo}" loading="lazy" />
  <p class="descripcion">
    <span class="short-desc">${p.descripcion.slice(0, 100)}</span>
    <span class="full-desc" style="display:none;">${p.descripcion}</span>
    ${p.descripcion.length > 100 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
  </p>
  <p><strong>Precio:</strong> $<span class="precio">${p.precio}</span></p>
  <p><strong>Estado:</strong> ${p.estado}</p>
  <p><strong>Vendedor:</strong> ${p.vendedor}</p> <!-- ← esta línea es nueva -->
  <button class="buy-button">💵 Comprar</button>
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
        const shortDesc = desc.querySelector('.short-desc');
        const fullDesc = desc.querySelector('.full-desc');
        const isExpanded = fullDesc.style.display === 'inline' || fullDesc.style.display === 'block';

        shortDesc.style.display = isExpanded ? 'inline' : 'none';
        fullDesc.style.display = isExpanded ? 'none' : 'inline';
        btn.textContent = isExpanded ? 'Ver más' : 'Ver menos';
      });
    });
  }

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

  // Eventos filtros
  selectEstado?.addEventListener('change', aplicarFiltros);
  inputBusqueda?.addEventListener('input', aplicarFiltros);

  // Carga inicial
  cargarTodosLosProductos();
});

document.addEventListener('DOMContentLoaded', () => {
  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const closeBtn = document.querySelector('.close-btn');

  let currentImages = [];
  let currentIndex = 0;

  document.querySelectorAll('.main-image').forEach(img => {
    img.addEventListener('click', () => {
      try {
        // Intentamos parsear el data-images
        currentImages = JSON.parse(img.dataset.images);
        
        // Validar URLs de las imágenes
        currentImages = currentImages.filter(url => {
          try {
            new URL(url); // Si la URL no es válida, la descartamos
            return true;
          } catch (e) {
            return false;
          }
        });

        // Si no es un array válido o está vacío, fallback a imagen única
        if (!Array.isArray(currentImages) || currentImages.length === 0) {
          currentImages = [img.src];
        }
      } catch (e) {
        // En caso de error, fallback a imagen única
        currentImages = [img.src];
      }

      currentIndex = 0;
      lightboxImg.src = currentImages[currentIndex];
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // evitar scroll
      lightboxImg.focus(); // Establecer el foco en la imagen
    });
  });

  // Avanzar imagen al hacer click en el lightbox (solo si hay más de una imagen)
  lightbox.addEventListener('click', (e) => {
    if (e.target === closeBtn) return;

    if (currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    }
  });

  // Cerrar lightbox con botón
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    lightbox.style.display = 'none';
    document.body.style.overflow = ''; // restaurar scroll
  });

  // Cerrar lightbox si clickeas fuera de la imagen (en el fondo)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // --- Menú Lateral ---
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');

  if (menuToggle && sideMenu) {
    menuToggle.addEventListener('click', () => {
      sideMenu.classList.toggle('active');
    });
  } else {
    console.error('Menu toggle or side menu not found!');
  }
});
