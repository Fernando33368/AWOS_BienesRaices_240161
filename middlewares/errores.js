// middlewares/errores.js

/**
 * Tipos de error con su semáforo de color
 * verde  → info / éxito
 * amarillo → advertencia / validación
 * rojo   → error del servidor / autenticación
 */
const TIPOS_ERROR = {
    validacion:    { color: 'amarillo', icono: '⚠', tiempo: 4000 },
    autenticacion: { color: 'rojo',     icono: '✖', tiempo: 5000 },
    notFound:      { color: 'amarillo', icono: '⚠', tiempo: 4000 },
    servidor:      { color: 'rojo',     icono: '✖', tiempo: 6000 },
    exito:         { color: 'verde',    icono: '✔', tiempo: 3000 },
}

/**
 * Construye el objeto de alerta que se pasa a la vista Pug.
 * @param {string} tipo   - Clave de TIPOS_ERROR
 * @param {string} mensaje - Texto descriptivo del error
 */
const crearAlerta = (tipo, mensaje) => {
    const config = TIPOS_ERROR[tipo] ?? TIPOS_ERROR.servidor
    return {
        color:   config.color,
        icono:   config.icono,
        tiempo:  config.tiempo,
        mensaje,
    }
}

// ─── Middleware 404 ───────────────────────────────────────────────────────────
const manejar404 = (req, res) => {
    const alerta = crearAlerta('notFound', `La página "${req.originalUrl}" no existe.`)
    res.status(404).render('templates/mensaje', {
        pagina: 'Página no encontrada',
        alerta,
    })
}

// ─── Middleware de error general ──────────────────────────────────────────────
const manejarError = (err, req, res, next) => {
    console.error('[ERROR]', err.message)

    const esAutenticacion = err.status === 401 || err.status === 403
    const tipo = esAutenticacion ? 'autenticacion' : 'servidor'
    const mensaje = process.env.NODE_ENV === 'production'
        ? 'Ocurrió un error. Intenta de nuevo más tarde.'
        : err.message

    const alerta = crearAlerta(tipo, mensaje)
    res.status(err.status ?? 500).render('templates/mensaje', {
        pagina: 'Error',
        alerta,
    })
}

export { crearAlerta, manejar404, manejarError, TIPOS_ERROR }