const searchBtnHeader = document.querySelector(".search-button");
if (searchBtnHeader) {
  searchBtnHeader.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });
}

// Leer el ID desde la URL: producto.html?id=XX
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const container = document.getElementById("product-container");

// Función para sacar recomendaciones
function getRecommendations(allBooks, currentBook, count = 4) {
  const others = allBooks.filter(b => b.ID !== currentBook.ID);

  let recs = [];

  // 1) Mismo autor
  const sameAuthor = others.filter(b => b.Autor === currentBook.Autor);
  recs.push(...sameAuthor);

  // 2) Misma categoría (sin repetir)
  if (recs.length < count) {
    const sameCategory = others.filter(
      b => b.Categoria === currentBook.Categoria && !recs.includes(b)
    );
    recs.push(...sameCategory);
  }

  // 3) Por precio similar (ordenado por diferencia de precio)
  if (recs.length < count) {
    const remaining = others.filter(b => !recs.includes(b));
    remaining.sort((a, b) =>
      Math.abs(a.Precio - currentBook.Precio) - Math.abs(b.Precio - currentBook.Precio)
    );
    recs.push(...remaining);
  }

  return recs.slice(0, count);
}

if (!bookId) {
  container.innerHTML = "<p>Libro no encontrado.</p>";
} else {
  fetch("libros.json")
    .then(res => res.json())
    .then(data => {
      const book = data.find(b => b.ID === bookId);

      if (!book) {
        container.innerHTML = "<p>Libro no encontrado.</p>";
        return;
      }

      const recommendations = getRecommendations(data, book, 4);

      const relatedHtml = recommendations.map(rec => `
        <article class="related-card" onclick="window.location.href='producto.html?id=${rec.ID}'">
          <img src="${rec.Imagen}" alt="${rec.Título}">
          <h3>${rec.Título}</h3>
          <p>$${rec.Precio.toFixed(2)}</p>
        </article>
      `).join("");

      container.innerHTML = `
        <div class="product-wrapper">

          <div class="product-image">
            <img src="${book.Imagen}" alt="${book.Título}">
          </div>

          <div class="product-info">
            <h1 class="product-title">${book.Título}</h1>
            <p class="product-editorial">${book.Editorial}</p>
            <p class="product-price">$${book.Precio.toFixed(2)}</p>
            <p class="product-shipping">Los gastos de envío se calculan en la pantalla de pagos.</p>

            <div class="product-actions">
              <button class="btn-secondary">Agregar al carrito</button>
              <button class="btn-primary">Comprar ahora</button>
            </div>

            <p class="product-author"><strong>Autor:</strong> ${book.Autor}</p>

            <p class="product-description">
              ${book.Sinopsis}
            </p>

            <button id="copy-link-btn" class="btn-copy-link">
            🔗 Copiar enlace del producto
            </button>

          </div>
        </div>

        <section class="related-section">
          <h2 class="related-title">También te puede interesar</h2>
          <div class="related-grid">
            ${relatedHtml}
          </div>
        </section>

<div class="product-back">
  <a href="index.html" class="btn-go-home">← Volver a inicio</a>
  <a href="index.html" class="btn-view-all">Ver catálogo en su lugar</a>
</div>

      `;

      const copyBtn = document.getElementById("copy-link-btn");
      if (copyBtn && navigator.clipboard) {
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      copyBtn.textContent = "✔️ Enlace copiado";
      setTimeout(() => {
        copyBtn.textContent = "🔗 Copiar enlace del producto";
      }, 1500);
    });
});

      }
    })
    .catch(err => {
      console.error("Error cargando libros.json en producto.js", err);
      container.innerHTML = "<p>Ocurrió un error al cargar el libro.</p>";
    });
}

