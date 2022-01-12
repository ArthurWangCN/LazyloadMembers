/*jshint esversion: 6*/
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import enLocale from 'element-ui/lib/locale/lang/en';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN';
import zh from './i18nZh';
import en from './i18nEn';
import ElementLocale from 'element-ui/lib/locale';
Vue.use(VueI18n);
var enObj=Object.assign(en, enLocale);
var zhObj=Object.assign(zh, zhLocale);
const messages = {
    en:enObj,
    zh:zhObj
};
const i18n = new VueI18n({
    messages, 
});
ElementLocale.i18n((key, value) => i18n.t(key, value));
i18n.locale = navigator.language || 'zh-cn';
export default i18n;