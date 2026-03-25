// Fecha actual en el footer
(function() {
  const d = new Date();
  const fecha = document.getElementById('fecha');
  if (fecha) {
    fecha.textContent =
      '// ' + d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
})();
