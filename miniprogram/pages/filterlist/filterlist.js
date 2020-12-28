// miniprogram/pages/filterlist/filterlist.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "../../images/s.png",
    devideType: [
      {name: 'PCB复合滤芯', value: 1},
      {name: 'RO反渗透膜滤芯', value: 2}
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  confirm(e) {
    const index = +e.currentTarget.dataset.type
    Dialog.confirm({
      title: '提示',
      message: '是否确定激活' + this.data.devideType[index].name,
    })
      .then(() => {
        // scan
        this.scan()
      })
      .catch(() => {
        // on cancel
      });
  },

  // 扫码
  scan: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success: function (obj) {
        console.log('success', obj)
        Toast.loading({
          message: '滤芯激活中，请耐心等待',
          forbidClick: false,
          mask: true,
        });
        // Toast.success('滤芯激活成功');
      },
      fail: function (obj) {
        console.log('fail', obj)
      }
    })
  },
})