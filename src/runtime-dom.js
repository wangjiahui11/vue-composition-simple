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
  pathProps: (el, key, value)=>{
    console.log(el, key, value);
    let isOn = onReg.test(key)
    if(isOn){
      let eventName = key.slice(2).toLowerCase()
      console.log(el);
      el.addEventListener(eventName, value)
    }else{
      if(key ==='style'){
      // 样式绑定  style: { color: 'red' ,border:'1px soild blue'}
        for (const key in value) {
          console.log(value);
            el.style[key]=value[key]
        }
      }else{
        el.setAttribute(key,value)
      }
    }
  }
}
