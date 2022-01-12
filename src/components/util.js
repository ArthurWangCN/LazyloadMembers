Array.prototype.findIndex=function(callback){
    for (var i = 0;i<this.length;i++){
        if(callback(this[i])){
            return i;
        }
    }
    return -1;
}
Array.prototype.find=function(callback){
    for (var i = 0;i<this.length;i++){
        if(callback(this[i])){
            return this[i]
        }
    }
    return undefined;
}
// 节流函数

const throttle = (func, wait, options) => {
  let timer, trailTimer;
  let previous = 0;
  let preExcute = 0; // 上次执行结束时间
  options = options || {
    leading: false,
    trailing: true,
    context: null
  }
  const _throttle = (...args)=>{
    let now = Date.now();

    if (!options.leading) {
      // 没有配置开头执行，过段时间执行一次
      if (timer) return;
      timer = setTimeout(() => {
        func.apply(options.context, args);
        timer = null;
        preExcute = Date.now();
      }, wait);
    } else if (now - previous > wait) {
      // 配置开头执行，大于等待时间执行一次
      func.apply(options.context, args);
      previous = now;
      preExcute = Date.now();
    }
    if (options.trailing && preExcute) {
      if (trailTimer) {
        clearTimeout(trailTimer);
        trailTimer = null;
      }
      trailTimer = setTimeout(() => {
        func.apply(options.context, args);
        _throttle.cancel();
      }, wait - Date.now() + preExcute);
    }
  }
  _throttle.cancel =  ()=> {
    previous = 0;
    preExcute = 0;
    clearTimeout(timer);
    clearTimeout(trailTimer);
    trailTimer = null
    timer = null;
  }
  return _throttle;
};
const changeInfo = (arr, departmentType, text) => {
  let result = [];
  let map = {};
  let departmentMap = {};
  let departmentResult = [];
  let repeatedMap = {};
  // 将信息添加到map对象中
  arr.forEach((node, i) => {
    if (map[node.userId]) {
      repeatedMap[i] = true;
    } else {
      map[node.userId] = node;
      node.children = [];
      if (node.type === departmentType) {
        departmentMap[node.userId] = {
          ...node
        };
        node.children = [];
      }
    }
  });

  let departments = [];
  let other = []; // 未绑定机构
  // 将部门放到对应数组下
  arr.forEach((node, i) => {
    if (repeatedMap[i]) return;
    if (node.type === departmentType) {
      departments.push(node);
    }
    if (map[node.pId]) {
      map[node.pId].children.push(node);
      if (departmentMap[node.pId] && node.type === departmentType) {
        departmentMap[node.pId].children.push(departmentMap[node.userId]);
      }
    } else if (node.type === departmentType) {
      result.push(node);
      departmentResult.push(departmentMap[node.userId]);
    } else {
      other.push(node);
    }
  });

  // 删除空部门
  departments.forEach((department, index) => {
    while (department && !department.children.length) {
      let arr;
      if (map[department.pId]) {
        arr = map[department.pId].children;
      } else {
        arr = result;
      }
      let x = arr.indexOf(department);
      // 该部门已经在之前的操作中删除，所以在这里不执行下面的删除操作
      if (x === -1) return;
      arr.splice(x, 1);
      department = map[department.pId];
    }
  });
  for (let i = departmentResult.length - 1; i >= 0; i--) {
    if (
      result.findIndex(item => departmentResult[i].userId === item.userId) < 0
    ) {
      departmentResult.splice(i, 1);
    }
  }
  if (other.length) {
    const guid = generateGuid();
    result.push({
      userId: guid,
      type: departmentType,
      realName: text,
      children: other,
    });
    departmentResult.push({
      userId: guid,
      type: departmentType,
      realName: text,
      children: [],
    });
    map[guid] = {
      userId: guid,
      type: departmentType,
      realName: text,
      children: other,
    };
  }
  return {
    map,
    departmentResult
  };
};
const getMemberList = (node, departmentType, cache) => {
  let result = [];
  const dfs = node => {
    if (node.type == departmentType) {
      if (node.children.length) {
        node.children.forEach(child => {
          dfs(child);
        });
      }
    } else {
      result.push(node);
    }
  };
  dfs(node);
  return result;
};
// 转换映射关系
const convert = (data, props, direction) => {
  if (direction) {
    let tempObj = {};
    for (let key in props) {
      tempObj[props[key]] = key;
    }
    props = tempObj;
  }
  let obj = {};
  for (let key in data) {
    if (props.hasOwnProperty(key)) {
      obj[props[key]] = data[key];
    } else {
      obj[key] = data[key];
    }
  }
  return obj;
};
// 生成Guid
const generateGuid = () => {
  let s = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');
};
// 按字母排序
const naturalCompare = (a, b) => {
  var lengthA = (a += '').length;
  var lengthB = (b += '').length;
  var aIndex = 0;
  var bIndex = 0;
  while (aIndex < lengthA && bIndex < lengthB) {
    var charCodeA = a.charCodeAt(aIndex);
    var charCodeB = b.charCodeAt(bIndex);
    if (charCodeA === charCodeB) {
      aIndex++;
      bIndex++;
    } else {
      return charCodeA - charCodeB;
    }
  }
};

export {
  throttle,
  generateGuid,
  changeInfo,
  getMemberList,
  convert,
  naturalCompare
}