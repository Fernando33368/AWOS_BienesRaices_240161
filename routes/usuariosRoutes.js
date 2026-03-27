import express from "express";
import { formularioLogin, autenticar ,formularioRegistro, registrar, confirmar, formularioRecuperarPassword, resetPassword, comprobarToken, nuevoPassword } from '../controllers/usuarioController.js';

// Creamos el ruteador
const router = express.Router();

router.get("/login", formularioLogin)
router.post("/login", autenticar)

router.get("/registro", formularioRegistro)
router.post("/registro", registrar)

router.get("/confirmar/:token", confirmar)

router.get("/recuperacion-password", formularioRecuperarPassword)
router.post("/recuperacion-password", resetPassword)

// Almacenar el nuevo password
router.get("/recuperacion-password/:token", comprobarToken)
router.post("/recuperacion-password/:token", nuevoPassword)

export default router