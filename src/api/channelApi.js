import request from './request.js';
const channelApi={
    //获取专业频道数据列表
    getChannelsRequest(param){
        return request({
            url:'/channel/getChannelList',
            method:'get',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //隐藏或显示专业频道
    hideOrShowChannelRequest(param){
         return request({
            url:'/channel/setChannelVisible',
            method:'post',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //删除专业频道
    deleteChannelRequest(param){
        return request({
            url:'/channel/deleteChannel',
            method:'post',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //按步长排序
    sortByStepRequest(param){
        return request({
            url:'/channel/moveChannel',
            method:'post',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //新建专业频道
    createChannelRequest(param){
        return request({
            url:'/channel/addChannel',
            method:'post',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //编辑专业频道
    updateChannelRequest(param){
        return request({
            url:'/channel/updateChannel',
            method:'post',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    }
}
export default channelApi;