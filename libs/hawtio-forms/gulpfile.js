var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    del = require('del'),
    fs = require('fs'),
    path = require('path'),
    urljoin = require('url-join'),
    argv = require('yargs').argv,
    s = require('underscore.string');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  main: '.',
  ts: ['plugins/**/*.ts'],
  testTs: ['test-plugins/**/*.ts'],
  less: ['plugins/**/*.less'],
  templates: ['plugins/**/*.html'],
  testTemplates: ['test-plugins/**/*.html'],
  templateModule: pkg.name + '-templates',
  testTemplateModule: pkg.name + '-test-templates',
  dist: argv.out || './dist/',
  js: pkg.name + '.js',
  testJs: pkg.name + '-test.js',
  css: pkg.name + '.css',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: true,
    noExternalResolve: false
  }),
  testTsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: false,
    noExternalResolve: false
  })
};

gulp.task('bower', function() {
  return gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

/** Adjust the reference path of any typescript-built plugin this project depends on */
gulp.task('path-adjust', function() {
  return gulp.src('libs/**/includes.d.ts')
    .pipe(plugins.replace(/"\.\.\/libs/gm, '"../../../libs'))
    .pipe(gulp.dest('libs'));
});

gulp.task('clean-defs', function() {
  return del('defs.d.ts');
});

gulp.task('example-tsc', ['tsc'], function() {
  var tsResult = gulp.src(config.testTs)
    .pipe(plugins.typescript(config.testTsProject))
    .on('error', plugins.notify.onError({
      onLast: true,
      message: '<%= error.message %>',
      title: 'Typescript compilation error - test'
    }));

    return tsResult.js
        .pipe(plugins.concat('test-compiled.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('example-template', ['example-tsc'], function() {
  return gulp.src(config.testTemplates)
    .pipe(plugins.angularTemplatecache({
      filename: 'test-templates.js',
      root: 'test-plugins/',
      standalone: true,
      module: config.testTemplateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.testTemplateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('example-concat', ['example-template'], function() {
  return gulp.src(['test-compiled.js', 'test-templates.js'])
    .pipe(plugins.concat(config.testJs))
    .pipe(gulp.dest(config.dist));
});

gulp.task('example-clean', ['example-concat'], function() {
  return del(['test-templates.js', 'test-compiled.js']);
});


gulp.task('tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.typescript(config.tsProject))
    .on('error', plugins.notify.onError({
      onLast: true,
      message: '<%= error.message %>',
      title: 'Typescript compilation error'
    }));

    return eventStream.merge(
      tsResult.js
        .pipe(plugins.concat('compiled.js'))
        .pipe(gulp.dest('.')),
      tsResult.dts
        .pipe(gulp.dest('d.ts')))
        .pipe(plugins.filter('**/*.d.ts'))
        .pipe(plugins.concatFilenames('defs.d.ts', {
          root: cwd,
          prepend: '/// <reference path="',
          append: '"/>'
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('less', function () {
  return gulp.src(config.less)
    .pipe(plugins.less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', plugins.notify.onError({
      onLast: true,
      message: '<%= error.message %>',
      title: 'less file compilation error'
    }))
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest(config.dist));
});

gulp.task('template', ['tsc'], function() {
  return gulp.src(config.templates)
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: 'plugins/',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('concat', ['template'], function() {
  return gulp.src(['compiled.js', 'templates.js'])
    .pipe(plugins.concat(config.js))
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', ['concat'], function() {
  return del(['templates.js', 'compiled.js']);
});

gulp.task('watch-less', function() {
  plugins.watch(config.less, function() {
    gulp.start('less');
  });
});

gulp.task('watch', ['build', 'build-example', 'watch-less'], function() {
  plugins.watch(['libs/**/*.js', 'libs/**/*.css', 'index.html', urljoin(config.dist, '*')], function() {
    gulp.start('reload');
  });
  plugins.watch(['libs/**/*.d.ts', config.ts, config.templates], function() {
    gulp.start(['tsc', 'template', 'concat', 'clean']);
  });
  plugins.watch([config.testTs, config.testTemplates], function() {
    gulp.start([ 'example-template', 'example-concat', 'example-clean']);
  });
});

gulp.task('connect', ['watch'], function() {
  plugins.connect.server({
    root: '.',
    livereload: true,
    port: 2772,
    fallback: 'index.html'
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(plugins.connect.reload());
});

gulp.task('site', ['build', 'build-example'], function() {
  gulp.src('website/.gitignore')
    .pipe(gulp.dest('site'));
  gulp.src('website/*')
    .pipe(gulp.dest('site'));
  gulp.src('index.html')
    .pipe(plugins.rename('404.html'))
    .pipe(gulp.dest('site'));
  gulp.src(['README.md', 'index.html', 'css/**', 'images/**', 'img/**', 'libs/**/*.js', 'libs/**/*.css', 'libs/**/*.swf', 'libs/**/*.woff','libs/**/*.woff2', 'libs/**/*.ttf', 'libs/**/*.map', 'dist/**'], {base: '.'})
    .pipe(gulp.dest('site'));

  var dirs = fs.readdirSync('./libs');
  dirs.forEach(function(dir) {
    var path = './libs/' + dir + "/img";
    try {
      if (fs.statSync(path).isDirectory()) {
        console.log("found image dir: " + path);
        var pattern = 'libs/' + dir + "/img/**";
        gulp.src([pattern]).pipe(gulp.dest('site/img'));
      }
    } catch (e) {
      // ignore, file does not exist
    }
  });
});

gulp.task('deploy', ['build', 'build-example', 'site'], function() {
  return gulp.src(['site/**', 'site/**/*.*', 'site/*.*'], { base: 'site' })
    .pipe(plugins.debug({title: 'deploy'}))
    .pipe(plugins.ghPages({
      message: "[ci skip] Update site"
    }));
});


gulp.task('build', ['bower', 'path-adjust', 'tsc', 'less', 'template', 'concat', 'clean']);
gulp.task('build-example', ['example-tsc', 'example-template', 'example-concat', 'example-clean']);

gulp.task('default', ['connect']);



