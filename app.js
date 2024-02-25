const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 8088;

// Configuración de la sesión
app.use(session({
    secret: 'secreto', // Cambia 'secreto' por una cadena aleatoria más segura
    resave: false,
    saveUninitialized: true
 })); 

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexión a la base de datos MySQL
const connection = mysql.createConnection({
   host: 'localhost',
   user: 'root', // Usuario de MySQL en XAMPP (normalmente es 'root')
   password: '', // Contraseña de MySQL en XAMPP (normalmente está vacía por defecto)
   database: 'proyecto' // El nombre de la base de datos que creaste en XAMPP
});

// Estilos CSS
const styles = `
    <style>
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0; /* Color gris claro */
        }
        form {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        /* styles.css */
.tienda-container {
    background-color: #f0f0f0; /* Color gris claro */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Estilos CSS */
.corner {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px;
}


    </style>
`;


// Ruta para la página principal con formulario de registro
app.get('/', (req, res) => {
    const registrationForm = `
        ${styles}
        <div class="container">
            <form action="/" method="POST">
                <h1>Registro de Usuario</h1>
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" required><br><br>
                <!-- Mantener los campos de correo y contraseña -->
                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required><br><br>
                <label for="contraseña">Contraseña:</label>
                <input type="password" id="contraseña" name="contraseña" required><br><br>
                <input type="submit" value="Registrarse">
                <p>¿Ya tienes una cuenta? <a href="/iniciar-sesion">Inicia sesión aquí</a></p>
            </form>
        </div>
    `;
    res.send(registrationForm);
});

// Proceso de registro y redirección a la página de inicio de sesión
app.post('/', (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    const insertQuery = 'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
    connection.query(insertQuery, [nombre, correo, contraseña], (err, results) => {
       if (err) {
          console.error('Error al registrar el usuario:', err);
          res.status(500).send('Error interno del servidor');
       } else {
          console.log('Usuario registrado con éxito:', results.insertId);
          res.redirect('/iniciar-sesion');
       }
    });
 });

// Ruta para la página de inicio de sesión
app.get('/iniciar-sesion', (req, res) => {
    const loginForm = `
        ${styles}
        <div class="container">
            <form action="/login" method="POST">
                <h1>Iniciar Sesión</h1>
                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required><br><br>
                <label for="contraseña">Contraseña:</label>
                <input type="password" id="contraseña" name="contraseña" required><br><br>
                <input type="checkbox" id="guardarCredenciales" name="guardarCredenciales">
                <label for="guardarCredenciales">Guardar credenciales</label><br><br>
                <input type="submit" value="Iniciar Sesión">
            </form>
        </div>
    `;
    res.send(loginForm);
});

