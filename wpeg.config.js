const pkg = require( 'json-file' ).read( './package.json' ).data;

const cfg = {};

// Build Paths.
cfg.src = './src';
cfg.dist_root = './dist';
cfg.dist = '{dist_root}/advanced-backgrounds';

// Template variables that will be automatically replaced.
cfg.template_files_src = '{dist}/**/*.{md,php,js,css,pot}';
cfg.template_files_variables = {
    text_domain: pkg.name,
    plugin_version: pkg.version,
    plugin_name: pkg.name,
    plugin_title: pkg.title,
    plugin_author: pkg.author,
};

// Copy files.
cfg.copy_files_src = [ '{src}/**/*', '!{src}/**/*.{js,scss}', '{src}/**/vendor/**/*.{js,scss}' ];

// Compile SCSS files.
cfg.compile_scss_files_src = [ '{src}/*assets/**/*.scss' ];

// Compile JS files.
cfg.compile_js_files_src = [
    '{src}/*assets/awb/awb.js',
    '{src}/*assets/admin/settings/script.js',
    '{src}/*assets/admin/tinymce/mce-awb-attach-image.js',
    '{src}/*assets/admin/tinymce/mce-awb-attach-video.js',
    '{src}/*assets/admin/tinymce/mce-button.js',
    '{src}/*assets/admin/tinymce/mce-localize.js',
    '{src}/*assets/admin/vc_extend/vc-awb-attach-video.js',
    '{src}/*assets/admin/vc_extend/vc-awb-frontend.js',
    '{src}/*assets/admin/gutenberg/index.js',
];

// Correct line endings files.
cfg.correct_line_endings_files_src = '{dist}/**/*.{js,css}';

// ZIP files.
cfg.zip_files = [
    {
        src: '{dist}/**/*',
        src_opts: {
            base: '{dist_root}',
        },
        dist: '{dist_root}/advanced-backgrounds.zip',
    },
];

// Watch files.
cfg.watch_files = [ '{src}/**/*', '!{src}/**/*.{js,scss}' ];

cfg.watch_js_files = [ '{src}/**/*.js', '{src}/assets/gutenberg/**/*.scss', '!{src}/*vendor/**/*' ];

cfg.watch_scss_files = '{src}/**/*.scss';

module.exports = cfg;
