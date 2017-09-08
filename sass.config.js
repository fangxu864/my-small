/**
 * @author [fangxu]
 * @email [864109504@qq.com]
 * @create date 2017-09-08 12:43:51
 * @modify date 2017-09-08 12:43:51
 * @desc [description]
*/

/**
 * 编译sass
 *
 * 说明:
 * npm run sass booking dev 开发时编译booking页面的sass文件
 * npm run sass booking     生产时编译booking页面的sass文件
 */

var yargs = require("yargs");
var gulp = require("gulp");
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var colors = require('colors'); //命令行颜色
var timestamp = require('time-stamp'); //时间戳

//获取npm run sass booking 中的booking
var pageName = yargs.argv._[0],
    sourcefullPath = "./pages/" + pageName + "/" + pageName + ".scss",
    destPath = "./pages/" + pageName + "/";


var compile = {

    /**
     * 编译sass
     * 
     */
    compileSass() {
        gulp.src(sourcefullPath)
            .pipe(sass().on('error', sass.logError))
            .pipe(rename(pageName + ".wxss"))
            .pipe(gulp.dest(destPath));
        console.log(timestamp('YYYY-MM-DD HH:mm:ss').green, "编译完成!".green);
    },

    /**
     * 监听sass文件变化
     * 
     */
    watch() {
        var _this = this;
        var watch = gulp.watch(destPath + "**/*.scss");
        console.log("编译监听中..".green);
        watch.on("change", function () {
            _this.compileSass();
        })
    },

    /**
     * 开发时候运行
     * 
     */
    dev() {
        this.compileSass();
        this.watch();
    },

    /**
     * 编译生产时候
     * 
     */
    production() {
        this.compileSass();
    }
}

if (yargs.argv._[1] === "dev") {
    compile.dev();
} else {
    compile.production();
}


