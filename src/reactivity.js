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
