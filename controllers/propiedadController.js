
const obtenerPropiedades = (req, res) => {
    res.render('propiedades/obtenerPropiedades', {
        pagina: 'Bienvenido al Sistema de Bienes Raices',
        barra: true
    });
}
export {
    obtenerPropiedades
};