const searchBtnHeader = document.querySelector(".search-button");
if (searchBtnHeader) {
  searchBtnHeader.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });
}

// Leer el ID desde la URL: producto-regalo.html?id=XX
const params = new URLSearchParams(window.location.search);
const giftId = params.get("id");

const container = document.getElementById("product-container");

// Función para sacar recomendaciones de regalos
function getRecommendations(allGifts, currentGift, count = 4) {
  const others = allGifts.filter(g => g.ID !== currentGift.ID);

  let recs = [];

  // 1) Misma marca
  const sameBrand = others.filter(g => g.Marca === currentGift.Marca);
  recs.push(...sameBrand);

  // 2) Misma categoría (sin repetir)
  if (recs.length < count) {
    const sameCategory = others.filter(
      g => g.Categoria === currentGift.Categoria && !recs.includes(g)
    );
    recs.push(...sameCategory);
  }

  // 3) Por precio similar
  if (recs.length < count) {
    const remaining = others.filter(g => !recs.includes(g));
    remaining.sort((a, b) =>
      Math.abs(a.Precio - currentGift.Precio) -
      Math.abs(b.Precio - currentGift.Precio)
    );
    recs.push(...remaining);
  }

  return recs.slice(0, count);
}

if (!giftId) {
  container.innerHTML = "<p>Regalo no encontrado.</p>";
} else {
  fetch("regalos.json")
    .then(res => res.json())
    .then(data => {
      const gift = data.find(g => g.ID === giftId);

      if (!gift) {
        container.innerHTML = "<p>Regalo no encontrado.</p>";
        return;
      }

      const recommendations = getRecommendations(data, gift, 4);

      const relatedHtml = recommendations.map(rec => `
        <article class="related-card"
                 onclick="window.location.href='producto-regalo.html?id=${rec.ID}'">
          <img src="${rec.Imagen}" alt="${rec.Nombre}">
          <h3>${rec.Nombre}</h3>
          <p>$${rec.Precio.toFixed(2)}</p>
        </article>
      `).join("");

      container.innerHTML = `
        <div class="product-wrapper">

          <div class="product-image">
            <img src="${gift.Imagen}" alt="${gift.Nombre}">
          </div>

          <div class="product-info">
            <h1 class="product-title">${gift.Nombre}</h1>
            <p class="product-editorial">${gift.Marca}</p>
            <p class="product-price">$${gift.Precio.toFixed(2)}</p>
            <p class="product-shipping">
              Los gastos de envío se calculan en la pantalla de pagos.
            </p>

            <div class="product-actions">
              <button class="btn-secondary">Agregar al carrito</button>
              <button class="btn-primary">Comprar ahora</button>
            </div>

            

            <p class="product-description">
              ${gift.Informacion}
            </p>

            <button id="copy-link-btn" class="btn-copy-link">
              🔗 Copiar enlace del producto
            </button>

            <p class="product-stock">
              ${gift.UnidadesDisponibles} unidades disponibles.
              Próximo ingreso: ${gift.ProximoIngreso}
            </p>

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
          <a href="regalos.html" class="btn-view-all">Ver todos los regalos</a>
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
      console.error("Error cargando regalos.json en producto-regalo.js", err);
      container.innerHTML = "<p>Ocurrió un error al cargar el regalo.</p>";
    });
}
