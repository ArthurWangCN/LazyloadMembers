
const axios = require('axios');
const qs = require('qs');
// Add a request interceptor
axios.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    let data=response.data;
    if(data.success&&/getChannelList$/g.test(response.config.url)){
        let {total,content}=data;
        return {total,content}
    } 
    if(data.success&&(/verifyCode$/g.test(response.config.url)||/login$/g.test(response.config.url))) return data;
    if(response.status===200&&/download$/g.test(response.config.url)) {
        let blob=new Blob([data],{type: data.type});
        return Object.assign(blob,{lastModifiedDate:new Date()});
    };
    if(data.success) return data.content||data.success;
    return Promise.reject(data);
}, function (error) {
    return Promise.reject(error);
});
const transformResponse=(data)=>{
   return data.success?data.content:data.message||data.success;
};
/**
 * 如果涉及到跨域，在预请求要对post请求的参数进行处理,将跨域的预检请求转换为简单请求
 * 方法一：使用URLSearchParams方法，但是该方法不支持ie
 * 方法二：qs.stringfy
 *  */   
const transformPostParam=(data)=>{
    // let paramObj = new URLSearchParams();
    // for(let key in data) {
    //     paramObj.append(data[key]);
    // }
    // return paramObj;
    Object.keys(data).forEach(item => {
        (typeof(data[item])=='object') && (data[item] = JSON.stringify(data[item]));
    });
    return qs.stringify(data);
    
};
const request=(param)=>{
    let baseUrl=param.baseUrl||'/creation/';
    return axios(Object.assign(param, {
            baseURL:baseUrl,
            headers:{ 
                'content-type':'application/json',
                //'cookie'
            },
            params:param.method=='get'?param.data:'',
            // transformResponse:[
            //     transformResponse
            // ]
        }
    ));
};
export default request;