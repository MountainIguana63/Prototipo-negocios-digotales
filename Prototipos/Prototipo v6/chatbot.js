// =============================
// Chatbot "Atenea" - Bookstore
// =============================

(function() {
  // ---------- Configurable ----------
  const ICON_PATH = "img/20251121170649-6QYW6WF4.png";

  // Rellena estos datos con la info real de tu local
  const INFO_LOCAL = {
    nombre: "Tu Librería / Tienda de Regalos",
    direccion: "Ejemplo: Calle Principal #123, Ciudad, País",
    horario: "Ejemplo: Lunes a sábado de 9:00 a.m. a 6:00 p.m.",
    telefono: "Ejemplo: +503 2222-2222",
    correo: "Ejemplo: contacto@tulibreria.com",
    sucursalesURL: "a.html", // tu página de sucursales
    librosURL: "catalogo.html",
    regalosURL: "regalos.html",
    inicioURL: "index.html"
  };

  // Horario hábil genérico para mensajes de atención al cliente
  const HORARIO_ATENCION = "de lunes a viernes en horario hábil.";

  // Rutas de tus catálogos JSON
  const LIBROS_JSON_URL = "libros.json";
  const REGALOS_JSON_URL = "regalos.json";

  // Datos cargados
  let librosData = null;
  let regalosData = null;

  // Estados del chatbot
  let awaitingCustomerServiceConfirmation = false;

  // Utilidad para acceder a campos variables (titulo/Título/nombre/Nombre, etc.)
  function getField(obj, candidates, fallback = "") {
    for (const key of candidates) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
        return String(obj[key]);
      }
    }
    return fallback;
  }

  function normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  async function cargarJsonSiHaceFalta() {
    if (!librosData) {
      try {
        const resLibros = await fetch(LIBROS_JSON_URL);
        if (resLibros.ok) {
          librosData = await resLibros.json();
        }
      } catch (e) {
        console.warn("No se pudo cargar libros.json", e);
      }
    }
    if (!regalosData) {
      try {
        const resRegalos = await fetch(REGALOS_JSON_URL);
        if (resRegalos.ok) {
          regalosData = await resRegalos.json();
        }
      } catch (e) {
        console.warn("No se pudo cargar regalos.json", e);
      }
    }
  }

  // ---------- Creación de UI ----------

  function crearUI() {
    // Botón flotante
    const button = document.createElement("button");
    button.id = "atenea-chatbot-button";
    button.setAttribute("aria-label", "Abrir chat con Atenea");
    button.innerHTML = `<img src="${ICON_PATH}" alt="Atenea">`;
    document.body.appendChild(button);

    // Ventana
    const windowDiv = document.createElement("div");
    windowDiv.id = "atenea-chatbot-window";
    windowDiv.innerHTML = `
      <div class="atenea-header">
        <div class="atenea-header-avatar">
          <img src="${ICON_PATH}" alt="Atenea">
        </div>
        <div class="atenea-header-info">
          <div class="atenea-header-title">Atenea</div>
          <div class="atenea-header-subtitle">Asistente de la librería</div>
        </div>
        <button class="atenea-header-close" aria-label="Cerrar chat">&times;</button>
      </div>
      <div class="atenea-messages"></div>
      <form class="atenea-input-area">
        <input type="text" name="mensaje" placeholder="Escribe tu mensaje..." autocomplete="off" />
        <button type="submit">Enviar</button>
      </form>
    `;
    document.body.appendChild(windowDiv);

    // Eventos
    button.addEventListener("click", () => {
      const isVisible = windowDiv.style.display === "flex";
      windowDiv.style.display = isVisible ? "none" : "flex";
      if (!isVisible) {
        scrollToBottom();
      }
    });

    const closeBtn = windowDiv.querySelector(".atenea-header-close");
    closeBtn.addEventListener("click", () => {
      windowDiv.style.display = "none";
    });

    const form = windowDiv.querySelector(".atenea-input-area");
    const input = form.querySelector("input[name='mensaje']");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addUserMessage(text);
      input.value = "";
      processUserMessage(text);
    });

    // Mensaje inicial de Atenea
    addBotMessage(
      "Hola, soy Atenea, tu asistente de la librería. 🕊️📚\n" +
      "Puedo ayudarte a encontrar libros o regalos, darte información del local y orientarte en el sitio.\n" +
      "¿En qué puedo ayudarte hoy?"
    );
  }

  function getMessagesContainer() {
    return document.querySelector("#atenea-chatbot-window .atenea-messages");
  }

  function addMessage(text, type) {
    const container = getMessagesContainer();
    if (!container) return;
    const bubble = document.createElement("div");
    bubble.classList.add("atenea-message", type);
    bubble.textContent = text;
    container.appendChild(bubble);
    scrollToBottom();
  }

  function addUserMessage(text) {
    addMessage(text, "user");
  }

  function addBotMessage(text) {
    addMessage(text, "bot");
  }

  function scrollToBottom() {
    const container = getMessagesContainer();
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }

  // ---------- Lógica del chatbot ----------

  async function processUserMessage(rawText) {
    const text = rawText.trim();
    const norm = normalizarTexto(text);

    // Si estamos esperando confirmación para atención al cliente
    if (awaitingCustomerServiceConfirmation) {
      if (/(si|sí|claro|por favor|dale|de acuerdo)/i.test(text)) {
        awaitingCustomerServiceConfirmation = false;
        addBotMessage("Comunicando con atención al cliente...");
        setTimeout(() => {
          addBotMessage(
            "Por el momento no hay personal de atención al cliente disponible.\n" +
            `Por favor, intentá llamar o escribir en el horario hábil (${HORARIO_ATENCION}).`
          );
        }, 800);
      } else if (/(no|nel|gracias)/i.test(text)) {
        awaitingCustomerServiceConfirmation = false;
        addBotMessage("Está bien, me quedo contigo. Si necesitas otra cosa, con gusto te ayudo.");
      } else {
        addBotMessage("Solo para confirmar, ¿querés que intente comunicarte con atención al cliente? (sí/no)");
      }
      return;
    }

    // Detectar saludos
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hello|hi|hey|que onda|qué onda)/i.test(norm)) {
      addBotMessage(
        "Hola, soy Atenea. Estoy aquí para ayudarte a explorar libros, regalos e información del local. ¿Qué te gustaría saber?"
      );
      return;
    }

    // Preguntas sobre el local: dirección, horario, contacto
    if (/(direccion|dirección|ubicacion|ubicación|donde estan|dónde estan|donde están|como llegar)/i.test(norm)) {
      addBotMessage(
        `Nuestra dirección es:\n${INFO_LOCAL.direccion}\n\n` +
        "Si necesitás más detalles para llegar, puedo orientarte con gusto."
      );
      return;
    }

    if (/(horario|hora de atencion|abren|cierran)/i.test(norm)) {
      addBotMessage(`Nuestro horario de atención es: ${INFO_LOCAL.horario}`);
      return;
    }

    if (/(telefono|teléfono|numero|número|llamar)/i.test(norm)) {
      addBotMessage(
        `Podés comunicarte al teléfono: ${INFO_LOCAL.telefono}\n` +
        `O escribirnos a: ${INFO_LOCAL.correo}`
      );
      return;
    }

    if (/(sucursal|sucursales)/i.test(norm)) {
      addBotMessage(
        `Podés ver nuestras sucursales aquí:\n${location.origin}/${INFO_LOCAL.sucursalesURL}`
      );
      return;
    }

    // Navegación por secciones
    if (/(catalogo|catálogo|todos los libros)/i.test(norm) && /libro/.test(norm)) {
      addBotMessage(
        `Aquí podés ver el catálogo completo de libros:\n${location.origin}/${INFO_LOCAL.librosURL}`
      );
      return;
    }

    if (/(catalogo|catálogo|todos los regalos)/i.test(norm) && /regalo/.test(norm)) {
      addBotMessage(
        `Aquí podés ver todos los regalos disponibles:\n${location.origin}/${INFO_LOCAL.regalosURL}`
      );
      return;
    }

    if (/regalo/.test(norm) && !/catalogo|catálogo/.test(norm) && /todos|ver regalos/.test(norm)) {
      addBotMessage(
        `Te dejo el enlace al catálogo de regalos:\n${location.origin}/${INFO_LOCAL.regalosURL}`
      );
      return;
    }

    if (/libro/.test(norm) && !/catalogo|catálogo/.test(norm) && /todos|ver libros/.test(norm)) {
      addBotMessage(
        `Te dejo el enlace al catálogo de libros:\n${location.origin}/${INFO_LOCAL.librosURL}`
      );
      return;
    }

    // Recomendaciones de libros / regalos
    if (/recomiendame|recomiéndame|sugerencia|sugerencias|que libro|qué libro|que regalo|qué regalo/.test(norm)) {
      await recomendarSegunMensaje(norm);
      return;
    }

    // Búsqueda de libro o regalo específico
    if (/busco|buscar|tenes|tienes|hay|encuentro/.test(norm) && (norm.includes("libro") || norm.includes("regalo"))) {
      await buscarProductoEspecifico(norm);
      return;
    }

    // Si pregunta por compra/envío
    if (/comprar|compra|envio|envío|carrito|pago|metodo de pago|forma de pago/.test(norm)) {
      addBotMessage(
        "Podés agregar productos al carrito desde las páginas de libros y regalos.\n" +
        "Al finalizar, el sistema te pedirá tus datos y te mostrará las opciones de envío o recogida en el local (según el prototipo que estés viendo)."
      );
      return;
    }

    // Preguntas muy abiertas / problema más serio → ofrecer atención al cliente
    if (/reclamo|queja|problema|no funciona|error/.test(norm)) {
      addBotMessage(
        "Lamento que estés teniendo un problema. Puedo ayudarte con dudas generales del sitio, productos y el local.\n" +
        "Sin embargo, para algunos casos puede ser mejor atención al cliente.\n" +
        "¿Querés que intente comunicarte con atención al cliente? (sí/no)"
      );
      awaitingCustomerServiceConfirmation = true;
      return;
    }

    // Fallback: no sé / sin información
    addBotMessage(
      "Esa es una buena pregunta, pero no tengo acceso a esa información en este momento.\n" +
      "Puedo ayudarte con libros, regalos, horarios, dirección y navegación del sitio.\n" +
      "Si lo preferís, puedo intentar comunicarte con atención al cliente. ¿Te gustaría? (sí/no)"
    );
    awaitingCustomerServiceConfirmation = true;
  }

  async function recomendarSegunMensaje(norm) {
    await cargarJsonSiHaceFalta();

    const quiereRegalo = norm.includes("regalo");
    const quiereLibro = norm.includes("libro") || !quiereRegalo; // por defecto libro

    // Palabras clave de categorías (puedes ajustar según tus JSON)
    const categoriasPosibles = [
      "misterio","romance","fantasia","fantasía","infantil",
      "arte","ciencia ficcion","ciencia ficción","autoayuda",
      "economia","economía","novela"
    ];

    let categoriaDetectada = null;
    for (const cat of categoriasPosibles) {
      if (norm.includes(cat)) {
        categoriaDetectada = cat;
        break;
      }
    }

    // Recomendaciones de libros
    if (quiereLibro && Array.isArray(librosData)) {
      let candidatos = librosData;

      if (categoriaDetectada) {
        const catNorm = normalizarTexto(categoriaDetectada);
        candidatos = librosData.filter(item => {
          const cat = normalizarTexto(
            getField(item, ["categoria","Categoría","categoriaPrincipal","genero","género"], "")
          );
          return cat && cat.includes(catNorm);
        });
      }

      if (candidatos.length === 0) {
        candidatos = librosData;
      }

      const seleccion = tomarAlgunosAleatorios(candidatos, 3);
      if (seleccion.length > 0) {
        let respuesta = "Te puedo sugerir estos libros:\n\n";
        for (const item of seleccion) {
          const titulo = getField(item, ["titulo","Título","nombre","Nombre"], "Título desconocido");
          const autor = getField(item, ["autor","Autor"], "Autor desconocido");
          respuesta += `• “${titulo}” de ${autor}\n`;
        }
        respuesta += "\nSi querés ver más detalles, podés visitar el catálogo de libros:\n" +
          `${location.origin}/${INFO_LOCAL.librosURL}`;
        addBotMessage(respuesta);
        return;
      }
    }

    // Recomendaciones de regalos
    if (quiereRegalo && Array.isArray(regalosData)) {
      let candidatos = regalosData;

      if (categoriaDetectada) {
        const catNorm = normalizarTexto(categoriaDetectada);
        candidatos = regalosData.filter(item => {
          const cat = normalizarTexto(
            getField(item, ["categoria","Categoría","tipo","Tipo"], "")
          );
          return cat && cat.includes(catNorm);
        });
      }

      if (candidatos.length === 0) {
        candidatos = regalosData;
      }

      const seleccion = tomarAlgunosAleatorios(candidatos, 3);
      if (seleccion.length > 0) {
        let respuesta = "Te puedo sugerir estos regalos:\n\n";
        for (const item of seleccion) {
          const nombre = getField(item, ["nombre","Nombre","titulo","Título"], "Regalo");
          const marca = getField(item, ["marca","Marca"], "");
          if (marca) {
            respuesta += `• ${nombre} (marca ${marca})\n`;
          } else {
            respuesta += `• ${nombre}\n`;
          }
        }
        respuesta += "\nPodés ver todos los regalos aquí:\n" +
          `${location.origin}/${INFO_LOCAL.regalosURL}`;
        addBotMessage(respuesta);
        return;
      }
    }

    addBotMessage(
      "Intenté buscar algo para recomendarte, pero no pude encontrar productos adecuados en el catálogo.\n" +
      "Podés revisar directamente el catálogo de libros o regalos en el sitio."
    );
  }

  async function buscarProductoEspecifico(norm) {
    await cargarJsonSiHaceFalta();
    const resultados = [];

    if (Array.isArray(librosData)) {
      for (const item of librosData) {
        const titulo = getField(item, ["titulo","Título","nombre","Nombre"], "");
        const tituloNorm = normalizarTexto(titulo);
        if (titulo && norm.includes(tituloNorm)) {
          resultados.push({ tipo: "libro", item });
        }
      }
    }

    if (Array.isArray(regalosData)) {
      for (const item of regalosData) {
        const nombre = getField(item, ["nombre","Nombre","titulo","Título"], "");
        const nombreNorm = normalizarTexto(nombre);
        if (nombre && norm.includes(nombreNorm)) {
          resultados.push({ tipo: "regalo", item });
        }
      }
    }

    if (resultados.length === 0) {
      addBotMessage(
        "No estoy segura de encontrar ese título o producto exacto en el catálogo.\n" +
        "Por ahora, te recomiendo buscarlo directamente en el catálogo general:\n" +
        `${location.origin}/${INFO_LOCAL.librosURL} (libros)\n` +
        `${location.origin}/${INFO_LOCAL.regalosURL} (regalos)`
      );
      return;
    }

    // Tomar el primer resultado más probable
    const { tipo, item } = resultados[0];
    const titulo = getField(item, ["titulo","Título","nombre","Nombre"], "Producto");
    const autor = getField(item, ["autor","Autor"], null);
    const id = getField(item, ["id","ID","codigo","Código","sku","SKU"], null);

    let mensaje = "";

    if (tipo === "libro") {
      if (autor) {
        mensaje += `Creo que te referís al libro “${titulo}” de ${autor}.\n`;
      } else {
        mensaje += `Creo que te referís al libro “${titulo}”.\n`;
      }
      if (id) {
        mensaje += `Podés verlo aquí:\n${location.origin}/producto.html?id=${encodeURIComponent(id)}`;
      } else {
        mensaje += `Podés buscarlo en el catálogo de libros:\n${location.origin}/${INFO_LOCAL.librosURL}`;
      }
    } else {
      const marca = getField(item, ["marca","Marca"], null);
      if (marca) {
        mensaje += `Creo que te referís al regalo “${titulo}” (marca ${marca}).\n`;
      } else {
        mensaje += `Creo que te referís al regalo “${titulo}”.\n`;
      }
      if (id) {
        mensaje += `Podés verlo aquí:\n${location.origin}/producto-regalo.html?id=${encodeURIComponent(id)}`;
      } else {
        mensaje += `Podés buscarlo en el catálogo de regalos:\n${location.origin}/${INFO_LOCAL.regalosURL}`;
      }
    }

    addBotMessage(mensaje);
  }

  function tomarAlgunosAleatorios(array, maxCantidad) {
    const copia = array.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, maxCantidad);
  }

  // ---------- Inicialización ----------
  document.addEventListener("DOMContentLoaded", () => {
    crearUI();
    // Opcional: precargar JSON en segundo plano
    cargarJsonSiHaceFalta();
  });

})();
