const PAGE_SIZE = 20;

let allGifts = [];
let filteredGifts = [];
let currentPage = 1;

const grid = document.getElementById("catalog-grid");
const filterSelect = document.getElementById("filter-category");
const sortSelect = document.getElementById("sort-order");
const searchInput = document.getElementById("search-input");
const countSpan = document.getElementById("items-count");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");

// (Opcional) la lupa también te puede mandar a regalos.html si quieres
const searchBtn = document.querySelector(".search-button");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    window.location.href = "regalos.html";
  });
}

// Cargar datos de regalos
fetch("regalos.json")
  .then(res => res.json())
  .then(data => {
    // Orden base por ID
    allGifts = data.slice().sort((a, b) => Number(a.ID) - Number(b.ID));
    applyGiftFilters();
  })
  .catch(err => {
    console.error("Error cargando regalos.json en catálogo de regalos:", err);
  });

function applyGiftFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const category = filterSelect.value;

  // 1) Filtro por categoría
  let list = allGifts.filter(gift => {
    if (category === "todos") return true;
    return gift.Categoria === category;
  });

  // 2) Filtro por búsqueda
  if (term) {
    list = list
      .map(g => {
        let score = Infinity;

        const nombre = (g.Nombre || "").toLowerCase();
        const marca = (g.Marca || "").toLowerCase();
        const cat = (g.Categoria || "").toLowerCase();
        const info = (g.Informacion || "").toLowerCase();
        const id = String(g.ID || "").toLowerCase();
        const precioStr = String(g.Precio || "").toLowerCase();

        if (nombre.includes(term)) {
          score = 0; // máxima prioridad
        } else if (
          marca.includes(term) ||
          cat.includes(term) ||
          info.includes(term) ||
          id.includes(term) ||
          precioStr.includes(term)
        ) {
          score = 1;
        }

        if (score === Infinity) return null;
        return { ...g, _score: score };
      })
      .filter(Boolean);
  } else {
    list = list.map(g => ({ ...g, _score: 0 }));
  }

  // 3) Ordenamiento
  const sort = sortSelect.value;

  list.sort((a, b) => {
    if (a._score !== b._score) return a._score - b._score;

    switch (sort) {
      case "nombre-asc":
        return a.Nombre.localeCompare(b.Nombre);
      case "nombre-desc":
        return b.Nombre.localeCompare(a.Nombre);
      case "precio-asc":
        return a.Precio - b.Precio;
      case "precio-desc":
        return b.Precio - a.Precio;
      case "fecha-asc":
        return Number(b.ID) - Number(a.ID); // antiguo → reciente
      case "fecha-desc":
        return Number(a.ID) - Number(b.ID); // reciente → antiguo
      default:
        return Number(a.ID) - Number(b.ID);
    }
  });

  filteredGifts = list;
  currentPage = 1;
  updateGiftView();
}

function updateGiftView() {
  const total = filteredGifts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filteredGifts.slice(start, end);

  grid.innerHTML = "";
  pageItems.forEach(gift => {
    const card = document.createElement("article");
    card.className = "book-card"; // reutilizamos estilos
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `producto-regalo.html?id=${gift.ID}`;
    });

    const img = document.createElement("img");
    img.src = gift.Imagen;
    img.alt = gift.Nombre || "Regalo";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = gift.Nombre;

    const price = document.createElement("p");
    price.className = "book-price";
    const valor =
      typeof gift.Precio === "number"
        ? `$${gift.Precio.toFixed(2)}`
        : `$${gift.Precio}`;
    price.textContent = valor;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    grid.appendChild(card);
  });

  countSpan.textContent = `${total} artículo${total !== 1 ? "s" : ""}`;
  pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateGiftView();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filteredGifts.length / PAGE_SIZE));
  if (currentPage < totalPages) {
    currentPage++;
    updateGiftView();
  }
});

filterSelect.addEventListener("change", applyGiftFilters);
sortSelect.addEventListener("change", applyGiftFilters);
searchInput.addEventListener("input", applyGiftFilters);
