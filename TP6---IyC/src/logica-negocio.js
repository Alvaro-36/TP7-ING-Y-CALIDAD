// Funciones puras: ninguna muta sus argumentos. `mes` va de 1 a 12.

const reserva = (id, fecha, hora, cliente, telefono, estado) => ({
  id, fecha, hora, cliente, telefono, tipoEvento: 'Consulta general', estado, motivoCancelacion: null,
})

export const reservasDePrueba = [
  reserva(1, '2026-10-14', '16:00', 'Ana Gómez', '2615551111', 'Confirmada'),
  reserva(2, '2026-10-15', '09:00', 'Luis Pérez', '2615552222', 'Confirmada'),
  reserva(3, '2026-10-15', '14:00', 'Carla Díaz', '2615553333', 'Pendiente'),
  reserva(4, '2026-10-15', '11:30', 'Juan Sosa', '2615554444', 'Confirmada'),
  reserva(5, '2026-10-15', '17:00', 'Pedro Ruiz', '2615555555', 'Cancelada'),
  reserva(6, '2026-10-20', '10:00', 'María Vega', '', 'Pendiente'),
  reserva(7, '2026-11-03', '12:00', 'Sofía Luna', '2615556666', 'Pendiente'),
]

export const MAX_MOTIVO = 200
export const HORARIOS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const ESTADOS_FINALES = ['Cancelada', 'Completado']
const TRANSICIONES = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Cancelada', 'Completado'],
  Cancelada: [],
  Completado: [],
}

const pad = (n) => String(n).padStart(2, '0')

// Fecha local (no UTC) en formato 'YYYY-MM-DD'.
export const aFechaISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const obtenerReservasDelDia = (reservas, fecha) => reservas.filter((r) => r.fecha === fecha)

export const ordenarPorHora = (reservas) => [...reservas].sort((a, b) => a.hora.localeCompare(b.hora))

export const filtrarPorEstado = (reservas, estado) => reservas.filter((r) => r.estado === estado)

// Acepta Date, 'YYYY-MM-DD' o ISO con hora; compara el día en hora local.
// 'YYYY-MM-DD' no pasa por new Date() porque lo interpretaría como UTC.
export const esMismoDia = (a, b) => {
  const iso = (x) => (typeof x !== 'string' ? aFechaISO(x) : x.length === 10 ? x : aFechaISO(new Date(x)))
  return iso(a) === iso(b)
}

export const diasConReservas = (reservas, mes, anio) => {
  const prefijo = `${anio}-${pad(mes)}-`
  const conteo = {}
  for (const r of reservas) {
    if (r.estado !== 'Cancelada' && r.fecha.startsWith(prefijo)) conteo[r.fecha] = (conteo[r.fecha] ?? 0) + 1
  }
  return conteo
}

export const tamanoIndicador = (cantidad) => (cantidad <= 1 ? 'sm' : cantidad <= 3 ? 'md' : 'lg')

export const obtenerReservaPorId = (reservas, id) => reservas.find((r) => r.id === id) ?? null

export const formatearDetalle = (r) => ({
  cliente: r.cliente,
  telefono: r.telefono || 'Sin teléfono',
  fecha: r.fecha,
  hora: r.hora,
  tipoEvento: r.tipoEvento,
  estado: r.estado,
})

export const normalizarMotivo = (motivo) => String(motivo ?? '').trim().replace(/ +/g, ' ') || null

export const validarMotivoCancelacion = (motivo) =>
  String(motivo ?? '').trim().length > MAX_MOTIVO
    ? { valido: false, error: `El motivo no puede superar los ${MAX_MOTIVO} caracteres` }
    : { valido: true, error: null }

export const cancelarReserva = (r, motivo) => {
  if (!r) throw new Error('Reserva inválida')
  if (r.estado === 'Cancelada') throw new Error('La reserva ya está cancelada')
  if (r.estado === 'Completado') throw new Error('No se puede cancelar una reserva completada')
  return { ...r, estado: 'Cancelada', motivoCancelacion: motivo ?? null }
}

// ponytail: una reserva ocupa el slot de su hora en punto (11:30 → slot 11:00).
const slotDe = (hora) => `${hora.slice(0, 2)}:00`

export const generarSlots = (reservasDelDia) =>
  HORARIOS.map((hora) => ({
    hora,
    estado: reservasDelDia.some((r) => r.estado !== 'Cancelada' && slotDe(r.hora) === hora) ? 'Reservado' : 'Disponible',
  }))

export const liberarSlot = (slots, r) => slots.map((s) => (s.hora === r.hora ? { ...s, estado: 'Disponible' } : { ...s }))

export const esReservaPasada = (r, ahora = new Date()) => {
  if (!r) throw new Error('Reserva inválida')
  const [a, m, d] = r.fecha.split('-').map(Number)
  const [h, min] = r.hora.split(':').map(Number)
  return new Date(a, m - 1, d, h, min) < ahora
}

export const puedeCancelar = (r, ahora = new Date()) => {
  if (!r) throw new Error('Reserva inválida')
  return !esReservaPasada(r, ahora) && !ESTADOS_FINALES.includes(r.estado)
}

export const accionesDisponibles = (r, ahora) => (puedeCancelar(r, ahora) ? ['ver-detalle', 'cancelar'] : ['ver-detalle'])

export const transicionEstadoValida = (desde, hacia) => TRANSICIONES[desde]?.includes(hacia) ?? false

export const esEstadoFinal = (estado) => ESTADOS_FINALES.includes(estado)

const validarAnio = (anio) => {
  if (!Number.isInteger(anio)) throw new Error('Año inválido')
}

const validarMes = (mes) => {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) throw new Error('Mes inválido')
}

export const cambiarMes = (mes, anio, delta) => {
  validarMes(mes)
  validarAnio(anio)
  if (!Number.isInteger(delta)) throw new Error('Delta inválido')

  const total = anio * 12 + (mes - 1) + delta
  return { mes: (((total % 12) + 12) % 12) + 1, anio: Math.floor(total / 12) }
}

export const generarDiasDelMes = (mes, anio) => {
  validarMes(mes)
  validarAnio(anio)

  const cantidad = new Date(anio, mes, 0).getDate()
  return Array.from({ length: cantidad }, (_, i) => `${anio}-${pad(mes)}-${pad(i + 1)}`)
}