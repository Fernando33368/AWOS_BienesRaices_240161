import express from 'express'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import usuariosRoutes from "./routes/usuariosRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import db from './config/db.js'  

// Craear la app
const app = express()

// ROUTING
app.get('/', function(req, res) {
    res.send('Hola Mundo en express')
});

// Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended: true}) )

// Habilitar Cookies Parser
app.use( cookieParser() )

// Habilitar CSURF
app.use( csurf({cookie: true}) )

//Conexion a la base de Datos
try {
    await db.authenticate();
    await db.sync({ alter: true }); // CREA LAS TABLAS SI NO EXISTEN
    console.log('Conexion Correcta a la Base de Datos')
    
} catch (error) {
    console.log(error)
}

// Habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

app.get('/registro', (req, res) => {
    res.render('auth/registro'), {
        pagina: 'registro'
    }
})

// Carpeta publica
app.use(express.static('public'))

// Importamos sus rutas (ruteo)
app.use("/auth", usuariosRoutes)
app.use("/", propiedadesRoutes)

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El Servidor esta funcionando en el puerto ${port}`)
}); 