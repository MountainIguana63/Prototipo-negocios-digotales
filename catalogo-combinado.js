document.addEventListener("DOMContentLoaded", () => {
  const PAGE_BOOKS = 10;
  const PAGE_GIFTS = 10;

  const grid          = document.getElementById("catalog-grid");
  const filterSelect  = document.getElementById("filter-category"); // FILTRAR POR
  const sortSelect    = document.getElementById("sort-order");      // ORDENAR POR
  const searchInput   = document.getElementById("search-input");    // input búsqueda
  const countSpan     = document.getElementById("items-count");     // "0 artículos"
  const prevBtn       = document.getElementById("prev-page");
  const nextBtn       = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  // Si no estamos en el catálogo combinado, no hacemos nada
  if (!grid) return;

  let allBooks = [];
  let allGifts = [];
  let currentPage = 1;

  // ------------------------
  // Utils
  // ------------------------
  const MONTHS_ES = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, setiembre: 8,
    octubre: 9, noviembre: 10, diciembre: 11
  };

  function parseSpanishDate(str) {
    if (!str || typeof str !== "string") return null;
    // Ej: "21 de marzo de 2026"
    const parts = str.toLowerCase().split(" ").filter(Boolean);
    const day   = parseInt(parts[0], 10);
    const month = MONTHS_ES[parts[2]] ?? 0;
    const year  = parseInt(parts[4], 10);
    if (isNaN(day) || isNaN(year)) return null;
    return new Date(year, month, day);
  }

  function normalize(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // ------------------------
  // Carga de datos
  // ------------------------
  async function loadData() {
    try {
      const [booksRes, giftsRes] = await Promise.all([
        fetch("libros.json"),
        fetch("regalos.json")
      ]);

      const booksJson = await booksRes.json();
      const giftsJson = await giftsRes.json();

      allBooks = booksJson.map(b => ({
        tipo: "libro",
        id: b.ID,
        titulo: b["Título"] || b.Titulo || "",
        autor: b.Autor || "",
        categoria: b.Categoria || "",
        precio: Number(b.Precio) || 0,
        imagen: b.Imagen || "",
        restock: b.ProximoIngreso || ""
      }));

      allGifts = giftsJson.map(g => ({
        tipo: "regalo",
        id: g.ID,
        titulo: g.Nombre || "",
        autor: g.Marca || "",
        categoria: g.Categoria || "",
        precio: Number(g.Precio) || 0,
        imagen: g.Imagen || "",
        restock: g.ProximoIngreso || ""
      }));

      // Primera renderizada
      render();
    } catch (err) {
      console.error("Error cargando catálogo combinado", err);
      grid.innerHTML = "<p>Ocurrió un error al cargar los productos.</p>";
    }
  }

  // ------------------------
  // Obtener arrays filtrados
  // ------------------------
  function getFilteredArrays() {
    const category = filterSelect ? filterSelect.value : "todos";
    const search   = normalize(searchInput ? searchInput.value : "");
    const sort     = sortSelect ? sortSelect.value : "caracteristicas";

    let books = allBooks.filter(item => {
      const catOK = category === "todos" || item.categoria === category;
      const text  = normalize(`${item.titulo} ${item.autor} ${item.categoria}`);
      const searchOK = !search || text.includes(search);
      return catOK && searchOK;
    });

    let gifts = allGifts.filter(item => {
      const catOK = category === "todos" || item.categoria === category;
      const text  = normalize(`${item.titulo} ${item.autor} ${item.categoria}`);
      const searchOK = !search || text.includes(search);
      return catOK && searchOK;
    });

    // Ordenar
    const sortBooks = (a, b) => sortComparator(a, b, sort, "titulo");
    const sortGifts = (a, b) => sortComparator(a, b, sort, "titulo");

    books.sort(sortBooks);
    gifts.sort(sortGifts);

    return { books, gifts };
  }

  function sortComparator(a, b, sort, keyTitulo) {
    switch (sort) {
      case "titulo-asc":
        return normalize(a.titulo).localeCompare(normalize(b.titulo));
      case "titulo-desc":
        return normalize(b.titulo).localeCompare(normalize(a.titulo));
      case "precio-asc":
        return (a.precio || 0) - (b.precio || 0);
      case "precio-desc":
        return (b.precio || 0) - (a.precio || 0);
      case "fecha-asc": {
        const da = parseSpanishDate(a.restock);
        const db = parseSpanishDate(b.restock);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      }
      case "fecha-desc": {
        const da = parseSpanishDate(a.restock);
        const db = parseSpanishDate(b.restock);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db - da;
      }
      case "caracteristicas":
      default:
        // Orden "natural": por ID como texto
        return String(a.id).localeCompare(String(b.id));
    }
  }

  // ------------------------
  // Render principal
  // ------------------------
  function render() {
    const { books, gifts } = getFilteredArrays();

    const totalBooks = books.length;
    const totalGifts = gifts.length;
    const totalItems = totalBooks + totalGifts;

    // Paginación
    const totalPagesBooks = Math.max(1, Math.ceil(totalBooks / PAGE_BOOKS));
    const totalPagesGifts = Math.max(1, Math.ceil(totalGifts / PAGE_GIFTS));
    const totalPages      = Math.max(totalPagesBooks, totalPagesGifts);

    if (currentPage > totalPages) currentPage = totalPages;

    const startBooks = (currentPage - 1) * PAGE_BOOKS;
    const startGifts = (currentPage - 1) * PAGE_GIFTS;

    const pageBooks = books.slice(startBooks, startBooks + PAGE_BOOKS);
    const pageGifts = gifts.slice(startGifts, startGifts + PAGE_GIFTS);

    grid.innerHTML = "";

    // Primero libros, luego regalos (puedes invertir el orden si querés)
    pageBooks.forEach(renderCard);
    pageGifts.forEach(renderCard);

    // Contador arriba a la derecha
    if (countSpan) {
      countSpan.textContent =
        `${totalItems} artículo${totalItems === 1 ? "" : "s"}`;
    }

    // Texto de página
    if (pageIndicator) {
      pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
    }

    // Botones de paginación
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  // ------------------------
  // Render de cada tarjeta
  // ------------------------
  function renderCard(item) {
  const card = document.createElement("article");
  card.className = "book-card";
  card.style.cursor = "pointer";

  const img = document.createElement("img");
  img.src = item.imagen;
  img.alt = item.titulo || (item.tipo === "libro" ? "Libro" : "Regalo");

  const title = document.createElement("h3");
  title.className = "book-title";
  title.textContent = item.titulo;

  const price = document.createElement("p");
  price.className = "book-price";
  price.textContent = `$${item.precio.toFixed(2)}`;

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(price);

  card.addEventListener("click", () => {
    if (item.tipo === "libro") {
      window.location.href = `producto.html?id=${encodeURIComponent(item.id)}`;
    } else {
      window.location.href = `producto-regalo.html?id=${encodeURIComponent(item.id)}`;
    }
  });

  grid.appendChild(card);
}

  // ------------------------
  // Eventos
  // ------------------------
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const { books, gifts } = getFilteredArrays();
      const totalPagesBooks = Math.max(1, Math.ceil(books.length / PAGE_BOOKS));
      const totalPagesGifts = Math.max(1, Math.ceil(gifts.length / PAGE_GIFTS));
      const totalPages      = Math.max(totalPagesBooks, totalPagesGifts);
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      currentPage = 1;
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentPage = 1;
      render();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      render();
    });
  }

  // ------------------------
  // Inicio
  // ------------------------
  loadData();
});



