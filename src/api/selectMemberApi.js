import request from './request.js';
const selectMemberApi={
    //获取一级部门或者子部门
    getDepartsRequest(param){
        return request({
            url:'/user/getDepartmentList',
            method:'get',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    searchDepartsRequest(param){
        return request({
            url:'/user/getUserList',
            method:'get',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //获取机构成员
    getOrganMemberRequest(param){
        return request({
            url:'/user/getUserList',
            method:'get',
            data:param
        }).catch((error)=>{
            throw new Error();
        });
    },
    //获取群组及成员
    getGroupsAndMembersRequest(){
        return request({
            url:'/getGroupsAndMembers',
            method:'get',
        }).catch((error)=>{
            throw new Error();
        });
    },
}
export default selectMemberApi;