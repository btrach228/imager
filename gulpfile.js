// primary dirr

let projectFolder = require("path").basename(__dirname);
let sourceFolder = "#src";

let fs = require("fs");

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/style/",
    js: projectFolder + "/script/",
    media: projectFolder + "/media/",
    fonts: projectFolder + "/fonts/",
  },
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/style/style.scss",
    js: sourceFolder + "/script/script.js",
    media: sourceFolder + "/media/**/*.{png,jpg,png,ico,gif,svg}",
    fonts: sourceFolder + "/fonts/**/*.ttf",
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/style/**/*.scss",
    js: sourceFolder + "/script/script**/*.js",
    media: sourceFolder + "/media/**/*.{png,jpg,png,ico,gif,svg}",
  },
  clean: "./" + projectFolder + "/",
};

//plugins

let { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  gulpAutoprefixer = require("gulp-autoprefixer"),
  mediaQueries = require("gulp-group-css-media-queries"),
  cleanCss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  gulpUglify = require("gulp-uglify-es").default,
  imageMin = require("gulp-imagemin"),
  webP = require("gulp-webp"),
  webP_html = require("gulp-webp-html"),
  webP_css = require("gulp-webpcss"),
  svgSprite = require("gulp-svg-sprite"),
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2"),
  gulpFonter = require("gulp-fonter");

//functions

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webP_html())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function liveServer(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.media], media);
}

function clean(params) {
  return del(path.clean);
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded",
      })
    )
    .pipe(mediaQueries())

    .pipe(
      gulpAutoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(webP_css())
    .pipe(dest(path.build.css))
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(cleanCss())
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(gulpUglify())
    .pipe(dest(path.build.js))
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function media() {
  return src(path.src.media)
    .pipe(
      webP({
        quality: 70,
      })
    )
    .pipe(dest(path.build.media))
    .pipe(src(path.src.media))

    .pipe(
      imageMin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3, // 0 - 7
      })
    )
    .pipe(dest(path.build.media))
    .pipe(browsersync.stream());
}

function fonts() {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));

  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function fontStyle(params) {
  let file_content = fs.readFileSync(sourceFolder + "/style/fonts.scss");
  if (file_content == "") {
    fs.writeFile(sourceFolder + "/style/fonts.scss", "", cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split(".");
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(
              sourceFolder + "/style/fonts.scss",
              '@include font("' +
                fontname +
                '", "' +
                fontname +
                '", "400", "normal");\r\n',
              cb
            );
          }
          c_fontname = fontname;
        }
      }
    });
  }
}

function cb() {}

gulp.task("svgSprite", function () {
  return gulp
    .src([sourceFolder + "/iconssprite/*.svg"])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest(path.build.media));
});
gulp.task("otfTottf", function () {
  return src([sourceFolder + "/fonts/*.otf"])
    .pipe(
      gulpFonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest(sourceFolder + "/fonts/")); //fix because new  fontF create in root of dir but not in fonts folder
});

//work flow gulp

let build = gulp.series(
  clean,
  gulp.parallel(css, html, media, js, fonts),
  fontStyle
);

// gulp watch

let watch = gulp.parallel(build, liveServer, browserSync);

//gulp connections

exports.fontStyle = fontStyle;
exports.fonts = fonts;
exports.media = media;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;

// Done , gulp ready
