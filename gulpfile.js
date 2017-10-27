var gulp    = require('gulp');
var sass    = require('gulp-sass');
var inject  = require('gulp-inject');
var wiredep = require('wiredep').stream;
var del     = require('del');
var mainBowerFiles = require('main-bower-files');
var filter  = require('gulp-filter');
var concat  = require('gulp-concat');
var csso    = require('gulp-csso');
var connect = require('gulp-connect');

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    port: 8000
  });
});

gulp.task('watch', function(){
    gulp.watch('src/**/*.*', ['build']); 
})

gulp.task('clean', function(cb){
  del.sync(['dist'], cb);
});

gulp.task('styles', function(cb){
  var injectAppFiles = gulp.src('src/styles/*.scss', {read: false});
  var injectGlobalFiles = gulp.src('src/global/*.scss', {read: false});

  function transformFilepath(filepath) {
    return '@import "' + filepath + '";';
  }

  var injectAppOptions = {
    transform: transformFilepath,
    starttag: '// inject:app',
    endtag: '// endinject',
    addRootSlash: false
  };

  var injectGlobalOptions = {
    transform: transformFilepath,
    starttag: '// inject:global',
    endtag: '// endinject',
    addRootSlash: false
  };

  return gulp.src('src/main.scss')
    .pipe(wiredep())
    .pipe(inject(injectGlobalFiles, injectGlobalOptions))
    .pipe(inject(injectAppFiles, injectAppOptions))
    .pipe(sass())
    // .pipe(csso())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('build-copy', function() {
	return gulp.src('src/**/*.{svg,png,jpg,gif,json}')
		.pipe(gulp.dest('dist'));
});

gulp.task('vendors', function(){
  return gulp.src(mainBowerFiles())
    .pipe(filter('*.css'))
    .pipe(concat('vendors.css'))
    .pipe(csso())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('build-html', ['styles'], function(){
  var injectFiles = gulp.src(['dist/styles/main.css', 'dist/styles/vendors.css']);

  var injectOptions = {
    addRootSlash: false,
    ignorePath: ['src', 'dist']
  };

  return gulp.src('src/index.html')
    .pipe(inject(injectFiles, injectOptions))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['clean', 'vendors',  'build-copy', 'build-html']);