// Proceso de inicio de sesión
app.post('/login', (req, res) => {
    const { correo, contraseña, guardarCredenciales } = req.body;
    const query = 'SELECT nombre FROM usuarios WHERE correo = ? AND contraseña = ?';
    connection.query(query, [correo, contraseña], (err, results) => {
       if (err) {
          console.error('Error al buscar usuario:', err);
          res.status(500).send('Error interno del servidor');
       } else {
          if (results.length > 0) {
             req.session.usuario = results[0].nombre;

             if (guardarCredenciales) {
                 req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 semana en milisegundos
             }

             res.redirect('/tienda-online-hosting');
          } else {
             res.send('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
          }
       }
    });
 });
 

// Ruta para la página de tienda online después de que el usuario se registre
app.get('/tienda-online-hosting', (req, res) => {
    // Verificar si el usuario está autenticado
    if (req.session && req.session.usuario) {
       const nombreUsuario = req.session.usuario;
       const tiendaOnlineHTML = `
       ${styles}
                <style>
                    .corner {
                        float: right;
                        text-align: right;
                        margin-left: 20px;
                    }

                    .opciones a {
                        font-size: 20px; /* Tamaño de letra para los enlaces "Método de Pago", "Carrito" y "Cerrar Sesión" */
                    }

                    .cuadrados-container a {
                        display: inline-block;
                        text-align: center;
                        text-decoration: none;
                        font-size: 24px; /* Tamaño de letra para "Hosting Minecraft", "GTA5", "CS2" y "Arma3" */
                        margin-right: 20px; /* Espacio entre cada elemento */
                    }
                </style>
                <div class="tienda-container">
                    <div class="corner">
                        ${nombreUsuario}
                    </div>
                    <h1 style="display: inline;">Bienvenido a la Tienda Online Hosting</h1>
                    <div style="clear: both;"></div>
                    <div class="opciones">
                        <a href="/metodo-pago">Método de Pago</a>
                        <a href="/carrito">Carrito</a>
                        <a href="/cerrar-sesion">Cerrar Sesión</a>
                    </div>
                    <div class="cuadrados-container">
                        <form action="/configurar-servidor-minecraft" method="GET">
                            <a href="/configurar-servidor-minecraft">
                                <img src="https://clipart.info/images/ccovers/1559756859minecraft-1-logo-png-transparent.png" alt="Hosting Minecraft" width="100" height="100">
                                Hosting Minecraft
                            </a>
                        </form>
                        <form action="/configurar-servidor-gta5" method="GET">
                            <a href="/configurar-servidor-gta5">
                                <img src="https://th.bing.com/th/id/OIP.3Xc-q7Pa_aBsesONk8ligQHaGg?rs=1&pid=ImgDetMain" alt="Hosting GTA5" width="100" height="100">
                                Hosting GTA5
                            </a>
                        </form>
                        <form action="/configurar-servidor-cs2" method="GET">
                            <a href="/configurar-servidor-cs2">
                                <img src="https://th.bing.com/th/id/OIP.XmjeiPeMYazm8p4iKJxPXwHaHa?rs=1&pid=ImgDetMain" alt="Hosting CS2" width="100" height="100">
                                Hosting CS2
                            </a>
                        </form>
                        <form action="/configurar-servidor-arma3" method="GET">
                            <a href="/configurar-servidor-arma3">
                                <img src="https://pngimg.com/uploads/arma/arma_PNG56.png" alt="Hosting Arma 3" width="100" height="100">
                                Hosting Arma 3
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        `;
        res.send(tiendaOnlineHTML);
    } else {
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
});








// Ruta para agregar elementos al carrito
app.post('/agregar-al-carrito', (req, res) => {
    const item = req.body.item;
    // Aquí puedes agregar la lógica para agregar el elemento al carrito
    res.send(`${item} agregado al carrito`);
});





// Ruta para la página de formulario de método de pago
app.get('/metodo-pago', (req, res) => {
    const formularioMetodoPagoHTML = `
       <h1>Formulario de Método de Pago</h1>
       <form action="/guardar-metodo-pago" method="POST">
          <label for="numeroTarjeta">Número de Tarjeta:</label>
          <input type="text" id="numeroTarjeta" name="numeroTarjeta" required><br><br>
          <label for="nombreCompleto">Nombre Completo:</label>
          <input type="text" id="nombreCompleto" name="nombreCompleto" required><br><br>
          <label for="fechaCaducidad">Fecha de Caducidad:</label>
          <input type="text" id="fechaCaducidad" name="fechaCaducidad" required><br><br>
          <label for="numeroSecreto">Número Secreto:</label>
          <input type="password" id="numeroSecreto" name="numeroSecreto" required><br><br>
          <input type="submit" value="Guardar">
       </form>
    `;
    res.send(formularioMetodoPagoHTML);
 });
 
 // Ruta para guardar la información del método de pago en la base de datos
 app.post('/guardar-metodo-pago', (req, res) => {
    const { numeroTarjeta, nombreCompleto, fechaCaducidad, numeroSecreto } = req.body;
    const nombreUsuario = req.session.usuario; // Obtener el nombre de usuario de la sesión
 
    // Realizar una consulta SQL para insertar los datos en la tabla "datos"
    const insertQuery = 'INSERT INTO datos (nombre_usuario, numero_tarjeta, nombre_completo, fecha_caducidad, numero_secreto) VALUES (?, ?, ?, ?, ?)';
    connection.query(insertQuery, [nombreUsuario, numeroTarjeta, nombreCompleto, fechaCaducidad, numeroSecreto], (err, results) => {
       if (err) {
          console.error('Error al guardar la información del método de pago:', err);
          res.status(500).send('Error interno del servidor');
       } else {
          console.log('Información del método de pago guardada correctamente');
          // Redirigir al usuario a la página de tienda online o a cualquier otra página deseada
          res.redirect('/tienda-online-hosting');
       }
    });
 });


// Ruta para la página de configuración del servidor de Minecraft
app.get('/configurar-servidor-minecraft', (req, res) => {
    const configuradorHTML = `
        ${styles}
        <div class="container">
            <h1>Configurador de Servidor de Minecraft</h1>
            <form action="/confirmar-configuracion" method="POST">
            <input type="hidden" name="juego" value="Minecraft"> <!-- Campo oculto para indicar el juego -->
                <label for="ram">RAM:</label>
                <select id="ram" name="ram">
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                </select><br><br>
                <label for="cpu">CPU:</label>
                <select id="cpu" name="cpu">
                    <option value="CPU Standar">CPU Standar</option>
                    <option value="CPU Gama Alta">CPU Gama Alta</option>
                    <option value="CPU Gama Superior">CPU Gama Superior</option>
                </select><br><br>
                <label for="almacenamiento">Almacenamiento:</label>
                <select id="almacenamiento" name="almacenamiento">
                    <option value="10GB">10GB</option>
                    <option value="30GB">30GB</option>
                    <option value="60GB">60GB</option>
                    <option value="100GB">100GB</option>
                </select><br><br>
                <label for="ancho_banda">Ancho de Banda:</label>
                <select id="ancho_banda" name="ancho_banda">
                    <option value="100mbps">100mbps</option>
                    <option value="200mbps">200mbps</option>
                    <option value="300mbps">300mbps</option>
                    <option value="1000mbps">1000mbps</option>
                </select><br><br>
                <input type="submit" value="Confirmar Configuración">
            </form>
        </div>
    `;
    res.send(configuradorHTML);
});


// Ruta para la página de configuración del servidor de GTA5
app.get('/configurar-servidor-gta5', (req, res) => {
    const configuradorHTML = `
        ${styles}
        <div class="container">
            <h1>Configurador de Servidor de GTA5</h1>
            <form action="/confirmar-configuracion" method="POST">
            <form action="/confirmar-configuracion" method="POST">
            <input type="hidden" name="juego" value="GTA5">

                <label for="ram">RAM:</label>
                <select id="ram" name="ram">
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                </select><br><br>
                <label for="cpu">CPU:</label>
                <select id="cpu" name="cpu">
                    <option value="CPU Standar">CPU Standar</option>
                    <option value="CPU Gama Alta">CPU Gama Alta</option>
                    <option value="CPU Gama Superior">CPU Gama Superior</option>
                </select><br><br>
                <label for="almacenamiento">Almacenamiento:</label>
                <select id="almacenamiento" name="almacenamiento">
                    <option value="10GB">10GB</option>
                    <option value="30GB">30GB</option>
                    <option value="60GB">60GB</option>
                    <option value="100GB">100GB</option>
                </select><br><br>
                <label for="ancho_banda">Ancho de Banda:</label>
                <select id="ancho_banda" name="ancho_banda">
                    <option value="100mbps">100mbps</option>
                    <option value="200mbps">200mbps</option>
                    <option value="300mbps">300mbps</option>
                    <option value="1000mbps">1000mbps</option>
                </select><br><br>
                <input type="submit" value="Confirmar Configuración">
            </form>
        </div>
    `;
    res.send(configuradorHTML);
});


// Ruta para la página de configuración del servidor de CS2
app.get('/configurar-servidor-cs2', (req, res) => {
    const configuradorCS2HTML = `
        ${styles}
        <div class="container">
            <h1>Configurador de Servidor de CS2</h1>
            <form action="/confirmar-configuracion" method="POST">
            <input type="hidden" name="juego" value="CS2">
                <label for="ram">RAM:</label>
                <select id="ram" name="ram">
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                </select><br><br>
                <label for="cpu">CPU:</label>
                <select id="cpu" name="cpu">
                    <option value="CPU Standar">CPU Standar</option>
                    <option value="CPU Gama Alta">CPU Gama Alta</option>
                    <option value="CPU Gama Superior">CPU Gama Superior</option>
                </select><br><br>
                <label for="almacenamiento">Almacenamiento:</label>
                <select id="almacenamiento" name="almacenamiento">
                    <option value="10GB">10GB</option>
                    <option value="30GB">30GB</option>
                    <option value="60GB">60GB</option>
                    <option value="100GB">100GB</option>
                </select><br><br>
                <label for="ancho_banda">Ancho de Banda:</label>
                <select id="ancho_banda" name="ancho_banda">
                    <option value="100mbps">100mbps</option>
                    <option value="200mbps">200mbps</option>
                    <option value="300mbps">300mbps</option>
                    <option value="1000mbps">1000mbps</option>
                </select><br><br>
                <input type="submit" value="Confirmar Configuración">
            </form>
        </div>
    `;
    res.send(configuradorCS2HTML);
});


// Ruta para la página de configuración del servidor de Arma3
app.get('/configurar-servidor-arma3', (req, res) => {
    const configuradorArma3HTML = `
        ${styles}
        <div class="container">
            <h1>Configurador de Servidor de Arma3</h1>
            <form action="/confirmar-configuracion" method="POST">
            <input type="hidden" name="juego" value="Arma3">
                <label for="ram">RAM:</label>
                <select id="ram" name="ram">
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                </select><br><br>
                <label for="cpu">CPU:</label>
                <select id="cpu" name="cpu">
                    <option value="CPU Standar">CPU Standar</option>
                    <option value="CPU Gama Alta">CPU Gama Alta</option>
                    <option value="CPU Gama Superior">CPU Gama Superior</option>
                </select><br><br>
                <label for="almacenamiento">Almacenamiento:</label>
                <select id="almacenamiento" name="almacenamiento">
                    <option value="10GB">10GB</option>
                    <option value="30GB">30GB</option>
                    <option value="60GB">60GB</option>
                    <option value="100GB">100GB</option>
                </select><br><br>
                <label for="ancho_banda">Ancho de Banda:</label>
                <select id="ancho_banda" name="ancho_banda">
                    <option value="100mbps">100mbps</option>
                    <option value="200mbps">200mbps</option>
                    <option value="300mbps">300mbps</option>
                    <option value="1000mbps">1000mbps</option>
                </select><br><br>
                <input type="submit" value="Confirmar Configuración">
            </form>
        </div>
    `;
    res.send(configuradorArma3HTML);
});



// Ruta para confirmar la configuración del servidor
app.post('/confirmar-configuracion', (req, res) => {
    const { ram, cpu, almacenamiento, ancho_banda, juego } = req.body; // Obtén el nombre del juego del formulario
    const nombreUsuario = req.session.usuario; // Obtener el nombre de usuario de la sesión

    // Insertar la configuración en la base de datos, incluyendo el nombre del juego
    const insertQuery = 'INSERT INTO configuracion (nombre_usuario, juego, ram, cpu, almacenamiento, ancho_banda) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(insertQuery, [nombreUsuario, juego, ram, cpu, almacenamiento, ancho_banda], (err, results) => {
        if (err) {
            console.error('Error al guardar la configuración:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            console.log('Configuración guardada con éxito:', results.insertId);
            // Redirigir al usuario a la página de tienda-online-hosting
            res.redirect('/tienda-online-hosting');
        }
    });
});

// Ruta para agregar la configuración al carrito
app.post('/agregar-al-carrito', (req, res) => {
    const { juego, ram, cpu, almacenamiento, anchoBanda } = req.body;
    const nombreUsuario = req.session.usuario; // Obtener el nombre de usuario de la sesión

    // Insertar la configuración en la lista del carrito
    const insertQuery = 'INSERT INTO carrito (nombre_usuario, juego, ram, cpu, almacenamiento, ancho_banda) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(insertQuery, [nombreUsuario, juego, ram, cpu, almacenamiento, anchoBanda], (err, results) => {
        if (err) {
            console.error('Error al agregar la configuración al carrito:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            console.log('Configuración agregada al carrito con éxito:', results.insertId);
            // Redirigir al usuario a la página de tienda-online-hosting
            res.redirect('/tienda-online-hosting');
        }
    });
});


