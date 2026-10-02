import './style.css'
import {
  reservasDePrueba, aFechaISO, obtenerReservasDelDia, ordenarPorHora, diasConReservas, tamanoIndicador,
  cambiarMes, generarDiasDelMes, obtenerReservaPorId, formatearDetalle, cancelarReserva,
  validarMotivoCancelacion, normalizarMotivo, puedeCancelar, esEstadoFinal, generarSlots,
} from '../src/logica-negocio.js'

const CLAVE = 'agendaya-reservas'
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function cargarReservas() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE))
    if (Array.isArray(guardadas) && guardadas.length) return guardadas
  } catch {}
  return reservasDePrueba
}

const guardarReservas = () => localStorage.setItem(CLAVE, JSON.stringify(estado.reservas))

const hoy = new Date()
const estado = {
  mes: hoy.getMonth() + 1,
  anio: hoy.getFullYear(),
  diaSeleccionado: aFechaISO(hoy),
  reservas: cargarReservas(),
  detalleId: null,
  cancelandoId: null,
  mensaje: null,
}

const app = document.querySelector('#app')

function renderCalendario() {
  const conteo = diasConReservas(estado.reservas, estado.mes, estado.anio)
  const offset = (new Date(estado.anio, estado.mes - 1, 1).getDay() + 6) % 7 // semana empieza el lunes
  const vacios = '<span></span>'.repeat(offset)
  const dias = generarDiasDelMes(estado.mes, estado.anio).map((fecha) => {
    const cant = conteo[fecha]
    const indicador = cant ? `<span data-cy="day-indicator" class="indicador ${tamanoIndicador(cant)}"></span>` : ''
    const sel = fecha === estado.diaSeleccionado ? ' selected' : ''
    return `<button data-cy="calendar-day" data-date="${fecha}" class="dia${sel}">${indicador}<span class="num">${Number(fecha.slice(8))}</span></button>`
  })
  return `
    <section class="calendario">
      <header>
        <button data-cy="calendar-prev-month" aria-label="Mes anterior">‹</button>
        <h2 data-cy="calendar-title">${MESES[estado.mes - 1]} ${estado.anio}</h2>
        <button data-cy="calendar-next-month" aria-label="Mes siguiente">›</button>
      </header>
      <div class="grilla">
        ${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<span class="semana">${d}</span>`).join('')}
        ${vacios}${dias.join('')}
      </div>
    </section>`
}

function renderLista(delDia, ahora) {
  const tarjetas = ordenarPorHora(delDia).map((r) => {
    const boton = esEstadoFinal(r.estado)
      ? ''
      : `<button data-cy="cancel-reservation" ${puedeCancelar(r, ahora) ? '' : 'disabled'}>Cancelar</button>`
    return `
      <li data-cy="reservation-card" data-id="${r.id}" class="tarjeta">
        <strong data-cy="reservation-name">${r.cliente}</strong>
        <span data-cy="reservation-phone">${formatearDetalle(r).telefono}</span>
        <span data-cy="reservation-time">${r.hora}</span>
        <span data-cy="reservation-status" class="estado estado-${r.estado.toLowerCase()}">${r.estado}</span>
        ${boton}
      </li>`
  })
  return `
    <section>
      <h3 data-cy="selected-day-title">Reservas del ${estado.diaSeleccionado}</h3>      ${tarjetas.length
        ? `<ul data-cy="day-reservations-list">${tarjetas.join('')}</ul>`
        : '<p data-cy="empty-day-message">No hay reservas programadas para este día</p>'}
    </section>`
}

function renderHorarios(delDia) {
  const filas = generarSlots(delDia).map(
    (s) => `<li>${s.hora} <span data-cy="slot-status" data-hora="${s.hora}" class="${s.estado.toLowerCase()}">${s.estado}</span></li>`,
  )
  return `<section><h3>Horarios</h3><ul class="horarios">${filas.join('')}</ul></section>`
}

function renderDetalle() {
  const r = obtenerReservaPorId(estado.reservas, estado.detalleId)
  if (!r) return ''
  const d = formatearDetalle(r)
  return `
    <div class="fondo">
      <div data-cy="reservation-detail" class="modal" role="dialog" aria-label="Detalle de reserva">
        <p><b>Cliente:</b> ${d.cliente}</p>
        <p><b>Teléfono:</b> ${d.telefono}</p>
        <p><b>Fecha:</b> ${d.fecha}</p>
        <p><b>Hora:</b> ${d.hora}</p>
        <p><b>Tipo de evento:</b> ${d.tipoEvento}</p>
        <p><b>Estado:</b> ${d.estado}</p>
        <button data-cy="detail-close">Cerrar</button>
      </div>
    </div>`
}

function renderCancelar() {
  if (estado.cancelandoId === null) return ''
  return `
    <div class="fondo">
      <div data-cy="cancel-modal" class="modal" role="dialog" aria-label="Cancelar reserva">
        <label for="motivo">Motivo de cancelación (opcional)</label>
        <textarea id="motivo" data-cy="cancel-reason-input" rows="4"></textarea>
        <p data-cy="cancel-reason-error" class="error" hidden></p>
        <button data-cy="confirm-cancel">Confirmar cancelación</button>
        <button data-cy="abort-cancel">Volver</button>
      </div>
    </div>`
}

function render() {
  const ahora = new Date()
  const delDia = obtenerReservasDelDia(estado.reservas, estado.diaSeleccionado)
  app.innerHTML = `
    <h1>AgendaYA · Gestión de Agenda</h1>
    ${estado.mensaje ? `<p data-cy="cancel-success" class="exito">${estado.mensaje}</p>` : ''}
    <main>
      ${renderCalendario()}
      ${renderLista(delDia, ahora)}
      ${renderHorarios(delDia)}
    </main>
    ${renderDetalle()}
    ${renderCancelar()}`
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-cy]')
  if (!el) return
  const card = el.closest('[data-cy="reservation-card"]')
  // data-id siempre es string; se busca el id real para soportar ids numéricos o de texto.
  const idTarjeta = card && estado.reservas.find((r) => String(r.id) === card.dataset.id)?.id
  const accion = el.dataset.cy

  if (accion === 'calendar-prev-month' || accion === 'calendar-next-month') {
    Object.assign(estado, cambiarMes(estado.mes, estado.anio, accion === 'calendar-next-month' ? 1 : -1))
  } else if (accion === 'calendar-day') {
    estado.diaSeleccionado = el.dataset.date
  } else if (accion === 'cancel-reservation') {
    const reservaSeleccionada = estado.reservas.find((r) => r.id === idTarjeta)
    if (!reservaSeleccionada || !puedeCancelar(reservaSeleccionada, new Date())) return
    estado.cancelandoId = idTarjeta
  } else if (card) {
    estado.detalleId = idTarjeta
  } else if (accion === 'detail-close') {
    estado.detalleId = null
  } else if (accion === 'abort-cancel') {
    estado.cancelandoId = null
    return render()
  } else if (accion === 'confirm-cancel') {
    const motivo = app.querySelector('[data-cy="cancel-reason-input"]').value
    if (!validarMotivoCancelacion(motivo).valido) return
    estado.reservas = estado.reservas.map((r) => (r.id === estado.cancelandoId ? cancelarReserva(r, normalizarMotivo(motivo)) : r))
    guardarReservas()
    estado.cancelandoId = null
    estado.mensaje = 'La reserva fue cancelada'
    return render()
  } else {
    return
  }
  estado.mensaje = null
  render()
})

// Validación en vivo sin re-render, para no perder el foco del textarea.
app.addEventListener('input', (e) => {
  if (e.target.dataset.cy !== 'cancel-reason-input') return
  const { valido, error } = validarMotivoCancelacion(e.target.value)
  const errorEl = app.querySelector('[data-cy="cancel-reason-error"]')
  errorEl.textContent = error ?? ''
  errorEl.hidden = valido
  app.querySelector('[data-cy="confirm-cancel"]').disabled = !valido
})

render()
