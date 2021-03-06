import { nodeOps } from './runtime-dom';
export * from './reactivity';  // 导入后导出；

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

// 挂载组件的操作
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
  instance.render = compostion.setup(props, instance)  // 返回()=>({tag:'div',props:',childern:null}) 的函数
  effect(() => {
    // 给组件添加effect，组件中的属性变化时只执行对应方法
    instance.subTree = instance.render&& instance.render()
    patch(null, instance.subTree, container)
  })
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
