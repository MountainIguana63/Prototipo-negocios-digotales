document.addEventListener("DOMContentLoaded", () => {
  // Ir al catálogo al hacer clic en la lupa
  const searchBtn = document.querySelector(".search-button");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      window.location.href = "catalogo.html";
    });
  }

  /* ============================================
     CARRUSEL
  ============================================ */

  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.querySelector(".carousel-arrow.prev");
  const nextBtn = document.querySelector(".carousel-arrow.next");

  const SLIDE_INTERVAL = 10000; // 10 segundos
  let currentIndex = 0;
  let autoSlide = null;

  function showSlide(index) {
    if (!slides.length) return;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    slides.forEach((s, i) => {
      s.classList.toggle("active", i === currentIndex);
    });
  }

  function startAuto() {
    if (autoSlide) clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      showSlide(currentIndex + 1);
    }, SLIDE_INTERVAL);
  }

  if (slides.length) {
    showSlide(0);
    startAuto();

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        showSlide(currentIndex - 1);
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        showSlide(currentIndex + 1);
        startAuto();
      });
    }
  }

  /* ============================================
     CATEGORÍAS DE LIBROS
  ============================================ */

  const CATEGORIES = [
    { id: "novedades", nombre: "Novedades", emoji: "🆕" },
    { id: "manga", nombre: "Mangas", emoji: "🍣" },
    { id: "romance", nombre: "Romance", emoji: "❤️" },
    { id: "novelas", nombre: "Novelas", emoji: "📖" },
    { id: "infantiles", nombre: "Infantiles", emoji: "🧸" },
    { id: "misterio", nombre: "Misterio", emoji: "🕵️‍♂️" },
    { id: "ciencia-ficcion", nombre: "Ciencia ficción", emoji: "🚀" },
    { id: "desarrollo-personal", nombre: "Desarrollo personal", emoji: "✨" },
    { id: "autoayuda", nombre: "Autoayuda", emoji: "🌱" },
    { id: "cine-pop", nombre: "Cine y cultura pop", emoji: "🎬" },
    { id: "arte-cultura", nombre: "Arte y cultura", emoji: "🎨" },
    { id: "finanzas", nombre: "Finanzas y economía", emoji: "💰" },
    { id: "politica", nombre: "Política", emoji: "🏛️" },
    { id: "divulgacion", nombre: "Divulgación científica", emoji: "🔬" },
    { id: "biografia", nombre: "Biografía", emoji: "👤" },
    { id: "ingles", nombre: "Inglés", emoji: "🗣️" }
  ];

  const categoriesContainer = document.getElementById("categories-container");
  const booksTitle = document.querySelector(".new-releases-title");
  const booksGrid = document.getElementById("books-grid");
  const booksPrevArrow = document.getElementById("books-categories-prev");
  const booksNextArrow = document.getElementById("books-categories-next");

  let currentCategoryId = "novedades";
  let allBooks = [];
  let allGifts = [];

  const CATEGORY_SCROLL_AMOUNT = 220; // px para mover las categorías

  function renderCategories() {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = "";

    CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.className =
        "category-card" + (cat.id === currentCategoryId ? " active" : "");
      btn.dataset.id = cat.id;

      const emojiSpan = document.createElement("span");
      emojiSpan.className = "emoji";
      emojiSpan.textContent = cat.emoji;

      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      labelSpan.textContent = cat.nombre;

      btn.appendChild(emojiSpan);
      btn.appendChild(labelSpan);

      btn.addEventListener("click", () => {
        currentCategoryId = cat.id;
        renderCategories();
        renderBooksForCategory(currentCategoryId);
      });

      categoriesContainer.appendChild(btn);
    });
  }

  if (categoriesContainer) {
    renderCategories();

    if (booksPrevArrow) {
      booksPrevArrow.addEventListener("click", () => {
        categoriesContainer.scrollBy({
          left: -CATEGORY_SCROLL_AMOUNT,
          behavior: "smooth"
        });
      });
    }

    if (booksNextArrow) {
      booksNextArrow.addEventListener("click", () => {
        categoriesContainer.scrollBy({
          left: CATEGORY_SCROLL_AMOUNT,
          behavior: "smooth"
        });
      });
    }
  }

  /* ============================================
     LIBROS
  ============================================ */

  function updateBooksTitle(categoryId) {
    if (!booksTitle) return;

    const map = {
      novedades: "DESCUBRE LO NUEVO DE INTERNACIONAL LIBROS Y REGALOS",
      manga: "Explora nuestro mundo de manga",
      romance: "Historias para enamorarte",
      novelas: "Novelas para todos los gustos",
      infantiles: "Libros para los más pequeños",
      misterio: "Libros llenos de misterio y suspenso",
      "ciencia-ficcion": "Viajes a otros mundos y futuros posibles",
      "desarrollo-personal": "Libros para crecer y mejorar cada día",
      autoayuda: "Herramientas para cuidar de ti",
      "cine-pop": "Libros de cine y cultura pop",
      "arte-cultura": "Arte y cultura para inspirarte",
      finanzas: "Finanzas y economía para tu bolsillo",
      politica: "Análisis y reflexión política",
      divulgacion: "Divulgación científica para todos",
      biografia: "Biografías que inspiran",
      ingles: "Libros en inglés para practicar el idioma"
    };

    booksTitle.textContent = map[categoryId] || map["novedades"];
  }

  function renderNewBooks(list) {
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    list.forEach(book => {
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

      booksGrid.appendChild(card);
    });
  }

  function renderBooksForCategory(categoryId) {
    if (!allBooks.length) return;

    let filtered = [];

    if (categoryId === "novedades") {
      filtered = allBooks;
    } else if (categoryId === "ingles") {
      filtered = allBooks.filter(
        b => b.Idioma === "Inglés" || b.Idioma === "English"
      );
    } else {
      const categoryMap = {
        manga: "Manga",
        romance: "Romance",
        novelas: "Novelas",
        infantiles: "Infantiles",
        misterio: "Misterio",
        "ciencia-ficcion": "Ciencia ficción",
        "desarrollo-personal": "Desarrollo personal",
        autoayuda: "Autoayuda",
        "cine-pop": "Cine y cultura pop",
        "arte-cultura": "Arte y cultura",
        finanzas: "Finanzas y economía",
        politica: "Política",
        divulgacion: "Divulgación científica",
        biografia: "Biografía"
      };

      const catNombre = categoryMap[categoryId];
      if (catNombre) {
        filtered = allBooks.filter(b => b.Categoria === catNombre);
      }
    }

    const first20 = filtered.slice(0, 20);
    renderNewBooks(first20);
    updateBooksTitle(categoryId);
  }

  /* ============================================
     CATEGORÍAS DE REGALOS
  ============================================ */

  const GIFT_CATEGORIES = [
    // Primeras 4 que se muestran primero
    { id: "gift-novedades", nombre: "Novedades", emoji: "✨" },
    { id: "gift-tarjetas", nombre: "Tarjetas de regalo", emoji: "🎁" },
    { id: "gift-adornos", nombre: "Adornos navideños", emoji: "🎄" },
    { id: "gift-separadores", nombre: "Separadores de libros", emoji: "📑" },

    // Resto (orden de “popularidad” definido por ti)
    { id: "gift-vasos", nombre: "Tazas y vasos", emoji: "☕" },
    { id: "gift-utiles", nombre: "Útiles", emoji: "✏️" },
    { id: "gift-bolsas", nombre: "Bolsas y mochilas", emoji: "👜" },
    { id: "gift-puzzles", nombre: "Puzzles", emoji: "🧩" },
    { id: "gift-electronicos", nombre: "Electrónicos", emoji: "🔌" },
    { id: "gift-decoracion", nombre: "Decoración", emoji: "🕯️" },
    { id: "gift-papel", nombre: "Papel de regalo", emoji: "🎀" },
    { id: "gift-llaveros", nombre: "Llaveros", emoji: "🔑" },
    { id: "gift-herramientas", nombre: "Herramientas", emoji: "🛠️" }
  ];

  const giftCategoriesContainer = document.getElementById(
    "gift-categories-container"
  );
  const giftsTitleEl = document.querySelector(".gifts-title");
  const giftsGrid = document.getElementById("gifts-grid");
  const giftPrevArrow = document.getElementById("gift-categories-prev");
  const giftNextArrow = document.getElementById("gift-categories-next");

  let currentGiftCategoryId = "gift-novedades";

  function renderGiftCategories() {
    if (!giftCategoriesContainer) return;

    giftCategoriesContainer.innerHTML = "";

    GIFT_CATEGORIES.forEach(cat => {
      const btn = document.createElement("button");
      btn.className =
        "category-card" +
        (cat.id === currentGiftCategoryId ? " active" : "");
      btn.dataset.id = cat.id;

      const emojiSpan = document.createElement("span");
      emojiSpan.className = "emoji";
      emojiSpan.textContent = cat.emoji;

      const labelSpan = document.createElement("span");
      labelSpan.className = "label";
      labelSpan.textContent = cat.nombre;

      btn.appendChild(emojiSpan);
      btn.appendChild(labelSpan);

      btn.addEventListener("click", () => {
        currentGiftCategoryId = cat.id;
        renderGiftCategories();
        renderGiftsForCategory(currentGiftCategoryId);
      });

      giftCategoriesContainer.appendChild(btn);
    });
  }

  if (giftCategoriesContainer) {
    renderGiftCategories();

    if (giftPrevArrow) {
      giftPrevArrow.addEventListener("click", () => {
        giftCategoriesContainer.scrollBy({
          left: -CATEGORY_SCROLL_AMOUNT,
          behavior: "smooth"
        });
      });
    }

    if (giftNextArrow) {
      giftNextArrow.addEventListener("click", () => {
        giftCategoriesContainer.scrollBy({
          left: CATEGORY_SCROLL_AMOUNT,
          behavior: "smooth"
        });
      });
    }
  }

  function updateGiftsTitle(categoryId) {
    if (!giftsTitleEl) return;

    const map = {
      "gift-novedades": "DESCUBRE LAS NOVEDADES EN NUESTROS REGALOS",
      "gift-tarjetas": "Sorprende con nuestras tarjetas de regalo",
      "gift-adornos": "Llena tu hogar de magia navideña",
      "gift-separadores": "Encuentra el separador perfecto para tu lectura",
      "gift-vasos": "Tazas y vasos para acompañar cada lectura",
      "gift-utiles": "Útiles que hacen más divertido estudiar y trabajar",
      "gift-bolsas": "Bolsas y mochilas para llevar tus historias contigo",
      "gift-puzzles": "Puzzles y rompecabezas para desafiar tu mente",
      "gift-electronicos": "Electrónicos prácticos para el día a día",
      "gift-decoracion": "Decoración para darle personalidad a tus espacios",
      "gift-papel": "Envuelve tus detalles con nuestros papeles de regalo",
      "gift-llaveros": "Llaveros tiernos y divertidos para tus llaves",
      "gift-herramientas": "Herramientas ingeniosas para tus proyectos"
    };

    giftsTitleEl.textContent = map[categoryId] || map["gift-novedades"];
  }

