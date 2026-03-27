import express from 'express';

const router = express.Router();

// Ruta para obtener todas las propiedades
router.get('/propiedades', (req, res) => {
    res.render('propiedades/obtenerPropiedades', {
        pagina: 'Bienvenido a Nuestro Sistema de Bienes Raices',
        barra: true

    });
});
export default router;