// Ruta para agregar elementos al carrito
app.post('/agregar-al-carrito', (req, res) => {
    const { item, ram, cpu, almacenamiento, anchoBanda } = req.body;
    // Aquí puedes agregar la lógica para almacenar la información en la base de datos
    // Por ejemplo, puedes insertar esta información en una tabla de "carrito"
    // Luego, redirige al usuario a la página de tienda online
    res.redirect('/tienda-online-hosting');
});


// Ruta para la página del carrito
app.get('/carrito', (req, res) => {
    // Verificar si el usuario está autenticado
    if (req.session && req.session.usuario) {
        const nombreUsuario = req.session.usuario;

        // Consultar las configuraciones en el carrito del usuario
        const selectQuery = 'SELECT * FROM configuracion WHERE nombre_usuario = ?';
        connection.query(selectQuery, [nombreUsuario], (err, results) => {
            if (err) {
                console.error('Error al obtener las configuraciones del carrito:', err);
                res.status(500).send('Error interno del servidor');
            } else {
                // Generar HTML para mostrar las configuraciones en una lista
                let carritoHTML = `
                    <h1>Carrito de Compras</h1>
                    <ul>
                `;
                results.forEach((configuracion, index) => {
                    carritoHTML += `
                        <li>
                            Configuración ${index + 1}:
                            <ul>
                                <li>Nombre del juego: ${configuracion.juego}</li>
                                <li>RAM: ${configuracion.ram}</li>
                                <li>CPU: ${configuracion.cpu}</li>
                                <li>Almacenamiento: ${configuracion.almacenamiento}</li>
                                <li>Ancho de Banda: ${configuracion.ancho_banda}</li>
                            </ul>
                            <!-- Botón para borrar la configuración -->
                            <form action="/carrito/${configuracion.id}" method="POST">
                                <button type="submit" name="borrar">Borrar</button>
                            </form>
                        </li>
                    `;
                });
                carritoHTML += `</ul>`;

                // Agregar el botón "Pagar"
                carritoHTML += `
                    <form action="/compra" method="GET">
                        <button type="submit">Pagar</button>
                    </form>
                `;
                
                res.send(carritoHTML);
            }
        });
    } else {
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
});


// Ruta para manejar la eliminación de configuraciones del carrito
app.post('/carrito/:id', (req, res) => {
    const configuracionId = req.params.id;
    // Realizar la consulta para eliminar la configuración del carrito con el ID especificado
    const deleteQuery = 'DELETE FROM configuracion WHERE id = ?';
    connection.query(deleteQuery, [configuracionId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la configuración del carrito:', err);
            res.status(500).send('Error interno del servidor');
        } else {
            console.log('Configuración eliminada correctamente del carrito');
            // Redirigir de vuelta a la página del carrito
            res.redirect('/carrito');
        }
    });
});


