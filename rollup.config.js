// import babel from 'rollup-plugin-babel';
// import serve from 'rollup-plugin-serve';
// export default {
//   input: './src/index.js',
//   output: {
//     format: 'umd', // 模块化类型
//     file: 'dist/umd/vue.js',
//     name: 'Vue', // 打包后的全局变量的名字
//     sourcemap: true
//   },
//   plugins: [
//     babel({
//       exclude: 'node_modules/**'
//     }),
//     process.env.ENV === 'development' ? serve({
//       open: true,
//       openPage: '/public/index.html',
//       port: 3000,
//       contentBase: ''
//     }) : null
//   ]
// }

import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.js', // 入口文件
  output: {
    format: 'umd',
    file: 'dist/vue.js', // 打包后输出文件
    name: 'Vue',  // 打包后的内容会挂载到window，name就是挂载到window的名称
    sourcemap: true // 代码调试  开发环境填true
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
    // 压缩代码
    uglify(),
    // 热更新 默认监听根文件夹
    livereload(),
    // 本地服务器
    serve({
      open: true, // 自动打开页面
      port: 8000,
      openPage: '/index.html', // 打开的页面
      contentBase: ''
    })
  ]
}
