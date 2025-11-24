// Datos falsos de libros
const libros = [
  { titulo: "Harry Potter", img: "img/harry.jpg", precio: "$12.99" },
  { titulo: "El Principito", img: "img/principito.jpg", precio: "$9.50" },
  { titulo: "It", img: "img/it.jpg", precio: "$14.00" },
  { titulo: "Cien años de soledad", img: "img/cien.jpg", precio: "$11.75" },
];

// Mostrar libros al cargar
const catalogo = document.getElementById("catalogo");

function pintarLibros(lista) {
  catalogo.innerHTML = "";
  if (lista.length === 0) {
    catalogo.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  lista.forEach((l) => {
    const div = document.createElement("div");
    div.className = "libro";
    div.innerHTML = `
      <img src="${l.img}" alt="${l.titulo}">
      <h4>${l.titulo}</h4>
      <p>${l.precio}</p>
    `;
    catalogo.appendChild(div);
  });
}

pintarLibros(libros);

// Buscador básico
function buscarLibro() {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const filtrados = libros.filter((l) =>
    l.titulo.toLowerCase().includes(texto)
  );
  pintarLibros(filtrados);
}