// Datos de la Tabla N° 3 (con Salta Capital agregada)
const localidades = [
  { nombre: "Ciudad de Buenos Aires", temp: 6.6 },
  { nombre: "Azul", temp: 2.6 },
  { nombre: "Balcarce", temp: 3.5 },
  { nombre: "Coronel Suárez", temp: 1.5 },
  { nombre: "Mar del Plata", temp: 4.2 },
  { nombre: "Córdoba", temp: 3.9 },
  { nombre: "Laboulaye", temp: 2.9 },
  { nombre: "Río Cuarto", temp: 2.7 },
  { nombre: "Comodoro Rivadavia", temp: 3.0 },
  { nombre: "Esquel", temp: -1.5 },
  { nombre: "Trelew", temp: 1.5 },
  { nombre: "General Pico", temp: 1.1 },
  { nombre: "Santa Rosa", temp: 1.2 },
  { nombre: "Col. Alvear", temp: 0.0 },
  { nombre: "Mendoza", temp: 3.5 },
  { nombre: "Chos Malal", temp: 0.2 },
  { nombre: "Las Lajas", temp: -1.8 },
  { nombre: "Plaza Huincul", temp: 0.2 },
  { nombre: "Cipolletti", temp: -0.4 },
  { nombre: "Choelé Choel", temp: 1.4 },
  { nombre: "General Conesa", temp: 1.4 },
  { nombre: "Salta Capital", temp: 4.5 },
  { nombre: "San Carlos de Bariloche", temp: -0.6 },
  { nombre: "Cañadón León", temp: -2.3 },
  { nombre: "Colonia Las Heras", temp: -0.8 },
  { nombre: "Río Grande", temp: -2.5 },
  { nombre: "Ushuaia", temp: -1.5 },
  { nombre: "Puerto Stanley", temp: -3.0 }
];

// Datos de la Tabla N° 4 (rangos)
const rangos = [
  { id: 'A', temp: -10, capacidad: 6000 },
  { id: 'B', temp: -5, capacidad: 8000 },
  { id: 'C', temp: 0.5, capacidad: 9000 },
  { id: 'D', temp: 5, capacidad: 11000 }
];

// Función para formatear números
function formatearNumero(num) {
  return num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Función para llenar selects
function llenarSelects() {
  const localidadSelect = document.getElementById('localidad');
  const rangoSelect = document.getElementById('rango');

  const localidadesOrdenadas = [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre));

  localidadesOrdenadas.forEach(loc => {
    const option = document.createElement('option');
    option.value = loc.temp;
    option.textContent = loc.nombre;
    localidadSelect.appendChild(option);
  });

  localidadSelect.value = -0.6;

  rangos.forEach(rango => {
    const option = document.createElement('option');
    option.value = rango.id;
    option.textContent = `Rango ${rango.id} (${rango.temp}°C → ${rango.capacidad.toLocaleString()} kcal/h)`;
    rangoSelect.appendChild(option);
  });

  rangoSelect.value = 'B';
}

// Función para actualizar campos según rango seleccionado
function actualizarRango() {
  const rangoSelect = document.getElementById('rango');
  const rangoId = rangoSelect.value;
  const rango = rangos.find(r => r.id === rangoId);
  
  if (rango) {
    document.getElementById('tempBase').value = rango.temp;
    document.getElementById('capBase').value = rango.capacidad;
    document.getElementById('refTexto').textContent = `Rango ${rango.id} (${rango.temp}°C) → ${rango.capacidad.toLocaleString()} kcal/h`;
    document.getElementById('rangoBadge').textContent = `Rango ${rango.id}`;
  }
}

// Función para actualizar temperatura de localidad
function actualizarLocalidad() {
  const localidadSelect = document.getElementById('localidad');
  const temp = parseFloat(localidadSelect.value);
  if (!isNaN(temp)) {
    document.getElementById('tempLocalidad').value = temp;
  }
}

