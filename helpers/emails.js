import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const html = wrapper(`
        ${baseHeader('🏠', 'Registro')}
        <tr><td style="background:#c9a84c;height:4px;"></td></tr>

        <tr>
          <td style="background:linear-gradient(135deg,#f7f3e8,#fffdf5);padding:32px 48px;text-align:center;border-bottom:1px solid #e9dfc8;">
            <p style="margin:0 0 6px;color:#c9a84c;font-size:12px;letter-spacing:4px;text-transform:uppercase;">¡Registro exitoso!</p>
            <h2 style="margin:0;color:#1a3c5e;font-size:26px;font-weight:normal;">
              Bienvenido, <strong>${nombre}</strong>
            </h2>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:40px 48px 36px;">
            <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.8;">
              Tu cuenta ha sido creada exitosamente en <strong>Bienes Raíces</strong>.
            </p>

            <div style="border:1px solid #e2e8f0;border-radius:6px;padding:16px 20px;margin-bottom:32px;background:#f7fafc;">
              <p style="margin:0 0 10px;color:#1a3c5e;font-size:13px;font-weight:bold;">
                Datos de tu cuenta
              </p>
              <p>Nombre: ${nombre}</p>
              <p>Correo: ${email}</p>
            </div>

            <table width="100%">
              <tr>
                <td align="center">
                  <a href="${url}" style="display:inline-block;background:#1a3c5e;color:#fff;padding:16px 40px;border-radius:6px;text-decoration:none;">
                    Confirmar mi cuenta
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin-top:20px;">
              Si no funciona: <a href="${url}">${url}</a>
            </p>
          </td>
        </tr>

        ${baseFooter()}
    `);
    
    const { email, nombre, token } = datos

    //Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en bienesraices.com</p>

            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

            <p>Si yu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //Enviar el email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Reestablece tu Password en BienesRaices.com',
        text: 'Reestablece tu Password en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu password en bienesraices.com</p>

            <p>Sigue el siguiente enlace para generar un password nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Password </a></p>

            <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>
        `
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}