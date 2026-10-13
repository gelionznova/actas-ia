# Interfaz web de Actas IA

Interfaz desarrollada con React y [Create React App](https://github.com/facebook/create-react-app) para administrar usuarios, reuniones y actas.

Para instalar y ejecutar el proyecto completo, consulta el [README principal](../README.md).

## Instalación

Desde la carpeta `gps_react`, ejecuta:

```bash
npm install
```

## Comandos disponibles

Ejecuta estos comandos desde la carpeta `gps_react`.

### `npm start`

Inicia la aplicación en modo de desarrollo. Abre [http://localhost:3000](http://localhost:3000) en el navegador.

La página se recarga cuando guardas cambios. Los errores de compilación y las advertencias de análisis del código aparecen en la consola.

La API de Django debe estar en ejecución. Su dirección se configura mediante `BASE_API` en `src/utils/constants.js`.

### `npm test`

Inicia el ejecutor de pruebas en modo interactivo y vuelve a ejecutar las pruebas al detectar cambios.

Consulta la [documentación sobre pruebas](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`

Genera una versión optimizada para producción en la carpeta `build`. Los archivos se minifican y sus nombres incluyen identificadores calculados a partir de su contenido.

Consulta la [documentación sobre despliegue](https://facebook.github.io/create-react-app/docs/deployment).

### `npm run eject`

**Esta operación es irreversible dentro de Create React App.**

Expone los archivos de configuración y las dependencias de herramientas como webpack, Babel y ESLint para que puedas modificarlos directamente. Después de ejecutarla, debes mantener esa configuración por tu cuenta.

No es necesario ejecutar este comando para desarrollar o compilar la aplicación.

## Más información

- [Documentación de Create React App](https://facebook.github.io/create-react-app/docs/getting-started).
- [Documentación de React](https://react.dev/).
- [División del código en paquetes](https://facebook.github.io/create-react-app/docs/code-splitting).
- [Análisis del tamaño de la compilación](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size).
- [Aplicaciones web progresivas](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app).
- [Configuración avanzada](https://facebook.github.io/create-react-app/docs/advanced-configuration).
- [Solución de problemas al minificar](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify).
