import nodemailer from 'nodemailer';

// 🔹 Plantilla base reutilizable
const generarTemplate = ({ titulo, mensaje, botonTexto, botonLink }) => {
    return `
    <div style="background:#f2f3f5; padding:40px 0; font-family: Helvetica, Arial, sans-serif;">
      
      <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background:#111827; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">
              Bienes Raíces - 🏡 - 240836
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px;">
            
            <h2 style="color:#111827; margin-top:0;">${titulo}</h2>

            <p style="color:#374151; font-size:15px; line-height:1.6;">
              ${mensaje}
            </p>

            <!-- Botón -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${botonLink}" 
                 style="background:#00A650; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-weight:bold; display:inline-block;">
                 ${botonTexto}
              </a>
            </div>

            <!-- Fallback -->
            <p style="font-size:13px; color:#6b7280;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </p>

            <p style="word-break:break-all; font-size:12px; color:#2563eb;">
              ${botonLink}
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb; padding:20px; text-align:center;">
            <p style="font-size:12px; color:#9ca3af; margin:0;">
              Este correo fue enviado por Bienes Raíces - 240836.
            </p>
            <p style="font-size:12px; color:#9ca3af; margin:5px 0 0;">
              Si no solicitaste esta acción, puedes ignorar este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </div>
    `;
};


// 🔐 Confirmar cuenta
const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { nombre, email, token } = datos;

    const link = `${process.env.BASE_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}`;

    const html = generarTemplate({
        titulo: `Confirma tu cuenta`,
        mensaje: `Hola <strong>${nombre}</strong>, gracias por registrarte en Bienes Raíces. Para comenzar, confirma tu cuenta haciendo clic en el botón.`,
        botonTexto: 'Confirmar Cuenta',
        botonLink: link
    });

    await transport.sendMail({
        from: 'Bienes Raices - 240836',
        to: email,
        subject: 'Confirma tu cuenta en Bienes Raices',
        text: 'Confirma tu cuenta en Bienes Raices',
        html: `
          <p>Hola ${nombre}, has solicitado reestablecer tu contaseña en bienesraices.com</p>

          <p>Sigue el siguiente enlace para quenerar tu nueva contraseña:
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a></p>

          <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje</p>
        `
    });
};


// 🔑 Recuperar contraseña
const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const { nombre, email, token } = datos;

    const link = `${process.env.BASE_URL}:${process.env.PORT ?? 3000}/auth/recuperacion-password/${token}`;

    const html = generarTemplate({
        titulo: `Restablecer contraseña`,
        mensaje: `Hola <strong>${nombre}</strong>, recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar.`,
        botonTexto: 'Restablecer Contraseña',
        botonLink: link
    });

    await transport.sendMail({
        from: 'Bienes Raices - 240836',
        to: email,
        subject: 'Reestablece tu contraseña en Bienes Raices',
        text: 'Reestablece tu contraseña en Bienes Raices',
        html
    });
};

export {
    emailRegistro,
    emailOlvidePassword
};