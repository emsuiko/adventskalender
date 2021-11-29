var gulp = require('gulp');
var browserSync = require('browser-sync').create();

var log = require('fancy-log');
var $ = require('gulp-load-plugins')();
var watcher = require('glob-watcher');

var del = require('del');

var pug = require('gulp-pug-3');

var sass = require('gulp-sass')(require('sass'));
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

// * * * BROWSERIFY
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var babel = require('babelify');
var uglify = require('gulp-uglify-es').default;

function onError(err) {
  log.error(err);
}

var env = require('minimist')(process.argv.slice(2))._[0] || 'development';

var isDevelopment = function() {
  return (env === 'development');
};
var isProduction = function() {
  return !isDevelopment();
};

function templates() {
  return gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
    .pipe($.plumber({ errorHandler: onError }))
    .pipe(pug())
    .pipe($.rename({
      extname: ".html"
    }))
    .pipe(gulp.dest("./dist"))
}

function styles() {
  return gulp.src(['src/sass/*.sass', '!src/sass/**/_*.sass'])
    .pipe(sass().on('error', sass.logError))
    .pipe($.if(isProduction(), $.postcss([
      autoprefixer(),
      cssnano()
    ]), $.postcss([
      autoprefixer(),
    ])))
    // .pipe($.if(isProduction(), $.purgecss({
    //   content: ['dist/**/*.html'],
    //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    // })))
    .pipe(gulp.dest('./dist/css'));
}

function script(destination) {
  return browserify({
      entries: 'src/js/scripts.js',
      debug: isDevelopment()
  })
      .transform(babel.configure({
          presets: ["@babel/env"]
      }))
      .bundle()
      .on('error', err => {
          log.error("Browserify Error: " + err.message);
      })
      .pipe(source('scripts.js'))
      .pipe(buffer())
      .pipe($.if(isProduction(), uglify()))
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.sourcemaps.write('./maps'))
      .pipe(gulp.dest(destination));
}

function imagine(file, destination) {
  return gulp.src(file)
    .pipe(gulp.dest(destination));
}

function imagineFavicon() {
  return gulp.src('src/favicon.ico')
    .pipe(gulp.dest('./dist/'));
}

gulp.task('templates', function() {
  return templates();
});

gulp.task('styles', function() {
  return styles();
});

gulp.task('img', function() {
  return imagine(['src/img/**/*'], './dist/img');
});

gulp.task('audio', function() {
  return gulp.src(['src/audio/**/*'])
    .pipe(gulp.dest('./dist/audio'));
});

gulp.task('js', function() {
  return script('./dist/js');
});

gulp.task('watch', gulp.series(gulp.parallel('templates', 'styles', 'img', 'js', 'audio'), function watch() {
  log('Start watching...');

  var pugwatcher = watcher(['src/pug/**/*.pug', '!src/pug/**/_*.pug'], { interval: 1000, usePolling: true });
  pugwatcher.on('change', function(path, stat) {

    if (path.startsWith('pug')) {
      var dir = path.substr(3, path.lastIndexOf('/') - 3)
    } else {
      var dir = path.substr(0, path.lastIndexOf('/'))
    }

    templates(gulp.src([path])
        .pipe($.plumber({ errorHandler: onError })), './dist/' + dir)
      .on('end', function() {
        log('...re-pugged ' + path);
      });
  });

  var sasswatcher = watcher(['src/sass/**/*.sass'], { interval: 1000, usePolling: true });
  sasswatcher.on('change', function(path, stat) {
    styles()
      .on('end', function() {
        log('...re-sassed');
      });
  });

  var jswatcher = watcher(['src/js/**/*.js'], {interval: 1000, usePolling: true});
    jswatcher.on('change', function(path, stat){
      script('./dist/js')
        .on('end', function() {
            log('...re-scripted');
        });
    });

  var imgwatcher = watcher(['src/img/**/*.*'], { interval: 1000, usePolling: true });
  imgwatcher.on('add', function(path, stat) {
    imagine(path, 'dist/img')
      .on('end', function() {
        log('...public re-imagined');
      });
  });

  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    port: 8080
  });

}));

gulp.task('clean', function() {
  log('Clean destination directories.')
  return del([
    "./dist/**/*.html",
    "./dist/css/**/*",
    "./dist/img/**/*",
    "./dist/js/**/*",
    "./dist/audio/**/*",
    "./dist/favicon.ico",
  ], {
    force: true
  });
});

gulp.task('default', gulp.series('clean', 'watch'), function() {
  log('Start build for ' + env);
});

gulp.task('build', gulp.series('clean', 'templates', 'styles', 'img', 'js', 'audio'), () => {});
