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
  }else{

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
