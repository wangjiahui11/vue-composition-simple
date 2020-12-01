

## vue3.0 源码分析

### 了解知识点1

1. [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
2. [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
3. [WeakSet](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
4. [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
5. [Vue Composition API](https://vue-composition-api-rfc.netlify.com/#summary)



### rollup环境搭建（es6转es5、压缩、本地服务器、热更新）

- 涉及依赖包

  ```bash
  @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve 
  rollup-plugin-uglif rollup-plugin-livereload
  
  devDependencies 内的包都要装上，简单说下一些包的作用：
  
  @babel/core：babel核心实现
  @babel/preset-env：es6转es5，使用这个包要基于 @babel/core
  rollup-plugin-babel：babel 插件
  rollup-plugin-livereload：热更新插件
  rollup-plugin-serve：服务器插件，用于开启本地服务器
  rollup-plugin-uglify：压缩代码
  ```

- 项目搭建

  1. 文件目录 package.js

     ```
     {
       "name": "my-compostion-simple",
       "version": "1.0.0",
       "description": "",
       "main": "index.js",
       "scripts": {
         "serve": "rollup -c -w"
     },
       "keywords": [],
     "author": "",
       "license": "ISC",
       "devDependencies": {
         "@babel/core": "^7.10.2",
         "@babel/preset-env": "^7.10.2",
         "rollup": "^2.15.0",
         "rollup-plugin-babel": "^4.4.0",
         "rollup-plugin-livereload": "^1.3.0",
         "rollup-plugin-serve": "^1.0.1",
         "rollup-plugin-uglify": "^6.0.4"
       }
     }
     ```
  
  2. 搭建环境
  
     .balbelr
  
     ```
     {
       "presets": [
         "@babel/preset-env"
       ]
     }
     ```
  
     `rollup.config.js`
  
     ```
     import babel from 'rollup-plugin-babel';
     import {uglify} from 'rollup-plugin-uglify';
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
     ```
  
  3. 配置完成后
  
     ```
     npm run serve
     ```

### 分析模块

- ##### DOM节点的操作(runtime-dom)

  1. 插入-insert，增-createElement，删-remove 改-setElementText，
  2. 属性的处理-pathProps（事件，样式）

- ##### 虚拟DOM转真实DOM(index.js)

  1. 虚拟dom的结构
  2. mountElement(挂载元素) , mountChildren(挂载子元素)，
  3. mountCompostions(挂载组件)，
  4. pach（渲染操作）

- **响应式模块(reactivity.js)**
  
  1. effect函数（副作用）
  3. reactive函数（原理）
  4. track函数（依赖收集）
  5. trager函数（触发副作用）
  
- **vue3.0 初始化模块**



### 步骤分析

- ##### 实现虚拟DOM转换成真实的DOM

  **index.html -- vnode虚拟节点结构**

  ```
    const vnode = {
        tag: 'div',
        props: {
          style: { color: 'red', border: '1px solid yellow', padding: '20px' }
        },
        children:
          [
              {
                tag: 'p',
                props: null,
                children: `vue@3- 渲染 ${state.count}`
              }, {
                tag: 'button',
                props: {
                  onClick: () => alert(state.count)
                },
                children: '点我啊'
              },
          ]
      }
      render(vnode, app);
  ```

  **runtime-dom.js -- dom的操作**

  ```
  let onReg = /^on[^a-z]/  // 事件处理的正则
  export const nodeOps = {
    /*
      1.节点的增删改插操作;
      2.props的操作,属性，事件等判断
    */
    insert: (child, parent, anchor) => {
      // achor 表示锚点，即插入的位置
      if (anchor) {
        parent.insertBefore(child, anchor);
      } else {
        parent.appendChild(child);
      }
    },
    remove: (child) => {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    createElement: (tag) => document.createElement(tag),
    setElementText: (el, text) => el.textContent = text,
    // 属性处理的方法；
    pathProps: (el, key, value) => {
      let isOn = onReg.test(key)
      if (isOn) {
        let eventName = key.slice(2).toLowerCase()
        el.addEventListener(eventName, value)
      } else {
        if (key === 'style') {
          // 样式绑定  style: { color: 'red' ,border:'1px soild blue'}
          for (const key in value) {
            el.style[key] = value[key]
          }
        } else {
          el.setAttribute(key, value)
        }
      }
    }
  }
  ```

  **index.js  --虚拟DOM转换成真实的DOM**

  ```
  import { nodeOps } from './runtime-dom';
  
  // container挂载的容器
  export function render (vnode, container) {
    // 渲染分为两种 一种是初始化 一种是是diff
    patch(null, vnode, container);
  }
  
  // 渲染操作
  function patch (n1, n2, container) {
    if(typeof n2.tag=== 'string'){
      mountElement(n2, container)
    }else if(typeof n2.tag ==='object'){
      mountCompostions(n2, container)
    }
  }
  // 挂载元素操作
  /*
    1.创建元素
    2.判断child的属性 a.若为数组，则对数组循环处理，b.字符串时则插入到文本中
    3.插入到对应的dom节点上
  */
  function mountElement (vnode, container) {
    let { tag, props, children } = vnode
    let el = nodeOps.createElement(tag)
    if(props){
      for (const key in props) {
          const value = props[key];
          nodeOps.pathProps(el,key,value)
      }
    }
    if(typeof children ==='string'){
      nodeOps.setElementText(el,children)
    } else if (Array.isArray(children)){
      mountChildren(children, el)
    }
    nodeOps.insert(el,container,null)
  }
  
  // 循环挂载子元素
  function mountChildren (children, container) {
    for (let i = 0; i < children.length; i++) {
      const ele = children[i];
      // 渲染操作
      patch(null, ele, container)
    }
  }
  ```

  参考版本：https://github.com/wangjiahui11/vue-composition-simple/commit/38de57e2cb1d6dad0a40f0cdc891ea9df49abaf8

- ##### vue3.0组件的实现

  **index.html **

  ```
     const MyComponent = {
          setup() {
              return () => ({
                  tag: 'div',
                  props: { style: { color: 'blue' } },
                  children: '我是一个组件' + state.count
              })
          }
      }
      
   	const vnode = {
        tag: 'div',
        props: {
          style: { color: 'red', border: '1px solid yellow', padding: '20px' }
        },
        children:
          [
        		....
              {
                tag: MyComponent,
                props: { title: 'title', test: 'test' }, //组件的属性
                children: '' // 组件插槽
              },
          ]
      }
  ```

  **index.js**

  ```
  
  // 渲染操作
  function patch (n1, n2, container) {
    if(typeof n2.tag=== 'string'){
      mountElement(n2, container)
    }else if(typeof n2.tag ==='object'){
      mountCompostions(n2, container)
    }
  }
  
  / 挂载组件的操作
  /*
    1.创建元素
    2.判断child的属性 a.若为数组，则对数组循环处理，b.字符串时则插入到文本中
    3.插入到对应的dom节点上
  */
  function mountCompostions (vnode, container) {
    const instance = { // 创建元素实例
      vnode,
      render: null, // setup返回的结果
      subTree: null, // 子元素
    }
    let props = matchProps(vnode.props, vnode.tag.props) //匹配props的值
    let compostion = vnode.tag
    instance.render = compostion.setup(props, instance)  
    // 返回()=>({tag:'div',props:',childern:null}) 的函数
    instance.subTree = instance.render&& instance.render()
    patch(null, instance.subTree, container)
  }
  
  // 匹配props的值
   function matchProps(props,tagProps){
     if (tagProps){
       let resProps={}
       for (const key in tagProps) {
         if (props.hasOwnProperty(key)){
           resProps[key] = props[key]
         }
       }
       return resProps
     }
   }
  
  ```

  参考：https://github.com/wangjiahui11/vue-composition-simple/commit/7e926d22b5125871cad3cd0f9430706068877d76

- ##### Vue3.0响应式原理

  ##### index.js

  ```
  ...
  export * from './reactivity';  // 导入后导出；
  ...
  ```

  **reactivity.js**  

  ```
  // 依赖生成
  let activeEffect;
  let activeEffect;
  export function effect(fn) {
      activeEffect = fn;
      fn();
  }
  export function reactive(target) {
      return new Proxy(target, {
          set(target, key, value, receiver) {
              const res = Reflect.set(target, key, value, receiver);
              activeEffect();
              return res;
          },
          get(target, key, receiver) {
              const res = Reflect.get(target, key, receiver)
              return res;
          }
      })
  }
  ```

  响应式初步完成---主要存在是effect依赖是整个state数据，数据state.name 变化导致effect执行

  参考：https://github.com/wangjiahui11/vue-composition-simple/commit/835ddb60a855f37bd1be416c3346f93cdfe79f5f

- **依赖收集及组件的更新**

  **reactivity.js**  

  ```
  // 依赖生成
  let activeEffect;
  export function effect(fn) {
    activeEffect =fn  // 储存fn方法  数据变化调用此方法；
    fn()
    activeEffect=null
  }
  
  const targetMap = new WeakMap();  // {target:{name1:[effect1],name2:[effect2]}}
  
  // ----------依赖收集
  function track(target,key) {
    let depsMap = targetMap.get(target)
    if(!depsMap){
      targetMap.set(target,(depsMap=new Map()))  //Map 对象结构
    }
    let deps =depsMap.get(key)
    if(!deps){
      depsMap.set(key,(deps=new Set()))   // 数组的结构
    }
    if (activeEffect && !deps.has(activeEffect)){
      deps.add(activeEffect) // 依赖添加到set中
    }
  }
  // ---------触发依赖
  function trigger(target,key,val) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    deps && deps.forEach(effect => effect());
  }
  
  // -------- 响应式的原理---------
  export function reactive(target) {
    return new Proxy(target,{
      get (target, key, receiver) {
        // 判断是否为对象 懒递归，取值后才递归操作
        if(typeof target[key] === 'object'){
          return reactive(target[key])  // 递归处理
        }
        track(target, key); // 收集依赖
        return Reflect.get(target, key, receiver);
      },
      set: function (target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        // res&&activeEffect() //设置成功后重新渲染
        trigger(target, key, value); // 触发更新
        return res
      }
    })
  }
  
  ```

  ###### **index.js**

  ```
  function mountCompostions (vnode, container) {
    const instance = { // 创建元素实例
      vnode,
      render: null, // setup返回的结果
      subTree: null, // 子元素
    }
    let props = matchProps(vnode.props, vnode.tag.props) //匹配props的值
    let compostion = vnode.tag
    instance.render = compostion.setup(props, instance)  
    // 返回()=>({tag:'div',props:',childern:null}) 的函数
    effect(() => {
      // 给组件添加effect，组件中的属性变化时只执行对应方法
      instance.subTree = instance.render&& instance.render()
      patch(null, instance.subTree, container)
    })
  }
  
  ```

  ###### **index.html**

  ```
    const vnode = {
  		...
          children: [
            {
              tag: 'p',
              props: { onClick: () => state.count++ },
              children: `点击调用Proxy set的方法----${state.name}`
            }, {
              tag: 'button',
              props: {
                onClick: () => state.name = '名字变了'
              },
              children: '点我啊'
            }
          ]
        }
  ```

  参考：https://github.com/wangjiahui11/vue-composition-simple/commit/c99bd2007945eebed23ac1501851248b5592faac

- 







