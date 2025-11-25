document.addEventListener("DOMContentLoaded", () => {

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

    slides.forEach((s, i) => s.classList.toggle("active", i === currentIndex));
    
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
     CATEGORÍAS
  ============================================ */

  const CATEGORIES = [
    { id: "novedades", nombre: "Novedades", emoji: "🆕" },
    { id: "manga", nombre: "Manga", emoji: "🇯🇵" },
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
    { id: "ingles", nombre: "Inglés", emoji: "🇬🇧" }
  ];

  const categoriesContainer = document.getElementById("categories-container");
  const toggleBtn = document.getElementById("toggle-categories");
  const booksTitle = document.querySelector(".new-releases-title");
  const booksGrid = document.getElementById("books-grid");

  let showAllCategories = false;
  let currentCategoryId = "novedades";
  let allBooks = [];

  function renderCategories(showAll) {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = "";
    const list = showAll ? CATEGORIES : CATEGORIES.slice(0, 4);

    list.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "category-card" + (cat.id === currentCategoryId ? " active" : "");
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
        renderCategories(showAllCategories);
        renderBooksForCategory(currentCategoryId);
      });

      categoriesContainer.appendChild(btn);
    });
  }

  if (categoriesContainer && toggleBtn) {
    renderCategories(false);

    toggleBtn.addEventListener("click", () => {
      showAllCategories = !showAllCategories;
      renderCategories(showAllCategories);
      toggleBtn.textContent = showAllCategories ? "Mostrar menos" : "Mostrar más";
    });
  }

  /* ============================================
     LIBROS
  ============================================ */

  function updateBooksTitle(categoryId) {
    if (!booksTitle) return;

    const map = {
      "novedades": "DESCUBRE LO NUEVO DE INTERNACIONAL LIBROS Y REGALOS",
      "manga": "Explora nuestro mundo de manga",
      "romance": "Historias para enamorarte",
      "novelas": "Novelas para todos los gustos",
      "infantiles": "Libros para los más pequeños",
      "misterio": "Libros llenos de misterio y suspenso",
      "ciencia-ficcion": "Viajes a otros mundos y futuros posibles",
      "desarrollo-personal": "Libros para crecer y mejorar cada día",
      "autoayuda": "Herramientas para cuidar de ti",
      "cine-pop": "Libros de cine y cultura pop",
      "arte-cultura": "Arte y cultura para inspirarte",
      "finanzas": "Finanzas y economía para tu bolsillo",
      "politica": "Análisis y reflexión política",
      "divulgacion": "Divulgación científica para todos",
      "biografia": "Biografías que inspiran",
      "ingles": "Libros en inglés para practicar el idioma"
    };

    booksTitle.textContent = map[categoryId] || map["novedades"];
  }

  function renderNewBooks(list) {
    if (!booksGrid) return;

    booksGrid.innerHTML = "";

    list.forEach(book => {
      const card = document.createElement("article");
      card.className = "book-card";

      const img = document.createElement("img");
      img.src = book.Imagen;
      img.alt = book.Título || "Libro";

      const title = document.createElement("h3");
      title.className = "book-title";
      title.textContent = book.Título;

      const price = document.createElement("p");
      price.className = "book-price";

      const valor = typeof book.Precio === "number"
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
        "manga": "Manga",
        "romance": "Romance",
        "novelas": "Novelas",
        "infantiles": "Infantiles",
        "misterio": "Misterio",
        "ciencia-ficcion": "Ciencia ficción",
        "desarrollo-personal": "Desarrollo personal",
        "autoayuda": "Autoayuda",
        "cine-pop": "Cine y cultura pop",
        "arte-cultura": "Arte y cultura",
        "finanzas": "Finanzas y economía",
        "politica": "Política",
        "divulgacion": "Divulgación científica",
        "biografia": "Biografía"
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
     CARGAR JSON
  ============================================ */

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

});