// Función principal de cálculo
function calcular() {
  const consumo = parseFloat(document.getElementById('consumo').value) || 12500;
  const tempLocal = parseFloat(document.getElementById('tempLocalidad').value) || -0.6;
  const tempBase = parseFloat(document.getElementById('tempBase').value) || -5;
  const capBase = parseFloat(document.getElementById('capBase').value) || 8000;
  
  const rangoSelect = document.getElementById('rango');
  const rangoId = rangoSelect.value;
  const rangoIndex = rangos.findIndex(r => r.id === rangoId);
  
  let deltaTemp, deltaCap;
  
  if (rangoIndex < rangos.length - 1) {
    const rangoActual = rangos[rangoIndex];
    const rangoSig = rangos[rangoIndex + 1];
    deltaTemp = rangoSig.temp - rangoActual.temp;
    deltaCap = rangoSig.capacidad - rangoActual.capacidad;
  } else {
    deltaTemp = 1;
    deltaCap = 0;
  }

  let capacidadCorregida;
  const diffLocal = tempLocal - tempBase;
  
  if (deltaTemp !== 0 && rangoIndex < rangos.length - 1) {
    const incremento = (diffLocal * deltaCap) / deltaTemp;
    capacidadCorregida = capBase + incremento;
  } else {
    capacidadCorregida = capBase;
  }

  let cilindrosActivosFloat = consumo / capacidadCorregida;
  
  // NUEVA LÓGICA: Redondear al alza SOLO si el primer decimal es > 0
  // Extraer el primer decimal
  const primerDecimal = Math.floor((cilindrosActivosFloat % 1) * 10);
  
  let cilindrosActivos;
  if (primerDecimal === 0) {
    // Si el primer decimal es 0, redondear hacia abajo
    cilindrosActivos = Math.floor(cilindrosActivosFloat);
  } else {
    // Si el primer decimal es > 0, redondear al alza
    cilindrosActivos = Math.ceil(cilindrosActivosFloat);
  }
  
  if (cilindrosActivos < 1) cilindrosActivos = 1;

  const reserva = cilindrosActivos;
  const totalCilindros = cilindrosActivos + reserva;

  // Actualizar UI
  document.getElementById('capacidadCorregida').innerHTML = `${capacidadCorregida.toFixed(1)} <small>kcal/h</small>`;
  document.getElementById('cilindrosActivos').textContent = cilindrosActivos;
  document.getElementById('totalBadge').textContent = totalCilindros;
  document.getElementById('usoDetalle').textContent = cilindrosActivos;
  document.getElementById('reservaDetalle').textContent = reserva;
  document.getElementById('totalDetalle').textContent = totalCilindros;

  // Detalle de cálculos - Paso 1
  const nombreLocalidad = localidades.find(l => l.temp === tempLocal)?.nombre || 'Localidad seleccionada';
  const rangoActual = rangos[rangoIndex];
  const rangoSig = rangoIndex < rangos.length - 1 ? rangos[rangoIndex + 1] : null;
  
  let pasoInterpolacion = document.getElementById('pasoInterpolacion');
  if (rangoSig) {
    pasoInterpolacion.innerHTML = `
      <div><strong>Datos de referencia:</strong></div>
      <div>Rango ${rangoActual.id}: ${rangoActual.temp}°C → ${formatearNumero(rangoActual.capacidad)} kcal/h</div>
      <div>Rango ${rangoSig.id}: ${rangoSig.temp}°C → ${formatearNumero(rangoSig.capacidad)} kcal/h</div>
      <div style="margin-top:4px;"><strong>Diferencia de temperatura:</strong> ${deltaTemp.toFixed(1)} °C</div>
      <div><strong>Diferencia de capacidad:</strong> ${formatearNumero(deltaCap)} kcal/h</div>
      <div><strong>Temperatura de ${nombreLocalidad}:</strong> ${tempLocal.toFixed(1)} °C</div>
      <div><strong>Diferencia respecto al rango base:</strong> ${diffLocal.toFixed(1)} °C</div>
      <div><strong>Incremento:</strong> ${(diffLocal * deltaCap / deltaTemp).toFixed(2)} kcal/h</div>
      <div class="resultado-paso"><strong>Capacidad corregida =</strong> ${capacidadCorregida.toFixed(2)} kcal/h</div>
    `;
  } else {
    pasoInterpolacion.innerHTML = `
      <div><strong>⚠️ Último rango (D):</strong> No hay interpolación disponible</div>
      <div><strong>Capacidad base:</strong> ${formatearNumero(capBase)} kcal/h</div>
      <div class="resultado-paso"><strong>Capacidad corregida =</strong> ${capacidadCorregida.toFixed(2)} kcal/h</div>
    `;
  }

  // Paso 2 - Actualizado para mostrar el tipo de redondeo
  let redondeoExplicacion;
  if (primerDecimal === 0) {
    redondeoExplicacion = `(redondeo a ${cilindrosActivos} porque el primer decimal es 0)`;
  } else {
    redondeoExplicacion = `(redondeo al alza de ${cilindrosActivosFloat.toFixed(2)} a ${cilindrosActivos})`;
  }
  
  document.getElementById('pasoCilindros').innerHTML = `
    <div><strong>Fórmula:</strong> Cilindros activos = Consumo / Capacidad corregida</div>
    <div><strong>Consumo:</strong> ${formatearNumero(consumo)} kcal/h</div>
    <div><strong>Capacidad corregida:</strong> ${capacidadCorregida.toFixed(2)} kcal/h</div>
    <div><strong>Resultado:</strong> ${formatearNumero(consumo)} / ${capacidadCorregida.toFixed(2)} = ${cilindrosActivosFloat.toFixed(4)}</div>
    <div><strong>Primer decimal:</strong> ${primerDecimal}</div>
    <div class="resultado-paso"><strong>Cilindros activos =</strong> ${cilindrosActivos} ${redondeoExplicacion}</div>
  `;

  // Paso 3
  document.getElementById('pasoTotal').innerHTML = `
    <div><strong>Cilindros en uso:</strong> ${cilindrosActivos}</div>
    <div><strong>Cilindros de reserva:</strong> ${reserva} (misma cantidad que los activos)</div>
    <div><strong>Total:</strong> ${cilindrosActivos} + ${reserva} = ${totalCilindros}</div>
    <div class="resultado-paso"><strong>Batería total =</strong> ${totalCilindros} cilindros</div>
    <div style="font-size:0.85rem; color:#1f6390; margin-top:0.3rem;">
      ⚙️ Configuración: ${cilindrosActivos}x${reserva} (${cilindrosActivos} en uso + ${reserva} en reserva)
    </div>
  `;

  const capacidadSpan = document.getElementById('capacidadCorregida');
  if (capacidadCorregida < 1000) {
    capacidadSpan.style.color = '#b22234';
  } else {
    capacidadSpan.style.color = '#022b44';
  }
}

// Función para guardar como PDF usando la impresión del navegador
function guardarPDF() {
  const btnPdf = document.getElementById('btnPdf');
  
  // Deshabilitar botón temporalmente
  btnPdf.disabled = true;
  btnPdf.textContent = '⏳ Preparando PDF...';
  
  // Pequeño delay para que el botón se actualice
  setTimeout(function() {
    // Usar la función de impresión del navegador
    window.print();
    
    // Restaurar botón después de la impresión
    setTimeout(function() {
      btnPdf.disabled = false;
      btnPdf.textContent = '📄 Guardar como PDF';
    }, 500);
  }, 300);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  llenarSelects();
  actualizarRango();
  actualizarLocalidad();
  
  document.getElementById('rango').addEventListener('change', function() {
    actualizarRango();
    calcular();
  });
  document.getElementById('localidad').addEventListener('change', function() {
    actualizarLocalidad();
    calcular();
  });
  document.getElementById('consumo').addEventListener('input', calcular);
  document.getElementById('btnPdf').addEventListener('click', guardarPDF);
  
  calcular();
});