//index.js
const app = getApp()
import { decodeuuid, hextoascii } from '../../utils/index'

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  // 跳转到增加设备
  toAddDevice: function(e) {
    wx.navigateTo({
      url: '/pages/devicelist/devicelist?type=' + e.currentTarget.dataset.type,
    })
  }

})
