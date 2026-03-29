import { check, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import Usuario from "../models/Usuario.js"
import { generarJWT, generarId } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"

const formularioLogin = (req, res) =>{
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {

    await check('email').isEmail().withMessage('Verifica tu email').run(req)
    await check('password').notEmpty().withMessage('La contraseña no puede ir vacia').run(req)

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { email, password } = req.body

    const usuario = await Usuario.findOne({ where: { email }})

    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }

    if(usuario.bloqueado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Cuenta bloqueada. Revisa tu correo'}]
        })
    }

    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    }

    const passwordCorrecto = await usuario.verificarPassword(password);

    if(!passwordCorrecto){

        usuario.intentos = (usuario.intentos || 0) + 1;

        if(usuario.intentos >= 5){
            usuario.bloqueado = true;
            usuario.tokenBloqueo = generarId();

            await usuario.save();

            console.log(`Desbloquear en: ${process.env.BACKEND_URL}/auth/desbloquear/${usuario.tokenBloqueo}`)

            return res.render('auth/login',{
                pagina: 'Iniciar Sesión',
                csrfToken: req.csrfToken(),
                errores: [{msg: 'Cuenta bloqueada. Revisa tu correo para desbloquear'}]
            })
        }

        await usuario.save();

        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: `Contraseña incorrecta (${usuario.intentos}/5)`}]
        })
    }

    usuario.intentos = 0;
    await usuario.save();

    const token = generarJWT(usuario)

    return res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24
    }).redirect('/propiedades')
}

const formularioRegistro = (req, res) =>{
    res.render('auth/registro',{
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) =>{
    // Validacion
    await check('nombre').notEmpty().withMessage('⚠️ El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('⚠️ Verifica tu email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('⚠️ La contraseña debe tener almenos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('⚠️ La contaseña no coincide').run(req)

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        // ERRORES
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const {nombre, email, password} = req.body

    const usuarioExiste = await Usuario.findOne({ where : { email } })
    if (usuarioExiste){
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario ya esta registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
 
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

   res.render('templates/mensaje', {
    pagina: 'Cuenta Creada Correctamente',
    mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace'
   })
}


const confirmar = async (req, res) => {

    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al Confirmar tu Cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }


    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo Correctamente'
    })
    
}

const formularioRecuperarPassword = (req, res) =>{
    res.render('auth/recuperacion-password',{
        pagina: 'Recuperar Contraseña',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    
    await check('email').isEmail().withMessage('Verifica tu email').run(req)

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {
        return res.render('auth/recuperacion-password',{
            pagina: 'Recuperar tu Contraseña de tu cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }


    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email }})

    if(!usuario){
        return res.render('auth/recuperacion-password',{
            pagina: 'Recuperar tu Contraseña de tu cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no Pertenece a ningun usuario'}]
        })
    }

    // 🔒 VALIDACIÓN AGREGADA
    if(!usuario.confirmado){
        return res.render('auth/recuperacion-password',{
            pagina: 'Recuperar tu Contraseña de tu cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Debes confirmar tu cuenta primero'}]
        })
    }

    usuario.token = generarId();
    await usuario.save();


    emailOlvidePassword({

        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    res.render('templates/mensaje', {
        pagina: 'Reestablecer tu Contraseña',
        mensaje: 'Hemos Enviado un Email con las Instrucciones para Reestablecer tu Contraseña'
    })

}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ where: { token }})

   // ❌ TOKEN INVALIDO
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu contraseña',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    // 🔒 VALIDAR QUE ESTÉ CONFIRMADO
    if(!usuario.confirmado){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Cuenta no confirmada',
            mensaje: 'Debes confirmar tu cuenta antes de cambiar la contraseña',
            error: true
        })
    }

    // ✅ TODO OK → mostrar formulario
    res.render('auth/reset-password', {
        pagina: 'Reestablecer tu Contraseña',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe cumplir los requisitos').run(req)

    let resultado = validationResult(req)
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Reestablecer tu Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ where: { token }})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error',
            mensaje: 'Token no válido o expirado',
            error: true
        })
    }

    // 🔒 VALIDACIÓN AGREGADA
    if(!usuario.confirmado){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error',
            mensaje: 'Debes confirmar tu cuenta primero',
            error: true
        })
    }

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña Reestablecida',
        mensaje: 'La contraseña se guardo Correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioRecuperarPassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}