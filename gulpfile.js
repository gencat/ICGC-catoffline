var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var useref = require('gulp-useref');
var uglify = require("gulp-uglify");
var clean = require('gulp-clean');

var paths = {
  sass: ['./scss/**/*.scss'],
  templatecache: ['./www/templates/**/*.html'],
  ng_annotate: ['./www/js/**/*.js'],
  useref: ['./www/*.html']
};

gulp.task('default', [/* 'sass',  */'templatecache', 'ng_annotate']);
gulp.task('ultim', ['useref', 'minjs', 'mincss', 'copycssimages']);

gulp.task('clean', function () {
	return gulp.src('./www/dist', {read: false})
		.pipe(clean());
});


gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    // .pipe(minifyCss({
    //   keepSpecialComments: 0
    // }))
    // .pipe(rename({ extname: '.min.css' }))
    // .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.templatecache, ['templatecache']);
  gulp.watch(paths.ng_annotate, ['ng_annotate']);
  //gulp.watch(paths.useref, ['useref']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('templatecache', function(done){
  gulp.src('./www/templates/**/*.html')
  .pipe(templateCache({standalone:true}))
  .pipe(gulp.dest('./www/js'))
  .on('end', done);
});

gulp.task('ng_annotate', function (done) {
  gulp.src('./www/js/**/*.js')
  .pipe(ngAnnotate({single_quotes: true}))
  .pipe(gulp.dest('./www/dist/dist_js/app'))
  .on('end', done);
});

gulp.task('useref', function (done) {
  //var assets = useref.assets();
  gulp.src('./www/*.html')
  // .pipe(assets)
  // .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('./www/dist'))
  .on('end', done);
});

gulp.task('minjs', function (done) {
  gulp.src('./www/dist/dist_js/app.js')
  .pipe(ngAnnotate({single_quotes: true}))
  .pipe(uglify())
  //.pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest('./www/dist/dist_js'))
  .on('end', done);
});

gulp.task('minleaflet', function (done) {
  gulp.src('./www/dist/dist_lib/leaflet/leaflet_plugins.js')
  //.pipe(ngAnnotate({single_quotes: true}))
  .pipe(uglify())
  .pipe(gulp.dest('./www/dist/dist_lib/leaflet'))
  .on('end', done);
});

gulp.task('mincss', function (done) {
  gulp.src('./www/dist/dist_css/*.css')
  .pipe(autoprefixer())
  .pipe(sass())
  .pipe(minifyCss({
    keepSpecialComments: 0
  }))
  //.pipe(rename({ extname: '.min.css' }))
  .pipe(gulp.dest('./www/dist/dist_css'))
  .on('end', done);
});

gulp.task('copycssimages', function (done) {
  gulp.src('./www/css/images/**/*.*')
     .pipe(gulp.dest('./www/dist/dist_css/images'));
});
