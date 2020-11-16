// 依赖生成
let activeEffect;
export function effect(fn) {
  activeEffect =fn  // 储存fn方法  数据变化调用此方法；
  fn()
}

export function reactive(target) {
  return new Proxy(target,{
    get (target, key, receiver) {
      // 判断是否为对象
      if(typeof target[key] === 'object'){
        return reactive(target[key])  // 递归处理
      }
      return Reflect.get(target, key, receiver);
    },
    set: function (target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      res&&activeEffect() //设置成功后重新渲染
      return res

    }
  })
}
