// miniprogram/pages/active/active.js
import { decodeuuid, hextoascii } from '../../utils/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //canvas数据
    DevicesID: ['No Devices'],//MAC地址，苹果设备获取的MCA地址为随机地址
    Name: 'No Name',//设备名称
    edition: 'V1.2.23 微信版本需求4.5.15',
    ScanView: false,//服务界面 指示
    BLESCAN: false,//设备搜索 指示
    BLEconnect: false,//设备连接 指示
    BLECanUse: false,//只有成功获取服务才能使用通知和发送数据
    BLENotifyUse: false,//蓝牙透传通知使能
    GPIOWriteHexNotify: false,  //GPIO通知功能打开
    SafetyKeyNotify: false,  //GPIO通知功能打开    

    ServicesID: [],//筛选设备UUID
    ReadServices: ['ffe0', 'ffe4'], //透传读服务
    WriteServices: ['ffe5', 'ffe9'], //透传写服务
    GPIOServices: ['fff0', 'fff1', 'fff2', 'fff3'],  //GPIO服务
    SafetyKeyServices: ['ffc0', 'ffc1', 'ffc2'], //防劫持密钥功能
    NeedUseService: ['ffe0', 'ffe5'],//需要用到的服务，用在初始化服务，必须填入

    UUIDReadServices: '',//读数据服务
    UUIDReadCharacteristic: '',//读数据特征值
    UUIDWriteServices: '',//发数据服务
    UUIDWriteCharacteristic: '',//发数据特征值

    UUIDGPIOServices: '', //GPIO服务
    UUIDGPIOSetCharacteristic: '',//GPIO输出设置
    UUIDGPIONotifyCharacteristic: '',//GPIO输入状态通知
    UUIDGPIOStateCharacteristic: '',//GPIO输出状态设置

    UUIDSafetyKeyServices: '', //防劫持服务
    UUIDSafetyKeyCharacteristic: '',//防劫持输出设置
    UUIDSafetyKeyNotifyCharacteristic: '',//防劫持输入状态通知   

    UUIDSafetyKeyValue: ['000000', '000000', true, ''],//防劫持密钥发送值

    UUIDNotifyValue: [],//读到的通知数据
    ECigaretteValue: [],//电子烟数据
    GPIONotigyValue: [],//GPIO通知数据
    SafetyKeyNotifyValue: ['无'],//防劫持密钥通知数据
    UUIDWriteValue: "No Messege",//写数据缓存
    SafetyKeyValue: '000000',
    GPIOstate: '',
    GPIOWriteValue: [],


    ReadHex16: false,
    WriteHex16: false,

    LoadList: false,

    List: [],//服务列表
    ServicesList: [],//服务列表
    CharacteristicList: [],
    BufferNumB: 0,
    BufferNum: 0,

    //GPIO按键键位值
    GPIOitems: [
      { name: 'GPIO7', value: 'IO7', InPutchecked: false, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO6', value: 'IO6', InPutchecked: false, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO5', value: 'IO5', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO4', value: 'IO4', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO3', value: 'IO3', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO2', value: 'IO2', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO1', value: 'IO1', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
      { name: 'GPIO0', value: 'IO0', InPutchecked: true, InPutdisabled: true, Statchecked: false, Statdisabled: false, OutPutchecked: false, OutPutdisabled: true },
    ],

    FunctionItems: [
      { name: 'TTM', value: '透传', checked: true, disabled: true },
      { name: 'GPIO', value: 'GPIO', checked: false, disabled: false },
      { name: 'SafetyKey', value: '防劫持', checked: false, disabled: false },
    ]
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

  // 扫描
  doScan: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success: function (obj) {
        const uuid = obj.result.split('uuid=')[1]
        const id = decodeuuid(uuid)
        const hex = hextoascii.toHex(id)
        console.log('success', uuid)
        console.log(id)
        console.log(hex)
        this.TTMSendData(hex)
      },
      fail: function (obj) {
        console.log('fail', obj)
      }
    })
  },

  /**
   * button 发送数据按键
   */
  TTMSendData: function (buffer) {
    if (!this.data.BLECanUse) {
      wx.showToast({
        title: '服务获取功能未被打开!',
      })
    }
    else {
      wx.writeBLECharacteristicValue({
        deviceId: this.data.DevicesID,
        serviceId: this.data.UUIDWriteServices,
        characteristicId: this.data.UUIDWriteCharacteristic,
        value: buffer,
        success: function (res) {
          console.log(res.errMsg)
        }
      });

    }
  },
})