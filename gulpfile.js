// variable section
const { dest, series, src, watch } = require('gulp');
const del = require("del");
const path = require("path");
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const browserSync = require("browser-sync").create();
const browserify = require('browserify');
const glob = require('glob');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const rename = require('gulp-rename');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');

const dist = "dist/";
const sourceFiles = "src/";

const css = { in: sourceFiles + "sass/**/*.scss",
    out: dist + "css/",
    sassOpts: {
        outputStyle: "compressed",
        errLogToConsole: true
    },
    autoprefixerOpts: {
        browsers: ['last 2 versions', '> 2%']
    },
    watch: sourceFiles + "sass/**/*"
};

const html = { 
    in: sourceFiles + "views/**/*.html",
    out: dist + "parsed",
    path: sourceFiles + "views",
    watch: sourceFiles + "views/**/*"
}

const js = { 
  in: sourceFiles + "scripts/**/*.js",
  out: dist + "es5/",
  watch: sourceFiles + "scripts/**/*"
}

const syncOpts = {
  server: {
      baseDir: dist,
      index: "parsed/index.html"
  },
  open: true,
  notify: true
}

// task section
function swallowError (error) {
  // If you want details of the error in the console
  console.error(error.toString());
  this.emit('end');
}

function clean(done) {
  del([dist + "*"]);
  done();
}

function style(done) {
  src(css.in)
      .pipe(sourcemaps.init())
      .pipe(sass(css.sassOpts))
      .on('error', swallowError)
      .pipe(autoprefixer(css.autoprefixerOpts))
      .pipe(sourcemaps.write('.'))
      .pipe(dest(css.out))
      .pipe(browserSync.stream());
  
  done();
}

function htmlminify(done) {
  src(html.in)
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(html.out))
      .pipe(browserSync.stream());
 
  done();
}

function script(done) {
  const files = glob.sync(js.in);
  files.forEach(entry => {
    const name = path.basename(entry);
    return browserify({entries: entry, debug: true})
    .transform(babelify, {
      presets: ["env"],
      extensions: [".js"]
    })
    .bundle()
    .on('error', swallowError)
    .pipe(source(name))
    .pipe(rename({extname: '.min.js'}))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(js.out))
    .pipe(browserSync.stream())
  });

  done();
}

function bSync(done) {
  browserSync.init(syncOpts);
  done();
}

function watchAll(done) {
  watch(css.watch, style);  
  watch(html.watch, htmlminify); 
  watch(js.watch, script);
  done();
}


exports.script = script;
exports.htmlminify = htmlminify;
exports.watchAll = watchAll;
exports.build = series(clean, style, htmlminify, script);
exports.default = series(clean, style, htmlminify, script, watchAll, bSync);