function renderGifts(list) {
  if (!giftsGrid) return;

  giftsGrid.innerHTML = "";

  list.forEach(gift => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.style.cursor = "pointer";

    // Al hacer clic en un regalo → página de detalle de regalos
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

    giftsGrid.appendChild(card);
  });
}



  function renderGiftsForCategory(categoryId) {
    if (!allGifts.length) return;

    let filtered = [];

    if (categoryId === "gift-novedades") {
      // Novedades: regalos con IDs del 01 al 20
      filtered = allGifts.filter(g => Number(g.ID) <= 20);
    } else {
      const categoryMap = {
        "gift-tarjetas": "Tarjeta de regalo",
        "gift-adornos": "Adornos navideños",
        "gift-separadores": "Separador de libros",
        "gift-vasos": "Tazas y vasos",
        "gift-utiles": "Útiles",
        "gift-bolsas": "Bolsas y mochilas",
        "gift-puzzles": "Puzzles",
        "gift-electronicos": "Electrónicos",
        "gift-decoracion": "Decoración",
        "gift-papel": "Papel de regalo",
        "gift-llaveros": "Llavero",
        "gift-herramientas": "Herramientas"
      };

      const catNombre = categoryMap[categoryId];

      if (catNombre) {
        if (categoryId === "gift-vasos") {
          // Por si hay "Tazas y vasos y vasos" en el JSON
          filtered = allGifts.filter(
            g => g.Categoria && g.Categoria.startsWith("Tazas y vasos")
          );
        } else {
          filtered = allGifts.filter(g => g.Categoria === catNombre);
        }
      }
    }

    const first20 = filtered.slice(0, 20);
    renderGifts(first20);
    updateGiftsTitle(categoryId);
  }

  /* ============================================
     CARGAR JSON LIBROS Y REGALOS
  ============================================ */

  // Libros
  fetch("libros.json")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        allBooks = data;
        renderBooksForCategory(currentCategoryId); // por defecto Novedades
      }
    })
    .catch(err => {
      console.error("Error cargando libros.json:", err);
    });

  // Regalos
  fetch("regalos.json")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        allGifts = data;
        renderGiftsForCategory(currentGiftCategoryId); // por defecto Novedades
      }
    })
    .catch(err => {
      console.error("Error cargando regalos.json:", err);
    });
});

