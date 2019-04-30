"use strict";

const gulp = require("gulp");
// css
const sass = require("gulp-sass");
sass.compiler = require('node-sass');
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
// js
const eslint = require("gulp-eslint");
// live server
const browsersync = require("browser-sync").create();
// mario
const plumber = require("gulp-plumber");
// installed but unused:
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");


// let production = true;



// BrowserSync
function browserSync(done) {
  browsersync.init(
    {
      server: {
        baseDir: "./dist/"
      },
      port: 3000
    }
  );
  done();
}
// browserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}




// CSS tasks
function css(production) {
  let outputStyle = production ? "compressed" : "nested";
  let postCssplugins = [autoprefixer({
    "browsers": [
      "IE 9"
]})];
  if (production) postCssplugins.push(cssnano());
  return gulp
    .src("./src/scss/main.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: outputStyle}))
    .pipe(postcss(postCssplugins))
    .pipe(gulp.dest("./dist/css/"))
    .pipe(browsersync.stream());
}
let cssP = css.bind(null, true);
let cssD = css.bind(null, false);

// Lint scripts
function scriptsLint() {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber())
    .pipe(eslint({
      "parserOptions": {
          "sourceType": "module"
      }
  }))
    .pipe(eslint.format());
}

// minify scripts
function scripts(production) {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber())
    .pipe(webpackstream(webpackconfig(production ? 'production' : 'development'), webpack))
    .pipe(gulp.dest("./dist"))
    .pipe(browsersync.stream());
}
let scriptsP = scripts.bind(null, true);
let scriptsD = scripts.bind(null, false);

// HTML
function html() {
  return gulp
    .src("./src/*.html")
    .pipe(plumber())
    .pipe(gulp.dest("./dist/"))
    .pipe(browsersync.stream());
}

// watch files
function watchFiles() {
  gulp.watch("./src/scss/*.scss", cssD);
  gulp.watch("./src/js/*.js", gulp.series(scriptsLint, scriptsD));
  gulp.watch("./src/*.html", html);
  gulp.watch(
    [
      "./_includes/**/*",
      "./_layouts/**/*",
      "./_pages/**/*",
      "./_posts/**/*",
      "./_projects/**/*"
    ],
    gulp.series(browserSyncReload)
);
}

// complex tasks
const jsP = gulp.series(scriptsLint, scriptsP);
const jsD = gulp.series(scriptsLint, scriptsD);
const buildP = gulp.parallel(cssP, jsP, html);
const buildD = gulp.parallel(cssD, jsD, html);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.css = cssD;
exports.js = jsD;
exports.html = html;
exports.buildP = buildP;
exports.buildD = buildD;
exports.watch = watch;
exports.default = buildP;
