const gulp = require('gulp');
const htmlMin = require('gulp-htmlmin');
const cssMin = require('gulp-clean-css');
const jsMin = require('gulp-terser');
const zip = require('gulp-zip');

const folderApp = 'app/';
const folderBuild = 'dist/';

// Tâche pour copier tous les fichiers
gulp.task('copy', function () {
    return gulp.src(folderApp + '**/*')
        .pipe(gulp.dest(folderBuild + folderApp));
});

// Tâche pour minifier les fichiers HTML
gulp.task('minify-html', () => {
    return gulp.src(folderApp + '*.html')
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(gulp.dest(folderBuild + folderApp));
});

// Tâche pour minifier les fichiers CSS
gulp.task('minify-css', () => {
    return gulp.src(folderApp + '*.css')
        .pipe(cssMin())
        .pipe(gulp.dest(folderBuild + folderApp));
});

// Tâche pour minifier les fichiers JavaScript
gulp.task('minify-js', () => {
    return gulp.src(folderApp + '*.js')
        .pipe(jsMin())
        .pipe(gulp.dest(folderBuild + folderApp));
});

// Tâche pour compresser tous les fichiers minifiés dans un fichier ZIP
gulp.task('zip', () => {
    const manifestVersion = require('./' + folderApp + 'manifest.json').version;
    return gulp.src(folderBuild + folderApp + '**/*')
        .pipe(zip('app_v' + manifestVersion +'.zip'))
        .pipe(gulp.dest(folderBuild));
});

// Tâche par défaut pour exécuter toutes les tâches
gulp.task('default', gulp.series('copy', 'minify-html', 'minify-css', 'minify-js', 'zip'));
