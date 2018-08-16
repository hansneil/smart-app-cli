/**
 * @file index.js
 * @author {{author}} <{{email}}>
 */

/* eslint-disable babel/new-cap */
Page({
/* eslint-enable babel/new-cap */
    data: {
        logo: '/images/logo.png',
        slogan: '智者见智'
    },

    /**
     * onShareAppMessage 分享信息
     *
     * @return {Object} 分享信息
     */
    onShareAppMessage() {
        return {
            title: '{{appName}}',
            content: '世界很复杂，百度更懂你'
        };
    }
});
