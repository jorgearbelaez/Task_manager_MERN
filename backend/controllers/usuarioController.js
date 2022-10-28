import Usuario from "../modelos/Usuario.js";
import generarId from "../helpers/generar-id.js";
import generarJWT from "../helpers/generarJWT.js";

const registrar = async (req, res) => {
  const { email } = req.body;

  const existeUsuario = await Usuario.findOne({ email });

  //prevenir usuarios duplicados
  if (existeUsuario) {
    const error = new Error(`El correo ${email} ya esta registrado`);

    return res.status(400).json({
      msg: error.message,
    });
  }

  try {
    const usuario = new Usuario(req.body);

    usuario.token = generarId();

    const usuarioAlmacenado = await usuario.save();

    res.json(usuarioAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  //usuario?
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");

    return res.status(404).json({
      msg: error.message,
    });
  }

  //usuario confirmado?
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");

    return res.status(403).json({
      msg: error.message,
    });
  }

  //password valido?

  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(403).json({
      msg: error.message,
    });
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  const usuarioConfirmar = await Usuario.findOne({ token });

  //si el usuario no existe

  if (!usuarioConfirmar) {
    const error = new Error("Token no valido");
    return res.status(403).json({
      msg: error.message,
    });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";

    await usuarioConfirmar.save();

    res.json({
      msg: "Usuario Confirmado Correctamente",
    });

    console.log(usuarioConfirmar);
  } catch (error) {
    console.log(error);
  }
};

export { registrar, autenticar, confirmar };
