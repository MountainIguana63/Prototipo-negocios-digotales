const PAGE_SIZE = 20;

let allBooks = [];
let filteredBooks = [];
let currentPage = 1;

const grid = document.getElementById("catalog-grid");
const filterSelect = document.getElementById("filter-category");
const sortSelect = document.getElementById("sort-order");
const searchInput = document.getElementById("search-input");
const countSpan = document.getElementById("items-count");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");

// Ir al catálogo si se hace clic en la lupa
const searchBtn = document.querySelector(".search-button");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });
}

fetch("libros.json")
  .then(res => res.json())
  .then(data => {
    // Orden base por ID (menor ID = más reciente según tu regla)
    allBooks = data.slice().sort((a, b) => Number(a.ID) - Number(b.ID));
    applyFilters();
  })
  .catch(err => {
    console.error("Error cargando libros.json en catálogo:", err);
  });

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const category = filterSelect.value;

  // 1) Filtrar por categoría
  let list = allBooks.filter(book => {
    if (category === "todos") return true;
    return book.Categoria === category;
  });

  // 2) Filtrar por búsqueda con prioridad a Título
  if (term) {
    list = list
      .map(b => {
        let score = Infinity;

        const titulo = (b.Título || "").toLowerCase();
        const autor = (b.Autor || "").toLowerCase();
        const editorial = (b.Editorial || "").toLowerCase();
        const sinopsis = (b.Sinopsis || "").toLowerCase();
        const id = String(b.ID || "").toLowerCase();
        const precioStr = String(b.Precio || "").toLowerCase();

        if (titulo.includes(term)) {
          score = 0; // prioridad máxima
        } else if (
          autor.includes(term) ||
          editorial.includes(term) ||
          sinopsis.includes(term) ||
          id.includes(term) ||
          precioStr.includes(term)
        ) {
          score = 1; // coincidencias secundarias
        }

        if (score === Infinity) return null; // no coincide
        return { ...b, _score: score };
      })
      .filter(Boolean);
  } else {
    // sin búsqueda, todos con score 0
    list = list.map(b => ({ ...b, _score: 0 }));
  }

  // 3) Ordenar según el select de ORDENAR POR
  const sort = sortSelect.value;

  list.sort((a, b) => {
    // primero priorizamos por score de búsqueda
    if (a._score !== b._score) return a._score - b._score;

    switch (sort) {
      case "titulo-asc":
        return a.Título.localeCompare(b.Título);
      case "titulo-desc":
        return b.Título.localeCompare(a.Título);
      case "precio-asc":
        return a.Precio - b.Precio;
      case "precio-desc":
        return b.Precio - a.Precio;
      case "fecha-asc":
        // antiguo(a) a reciente  => ID más alto primero
        return Number(b.ID) - Number(a.ID);
      case "fecha-desc":
        // reciente a antiguo(a) => ID más bajo primero (más reciente)
        return Number(a.ID) - Number(b.ID);
      default:
        // "Características": usamos el orden por ID (más reciente primero)
        return Number(a.ID) - Number(b.ID);
    }
  });

  filteredBooks = list;
  currentPage = 1;
  updateView();
}

function updateView() {
  const total = filteredBooks.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filteredBooks.slice(start, end);

  // pintar libros
  grid.innerHTML = "";
  pageItems.forEach(book => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `producto.html?id=${book.ID}`;
    });

    const img = document.createElement("img");
    img.src = book.Imagen;
    img.alt = book.Título || "Libro";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.Título;

    const price = document.createElement("p");
    price.className = "book-price";
    const valor =
      typeof book.Precio === "number"
        ? `$${book.Precio.toFixed(2)}`
        : `$${book.Precio}`;
    price.textContent = valor;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    grid.appendChild(card);
  });

  // contador de artículos
  countSpan.textContent = `${total} artículo${total !== 1 ? "s" : ""}`;

  // paginación
  pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateView();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / PAGE_SIZE)
  );
  if (currentPage < totalPages) {
    currentPage++;
    updateView();
  }
});

filterSelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);
