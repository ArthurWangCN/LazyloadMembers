import groupAndMembers from '../memberData/groupMembers.json';
import firstLevelDepart from '../memberData/firstLevel.json';
import members from '../memberData/allMembers.json';
import selectMemberApi from '../api/selectMemberApi'

export default {
    data(){
        return {
            language: 'zh-cn',
            defaultProps: {
                realName: 'name', // key固定value为传入数据的用户名字段
                userId: 'userId', // key固定value为传入数据的用户id字段
                pId: 'pId', // key固定value为传入数据的用户父id字段
                logo: 'logo', // key固定value为传入数据的图标字段
                department: 'department', // key固定value为传入数据的部门字段
                type: 'type', // key固定value为传入数据的类型字段
                userType: 0, // key固定value为用户类型
            },
            forward: true, // 选用户时，用户是否向数组前添加，默认true向前添加,
            alreadySelectedMembers:[],
            firstLevelDeparts:firstLevelDepart,//一级部门
            departMembers:members,
            disabledList:[],
            curNode:null,
            pageIndex:1,
            groupsAndMembers:groupAndMembers,
            leftTreeData:[],
            centerMembers:[]

        }
    },
    methods: {
        addMember() {
            this.cahngeTab('depart');
            this.$refs.members.show([]);
        },
        confirm(list) {
            //点击确定后的回调
            console.log(list);
        },
        overflow() {
            console.log('超出最大长度');
        },
        //给部门添加一些属性
        addPropsForDepart(departs){
            return departs.map(item=>{
                this.$set(item,'checked',false)
                this.$set(item,'show',true)
                this.$set(item,'isLeaf',false)
                this.$set(item,'children',[])
                !item.parentId?this.$set(item,'parentId',item.pId):null
                console.log(item.parentId)
                return item;
            });
        },
        
        //点击部门加载部门成员
        async getDepartMember(data){
            console.log('data: ', data);
            this.curNode=data.curNode;
            this.departMembers.length=0;
            this.pageIndex=1;
            let param={
                departmentId:data.curNode?data.curNode.id:'',
                userName:data.name,
                pageIndex:this.pageIndex,
                pageSize:15
            }
            await this.getCenterMemberByOrganId(param);
            this.centerMembers=this.departMembers;
        },
        //点击群组过滤群组成员
        getGroupMember(data){
            this.curNode=data.curNode;
            this.departMembers.length=0;
            this.centerMembers=this.centerMembers.filter(item=>{
                return item.pId==data.curNode.id;
            });
        },
        //滚动加载更多成员
        loadMoreMember(data){
            this.curNode=data.curNode;
            let param={
                departmentId:this.curNode?this.curNode.id:'',
                userName:'',
                pageIndex:this.pageIndex++,
                pageSize:15
            }
            this.getCenterMemberByOrganId(param);
        },
        //获取机构成员
        getCenterMemberByOrganId(param){
            selectMemberApi.getOrganMemberRequest(param).then(result=>{
                this.departMembers=this.departMembers.concat(this.addPropsForDepart(result));
            });
        },
        //获取一级部门或子部门
        getDeparts(param){
            selectMemberApi.getDepartsRequest(param).then(result=>{
                if(!param.parentId){
                    this.firstLevelDeparts=this.addPropsForDepart(result);
                }
            }).catch(err=>{
                console.log(err);
            });
        },
        //检索词检索部门树
        searchDeparts(param){
            selectMemberApi.searchDepartsRequest(param).then(result=>{
                this.firstLevelDeparts=this.addPropsForDepart(result);
            }).catch(err=>{
                console.log(err);
            });
        },
        //检索部门
        searchDepartByName(searchName){
            this.firstLevelDeparts.length=0;
            this.searchDeparts({orgId:'',searchName:searchName});
        },
        //懒加载获取子部门
        getChildrenDepart(param){
            selectMemberApi.getDepartsRequest({departmentId:param.node.data.id,departmentName:''}).then(result=>{
                param.node.data.children=result;
                return param.resolve(param.node.data.children)
            }).catch(err=>{
                console.log(err);
            });
        },
        //获取群组及成员
        getGroupsAndMembers(){
            selectMemberApi.getGroupsAndMembersRequest().then(result=>{
                this.groupsAndMembers=this.addPropsForDepart(result);
            }).catch(err=>{
                console.log(err);
            });
        },
        //切换部门和群组
        cahngeTab(tabName){
            this.leftTreeData=[];
            this.centerMembers=[];
            if(tabName=='depart'){
                this.leftTreeData=this.firstLevelDeparts;
                this.centerMembers=this.departMembers;
                this.leftTreeData.unshift({realName:'全部部门成员',id:'all',parentId:'',show:true, isLeaf: true,});
            }else{
                this.groupsAndMembers=this.addPropsForDepart(this.groupsAndMembers);
                this.groupsAndMembers.forEach(item=>{
                    if(item.type==1) this.leftTreeData.push(item);
                    else this.centerMembers.push(item);
                });
                this.leftTreeData.unshift({realName:'全部群组成员',id:'0',parentId:'',show:true});

            }
        },
    },
    created(){
        //获取一级部门
        this.getDeparts({departmentId:'',departmentName:''});
        let param={
            departmentId:this.curNode?this.curNode.id:'',
            userName:'',
            pageIndex:this.pageIndex,
            pageSize:15
        }
        this.getCenterMemberByOrganId(param);
        this.getGroupsAndMembers();
    }
}