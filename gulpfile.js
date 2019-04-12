"use strict";

// mostly based on https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

const gulp = require("gulp");
// css
const sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");
// js
const eslint = require("gulp-eslint");
const uglifyjs = require('gulp-uglify');
const babel = require('gulp-babel');
// html
const uglifyhtml = require('html-minifier').minify;
// live server
const browsersync = require("browser-sync").create();
// mario
const plumber = require("gulp-plumber");
// other
const cp = require("child_process");
// installed but unused:
const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");


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
function css() {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    //.pipe(gulp.dest("./dist/css/main.css"))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest("./dist/css/"))
    .pipe(browsersync.stream());
}

// Lint scripts
function scriptsLint() {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
    //.pipe(eslint.failAfterError());
}

// minify scripts
function scripts() {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber())
    // .pipe(babel({
    //         presets: ['@babel/env'], plugins: ['@babel/transform-runtime']
    //     }))
    .pipe(webpackstream(webpackconfig, webpack))
    // .pipe(uglifyjs())
    .pipe(gulp.dest("./dist/js/"))
    .pipe(browsersync.stream());
}

// HTML
function html() {
  return gulp
    .src("./src/*.html")
    .pipe(plumber())
    //.pipe(uglifyhtml())
    .pipe(gulp.dest("./dist/"))
    .pipe(browsersync.stream());
}

// watch files
function watchFiles() {
  gulp.watch("./src/scss/main.scss", css);
  gulp.watch("./src/js/*.js", gulp.series(scriptsLint, scripts));
  gulp.watch("./src/*.html", html); // <<< HTML
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
const js = gulp.series(scriptsLint, scripts);
const build = gulp.parallel(css, js); // <<< HTML
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.css = css;
exports.js = js;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = build;