// Ruta para la página de compra
app.get('/compra', (req, res) => {
    // Verificar si el usuario está autenticado
    if (req.session && req.session.usuario) {
        const nombreUsuario = req.session.usuario;

        // Consultar los datos bancarios del usuario desde la tabla "datos"
        const selectQuery = 'SELECT nombre_completo, numero_tarjeta, fecha_caducidad FROM datos WHERE nombre_usuario = ?';
        connection.query(selectQuery, [nombreUsuario], (err, results) => {
            if (err) {
                console.error('Error al obtener los datos bancarios del usuario:', err);
                res.status(500).send('Ocurrió un error al procesar la solicitud.');
            } else {
                if (results.length > 0) {
                    const datos = results[0];
                    const mensajeCompra = `Su compra ha sido realizada con éxito a la dirección de ${datos.nombre_completo} con el num: ${datos.numero_tarjeta} y con caducidad el ${datos.fecha_caducidad}. Gracias por su compra.<br><br><a href="/tienda-online-hosting">Volver a la tienda</a>`;
                    res.send(mensajeCompra);
                } else {
                    res.send('No se encontraron datos bancarios para este usuario.');
                }
            }
        });
    } else {
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
});






// Ruta para cerrar la sesión del usuario
app.get('/cerrar-sesion', (req, res) => {
   // Aquí puedes realizar la lógica para cerrar la sesión del usuario
   // Por ejemplo, limpiar la sesión y redirigir al usuario a la página de inicio de sesión
   res.redirect('/');
});


// Iniciar el servidor
app.listen(port, () => {
   console.log(`Servidor escuchando en http://localhost:${port}`);
});
