const path = require('path');
const fs = require('fs');

// source template name
const src = 'pintura.html';

// need to have a reference to the root of the project so we can find npm modules
const projectRoot = process.env.INIT_CWD;

// read pintura js and css files
const pathPinturaJS = path.join(
    projectRoot,
    'node_modules',
    '@pqina',
    'pintura',
    'pintura-iife.js'
);
const contentsPinturaJS = fs.readFileSync(pathPinturaJS, { encoding: 'utf8' });

const pathPinturaCSS = path.join(projectRoot, 'node_modules', '@pqina', 'pintura', 'pintura.css');
const contentsPinturaCSS = fs.readFileSync(pathPinturaCSS, { encoding: 'utf8' });

// read pintura video js and css files
const pathPinturaVideoJS = path.join(
    projectRoot,
    'node_modules',
    '@pqina',
    'pintura-video',
    'pinturavideo-iife.js'
);
const contentsPinturaVideoJS = fs.existsSync(pathPinturaVideoJS)
    ? fs.readFileSync(pathPinturaVideoJS, { encoding: 'utf8' })
    : undefined;

const pathPinturaVideoCSS = path.join(
    projectRoot,
    'node_modules',
    '@pqina',
    'pintura-video',
    'pinturavideo.css'
);
const contentsPinturaVideoCSS = fs.existsSync(pathPinturaVideoCSS)
    ? fs.readFileSync(pathPinturaVideoCSS, { encoding: 'utf8' })
    : undefined;

// read component file
const dest = path.join('bin', src);

if (!fs.existsSync('bin')) fs.mkdirSync('bin');

// modify template
let data = fs.readFileSync(src, { encoding: 'utf8' });

// inject scripts and styles
data = data.replace('/*__PINTURA_CSS__*/', () => contentsPinturaCSS);
data = data.replace('/*__PINTURA_JS__*/', () => contentsPinturaJS);

// if pintura video extension installed
if (contentsPinturaVideoJS) {
    // inject scripts and styles
    data = data.replace('/*__PINTURA_VIDEO_CSS__*/', () => contentsPinturaVideoCSS);
    data = data.replace('/*__PINTURA_VIDEO_JS__*/', () => contentsPinturaVideoJS);

    // insert
    data = data
        .replace(
            '/*__PINTURA_VIDEO_INIT__*/',
            () => `
const {
    createDefaultVideoWriter,
    createMediaStreamEncoder,
    plugin_trim,
    plugin_trim_locale_en_gb,
} = pinturavideo;

setPlugins(plugin_trim);
`
        )
        .replace(
            '/*__PINTURA_VIDEO_OPTIONS__*/',
            () => `
locale: {
    ...plugin_trim_locale_en_gb,
},

imageWriter: createDefaultMediaWriter(
    [
        // For handling images
        createDefaultImageWriter(),

        // For handling videos
        createDefaultVideoWriter({
            // Encoder to use
            encoder: createMediaStreamEncoder({
                imageStateToCanvas,
            }),
        }),
    ]
),
`
        )
        .replace(
            '/*__PINTURA_VIDEO_WRITER__*/',
            () => `
if (msg.editorOptions.imageWriter || msg.editorOptions.videoWriter) {
    msg.editorOptions.imageWriter = createDefaultMediaWriter(msg.editorOptions.imageWriter || {}, [
        createDefaultImageWriter(),
        createDefaultVideoWriter({
            ...(msg.editorOptions.videoWriter || {}),
            encoder: createMediaStreamEncoder({
                imageStateToCanvas,
            }),
        }),
    ]);
}
`
        );
}

// write file in bin
fs.writeFileSync(dest, data, { encoding: 'utf8' });
