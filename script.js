// ✅ Esto debe ir arriba del todo
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const SUPABASE_URL = 'https://addmpwjxvyfpxrnzpdua.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG1wd2p4dnlmcHhybnpwZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzkxMDUsImV4cCI6MjA2NzY1NTEwNX0.rouJg4RHgNZwEIN01yV-JEJxHW7idmiFBd-oYgU8MUQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

    // Mezclar productos al azar
    productos.sort(() => Math.random() - 0.5);

    container.innerHTML = '';

    productos.forEach(p => {
      const estadoClass = p.estado.toLowerCase().includes('nuevo') ? 'nuevo' :
                          p.estado.toLowerCase().includes('usado') ? 'usado' : 'otro';

      const descripcionCorta = p.descripcion.length > 100 ? p.descripcion.slice(0, 100) + '...' : p.descripcion;
      const descripcionCompleta = p.descripcion;

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
          ${p.descripcion.length > 100 ? `<a href="#" class="toggle-desc">Ver más</a>` : ''}
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
      desc.classList.toggle('expanded');

      if (desc.classList.contains('expanded')) {
        btn.textContent = 'Ver menos';
      } else {
        btn.textContent = 'Ver más';
      }
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
        const phoneNumber = e.target.dataset.whatsapp || "8292308873";

        const mensaje = `Hola, estoy interesado en comprar:\n- Producto: ${productTitle}\n- Precio: $${productPrice}\n- Descripción: ${productDescription}`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${mensajeCodificado}`;

        window.open(urlWhatsapp, '_blank');
      });
    });
  }

  cargarTodosLosProductos();
});

document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.querySelector(".lightbox-image");
  const closeBtn = document.querySelector(".close-btn");

  let currentImages = [];
  let currentIndex = 0;

  // Escuchar clic en cualquier imagen de producto
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".product-image");
    if (!img) return;

    try {
      currentImages = JSON.parse(img.dataset.images);
    } catch {
      currentImages = [img.src];
    }

    currentIndex = 0;
    lightboxImg.src = currentImages[currentIndex];
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Cerrar el lightbox
  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
    document.body.style.overflow = "";
  });

  lightbox.addEventListener("click", (e) => {
    // Si haces clic fuera de la imagen, se cierra
    if (e.target === lightbox || e.target === closeBtn) {
      lightbox.style.display = "none";
      document.body.style.overflow = "";
    }

    // Si haces clic en la imagen, avanza a la siguiente
    if (e.target === lightboxImg && currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    }
  });

  // Teclado: izquierda/derecha/esc
  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display !== "flex") return;

    if (e.key === "ArrowRight" || e.key === "d") {
      currentIndex = (currentIndex + 1) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      lightboxImg.src = currentImages[currentIndex];
    } else if (e.key === "Escape") {
      lightbox.style.display = "none";
      document.body.style.overflow = "";
    }
  });
});
