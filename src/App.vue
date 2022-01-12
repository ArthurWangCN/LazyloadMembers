<template>
  <div>
    <el-button @click="addMember">Button</el-button>
    <check-members
      ref="members"
      :leftTreeData="leftTreeData"
      :centerMembers="centerMembers"
      :props="defaultProps"
      :language="language"
      :expandKeys="expandKeys"
      :disabled-list="disabledList"
      :max-length="10"
      :forward="forward"
      @overflow="overflow"
      @confirm="confirm"
      @getChildrenDepart="getChildrenDepart"
      @searchDepartByName="searchDepartByName"
      @getDepartMember="getDepartMember"
      @getGroupMember="getGroupMember"
      @loadMoreMember="loadMoreMember"
      @beforeClose="handleBeforeClose"
      @cahngeTab="cahngeTab"
    >
    </check-members>
  </div>
</template>
<script>
import CheckMembers from "./index.js";

var isFirst = true;

import selectMembers from "./mixins/selectMember";
export default {
	components: {
		CheckMembers,
	},
	mixins: [selectMembers],

	data() {
		return {
      expandKeys: []
    };
	},
	computed: {},
	methods: {
    handleBeforeClose(done) {
      setTimeout(() => {
        done()
      }, 2000);
    }
  },
};
</script>