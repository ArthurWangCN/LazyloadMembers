
<template>
  <el-dialog
    class="tree-dialog"
    title="选择成员"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :append-to-body="appendToBody"
    :modal="modal"
    :before-close="handleBeforeClose"
    @closed="handleDialogClosed"
  >
    <!--两行时添加类名check_tree_con_col_2-->
    <div class="check_tree_con tree-lazyload">
      <!-- 左侧 -->
      <div class="tree_con_l tree_com">
        <el-tabs type="border-card" v-model="activeTab" @tab-click="changeTab">
          <el-tab-pane
            :label="`按${item.name}找人`"
            :name="item.label"
            v-for="item in tabOptions"
            :key="item.name"
          >
            <div class="tree_com_box">
              <el-input
                class="tree_cb_search"
                :placeholder="`检索${item.name}`"
                v-model.trim="filterDepartment"

                @keypress.enter.native="searchDepartByName"
              >
                <i
                  slot="suffix"
                  class="el-input__icon el-icon-search cp"
                  @click="searchDepartByName"
                ></i
              ></el-input>
              <!-- 全部{{item.name}}成员 -->
              <!-- <p v-if="item.name ==text.department" class="tree_gro_tit" :class="{'cur':item.curId == item.name}" @click="showAllMember(item)">{{text.allRangeMember.replace(/\{0\}/,item.name)}}</p>   -->
              <div class="tree_cb_bot">
                <el-scrollbar>
                  <template v-if="activeTab == 'depart'">
                    <ul class="depart-list" v-show="searchFlag">
                      <li
                        class="depart-item"
                        v-for="item in departSearchList"
                        :key="item.id"
                        :title="item.name"
                        @click="handleSearchItemClick(item)"
                      >
                        {{ item.name }}
                      </li>
                      <p v-if="departSearchList.length === 0">暂无数据</p>
                    </ul>
                    <el-tree
                      node-key="id"
                      v-if="!searchFlag&&showDeptTree"
                      ref="departTree"
                      :props="defaultProps"
                      :default-expand-all="false"
                      :highlight-current="true"
                      :expand-on-click-node="false"
                      @node-click="handleNodeClick"
                      :lazy="true"
                      :load="loadNode"
                      :default-expanded-keys="expandKeys"
                    >
                    </el-tree>
                  </template>
                  <template v-else>
                    <ul>
                      <li
                        class="tree_li_item clearfix"
                        :class="{ cur: curNode && group.id === curNode.id }"
                        v-for="group in firstLevelDepartsFinal"
                        :key="group.id"
                        v-show="group.show"
                        :title="group.realName"
                        @click="handleNodeClick(group)"
                      >
                        {{ group.realName }}
                      </li>
                    </ul>
                  </template>
                </el-scrollbar>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <i class="el-icon-d-arrow-right tree_arrow"></i>
      </div>
      <!-- 中间 -->
      <div class="tree_con_m tree_com">
        <!-- '成员':'团队成员' -->
        <h2 class="tree_com_tit">{{ text.member }}</h2>
        <div class="tree_com_box">
          <!-- 检索成员 -->
          <el-input
            class="tree_cb_search"
            :placeholder="text.searchMember"
            v-model.trim="filterMember"
            @keypress.enter.native="searchMember"
            ><i
              slot="suffix"
              class="el-input__icon el-icon-search cp"
              @click="searchMember"
            ></i
          ></el-input>
          <!--  -->
          <el-checkbox v-model="allChecked" @change="selectAll">{{
            text.selectAll
          }}</el-checkbox>
          <div class="tree_cb_bot">
            <el-scrollbar id="middleScroll">
              <ul id="memberList">
                <li
                  class="tree_li_item clearfix"
                  :class="{ cur: member.checked }"
                  v-show="member.show"
                  v-for="member in centerMembersFinal"
                  :key="member.id"
                  @click="checkMember(member)"
                >
                  <span
                    class="tree_float_l tree_per_wid"
                    :title="member.realName"
                    >{{ member.realName }}</span
                  >
                  <span
                    class="tree_de_wid tree_float_r"
                    :title="member.department"
                    >{{ member.department }}</span
                  >
                </li>
              </ul>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <!-- 已选成员 -->
      <div class="tree_con_r tree_com">
        <!-- 已选成员 -->
        <h2 class="tree_com_tit">
          {{ totalLength }}
        </h2>
        <div class="tree_com_box">
          <el-button class="tree_cb_btn" @click="clear">{{
            text.clear
          }}</el-button>
          <div class="tree_cb_bot">
            <el-scrollbar>
              <ul>
                <li
                  class="tree_li_item clearfix"
                  v-for="(member, index) in selectedMembers"
                  :key="member.id"
                >
                  <span class="tree_float_l"
                    ><i
                      v-if="disabledList.indexOf(member.id) < 0"
                      class="el-icon-error tree_error"
                      @click="remove(member, index)"
                    ></i
                    ><span class="tree_per_wid" :title="member.realName">{{
                      member.realName
                    }}</span></span
                  >
                  <span
                    class="tree_de_wid tree_float_r"
                    :title="member.department"
                    >{{ member.department }}</span
                  >
                </li>
              </ul>
            </el-scrollbar>
          </div>
        </div>
        <i class="el-icon-d-arrow-right tree_arrow"></i>
      </div>
    </div>
    <div slot="footer" class="check_tree__dialog-footer">
      <el-button type="primary" @click="confirm">{{ text.confirm }}</el-button>
      <el-button @click="cancel">{{ text.cancel }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import Vue from "vue";
import "./pinyin.js";
import "./iconfont.js";
import { throttle, generateGuid, convert, getMemberList } from "./util";
import "../assets/style.css";

import zh from "../i18n/i18nZh.js";
import en from "../i18n/i18nEn.js";

let text1 = {
  en: Object.assign(en, {
    empty: "no data",
    search: "input the key words",
    other: "other",
    confirm: "confirm",
    cancel: "cancel",
    totalLength: "Added personnel: {0}",
    clear: "clear all",
  }),
  zh: Object.assign(zh, {
    empty: "暂无数据",
    search: "输入查找关键字",
    other: "其他",
    confirm: "确 定",
    cancel: "取 消",
    totalLength: "已添加人员：{0}人",
    clear: "清除全部",
  }),
};
// list 转为 Tree 并删除空部门

// 按字母排序
const naturalCompare = (a, b) => {
  var lengthA = (a += "").length;
  var lengthB = (b += "").length;
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

// 按拼音检索判断
const searchByPinYin = (target, searchText) => {
  return (
    target.realName.indexOf(searchText) > -1 ||
    (target.initials &&
      target.initials.some(
        (str) => str.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      )) ||
    (target.fullPinYin &&
      target.fullPinYin.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
  );
};

export default {
  name: "CheckMembers",

  props: {
    // 语言
    language: {
      type: String,
      default() {
        return navigator.language || "zh-cn";
      },
    },
    // 映射关系
    props: {
      type: Object,
    },
    //一级部门数据
    leftTreeData: {
      type: Array,
      default() {
        return [];
      },
    },
    //初始化是的全部成员
    centerMembers: {
      type: Array,
      default() {
        return [];
      },
    },
    // 部门检索列表
    departSearchList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 不可选择用户
    disabledList: {
      type: Array,
      default() {
        return [];
      },
    },
    // element-ui参数
    appendToBody: {
      type: Boolean,
      default: false,
    },
    // 支持最大添加数，默认无穷大
    maxLength: {
      type: Number,
      default: Infinity,
    },
    // 新加用户往前添加还是往后添加，默认往前
    forward: {
      type: Boolean,
      default: true,
    },
    // 是否显示用户所在部门，默认显示
    departmentVisible: {
      type: Boolean,
      default: true,
    },
    // element-ui参数
    modal: {
      type: Boolean,
      default: true,
    },
    // 默认展开节点
    expandKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tabOptions: [
        { name: "部门", label: "depart" },
        // { name: "群组", label: "group" },
      ],
      activeTab: "depart",
      curNode: null,
      // 部门检索词
      filterDepartment: "",
      // 已选人员
      selectedMembers: [],
      // 人员检索词
      filterMember: "",
      // 弹窗显隐
      visible: false,
      // elementTree 使用
      defaultProps: {
        children: "children",
        label: "name",
        // label: "realName",
        id: "id",
        isLeaf: "isLeaf",
      },
      scrollTop: 0, //滚动加载更多标志
      allChecked: false,
      searchFlag: false, // 部门是否为检索
      showDeptTree: false,
      scrollEle: null,
    };
  },
  computed: {
    text() {
      if (/^zh/i.test(this.language)) return text1["zh"];
      return text1["en"];
    },
    totalLength() {
      return this.text.totalLength.replace(
        /\{0\}/,
        this.selectedMembers.length
      );
    },
    firstLevelDepartsFinal() {
      return this.leftTreeData;
    },
    centerMembersFinal() {
      return this.centerMembers.map((item) => {
        //item = convert(item, this.props, true);
        // 存储拼音和首字母后面排序使用
        item.fullPinYin = chineseSpell.ConvertPinyin(item.realName);
        item.initials = chineseSpell.makePy(item.realName);
        // item.checked = false;
        // item.show = true;
        // item.id = item.id;
        return item;
      });
    },
  },
  methods: {
    //切换部门和群组
    changeTab(tab) {
      this.searchFlag = false;
      this.filterDepartment = "";
      this.$emit("cahngeTab", tab.name);
      this.$nextTick(() => {
        this.reCheck();
      });
    },
    //懒加载部门
    loadNode(node, resolve) {
      if (this.activeTab == "group") return;
      if (node.level === 0) {
        // return resolve(this.firstLevelDepartsFinal);
        this.$emit('getFirstLevelDepart', {node, resolve});
      }
      if (node.level > 0) {
        this.$emit("getChildrenDepart", { node, resolve });
      }
    },
    //检索部门
    searchDepartByName() {
      this.searchFlag = this.filterDepartment.trim() !== "";
      if (this.activeTab == "depart") {
        this.$emit("searchDepartByName", this.filterDepartment);
      } else {
        this.searchDepartmentByFilter(
          this.firstLevelDepartsFinal,
          this.filterDepartment
        );
      }
    },
    //检索群组
    searchDepartmentByFilter(ary, val) {
      ary.forEach((item) => {
        if (searchByPinYin(item, val)) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
    },
    //检索群组成员
    filterGroupMember() {
      this.centerMembersFinal.forEach((item) => {
        if (this.curNode.id == 0) return (item.show = true);
        if (
          searchByPinYin(item, this.filterMember) &&
          item.parentId == this.curNode.id
        ) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
    },
    //检索成员
    searchMember() {
      if (this.activeTab == "depart") {
        this.$emit("getDepartMember", {
          curNode: this.curNode,
          name: this.filterMember,
        });
      } else {
        this.searchDepartmentByFilter(
          this.centerMembersFinal,
          this.filterMember
        );
      }
    },
    loadMore(event) {
      if (!this.showDeptTree) return;
      let e = event || window.event;
      let ele = document.querySelector("#middleScroll").firstElementChild;
      // if (ele.scrollTop > this.scrollTop) {
        //判断浏览器ie，谷歌滑轮事件
        if (
          ele.scrollTop + ele.clientHeight >=
          (document.querySelector("#memberList").clientHeight - 5)
        ) {
          this.scrollTop = ele.scrollTop;
          this.$emit("loadMoreMember", {
            curNode: this.curNode,
            name: this.filterMember,
          });
        }
      // }
    },

    reCheck() {
      // 当中间人员列表变化重新checked
      let list = this.selectedMembers.map((item) => item.id);
      this.centerMembersFinal.forEach((member) => {
        if (list.indexOf(member.id) > -1) {
          member.checked = true;
        } else {
          member.checked = false;
        }
      });
    },

    // 节点点击
    async handleNodeClick(data, node, com) {
      if (this.curNode && this.curNode.id == data.id) return;
      this.curNode = data;
      if (this.activeTab == "depart") {
        await this.$emit("getDepartMember", {
          curNode: this.curNode,
          name: this.filterMember,
        });
      } else {
        this.filterGroupMember();
        //await this.$emit('getGroupMember',{curNode:this.curNode,name:this.filterMember});
      }

      this.$nextTick(() => {
        let ele = document.querySelector("#middleScroll").firstElementChild;
        ele.scrollTop = 0;
      });
      this.scrollTop = 0;
      this.reCheck();
    },

    // 检索部门点击
    async handleSearchItemClick(depart) {
      if (this.activeTab == "depart") {
        await this.$emit("getDepartMember", { curNode: depart, name: "" });
      }
    },
    // 人员全选
    selectAll(val) {
      let isOverflow = false;
      let flag = false;
      if (!val) flag = true;
      this.allChecked = val;
      for (let member of this.centerMembersFinal) {
        if (member.show) {
          if (flag) {
            // 取消全选
            // 增加判断disabled 删除
            let index = this.selectedMembers.findIndex(
              (item) => item.id === member.id
            );
            if (index > -1 && this.disabledList.indexOf(member.id) < 0) {
              member.checked = false;
              this.selectedMembers.splice(index, 1);
            }
          } else {
            // 全选
            if (!member.checked) {
              if (this.selectedMembers.length >= this.maxLength) {
                isOverflow = true;
                break;
              }
              member.checked = true;
              this.selectedMembers[this.forward ? "unshift" : "push"](member);
            }
          }
        }
      }
      if (isOverflow) {
        this.$emit("overflow");
      }
    },
    // 人员点击选择
    checkMember(member) {
      let isOverflow = false;
      if (!member.checked) {
        if (this.selectedMembers.length >= this.maxLength) {
          isOverflow = true;
        }
        if (isOverflow) {
          this.$emit("overflow");
        } else {
          member.checked = true;
          this.selectedMembers.push(member);
        }
      } else {
        if (this.disabledList.indexOf(member.id) > -1) return;
        member.checked = false;
        this.selectedMembers.splice(
          this.selectedMembers.findIndex((item) => item.id == member.id),
          1
        );
      }
      if (this.centerMembersFinal.every((item) => item.checked))
        this.allChecked = true;
      else this.allChecked = false;
    },
    // 已选人员全部清除
    clear() {
      for (let i = this.selectedMembers.length - 1; i >= 0; i--) {
        if (this.disabledList.indexOf(this.selectedMembers[i].id) === -1) {
          this.selectedMembers[i].checked = false;
          this.selectedMembers.splice(i, 1);
        }
      }
      this.reCheck();
      if (this.centerMembersFinal.every((item) => item.checked))
        this.allChecked = true;
      else this.allChecked = false;
    },
    // 单个人员的移除
    remove(member, index) {
      if (this.disabledList.indexOf(member.id) > -1) return;
      member.checked = false;
      this.selectedMembers.splice(index, 1);
      if (this.centerMembersFinal.every((item) => item.checked))
        this.allChecked = true;
      else this.allChecked = false;
    },
    // 弹窗初始化方法
    show(members) {
      this.visible = true;
      this.showDeptTree = true;
      this.$nextTick(() => {
        this.filterDepartment = "";
        this.filterMember = "";
        this.reCheck();
        this.$refs.departTree[0].setCurrentKey('all')
      });
      if (members) this.selectedMembers = members;
    },
    // 高亮全部部门成员节点
    highlightAllDept() {
      this.$nextTick(() => {
        this.$refs.departTree[0].setCurrentKey('all')
      })
    },
    // 弹窗关闭
    hide() {
      this.visible = false;
      this.showDeptTree = false;
    },
    // 弹窗确定
    confirm() {
      this.showDeptTree = false;
      this.searchFlag = false;
      this.allChecked = false;
      this.$emit(
        "confirm",
        this.selectedMembers.map((item) => {
          return convert(item, this.props);
        })
      );
    },
    // 弹窗取消
    cancel() {
      this.showDeptTree = false;
      this.visible = false;
      this.searchFlag = false;
      this.allChecked = false;
      this.$emit("cancel");
    },
    // 弹窗关闭前
    handleBeforeClose(done) {
      this.$emit('beforeClose', done);
    },
		// 弹窗关闭后回调
    handleDialogClosed() {
      this.curNode = null;
      this.$emit("checkClosed");
    },
  },
  created() {
    let defaultProps = {
      realName: "realName",
      id: "id",
      pId: "pId",
      logo: "logo",
      type: "type",
    };
    for (let key in defaultProps) {
      if (!this.props.hasOwnProperty(key)) {
        this.props[key] = defaultProps[key];
      }
    }
  },
  watch: {
    visible(curVal, oldVal) {
      if (curVal) {
        this.$nextTick(() => {
          this.$el.querySelector(".check_tree__tree-hide").scrollTop = 0;
        });
      }
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          let ele = document.querySelector("#middleScroll").firstElementChild;
          this.scrollEle = ele;
          ele.addEventListener("scroll", throttle(this.loadMore, 500));
        });
      }
    },
  },
};
</script>