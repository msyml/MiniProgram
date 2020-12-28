// miniprogram/pages/ble/ble.js
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
    ],

    // switch 开关
    isAbleScan: false,
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

  /**
 * View 搜索设备列表,点击获取列表信息按键
 */
  DevicesChoose: function (e) {
    var that = this;
    //console.log("选择", e);
    //console.log(e);
    that.setData({
      DevicesID: e.currentTarget.dataset.deviceid,
      Name: e.currentTarget.dataset.name
    });
    console.log(that.data.DevicesID, that.data.Name);
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log('蓝牙状态', res);
        //if(res.discovering){
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log('停止搜索设备', res);
            //console.log(that.data.ScanView);
          },
        })
        that.setData({
          ScanView: false //关闭搜索界面  
        });
        wx.showToast({
          title: '连接中！',
        });
      },
    });
    //console.log('ScanView:', that.data.ScanView);

    wx.createBLEConnection({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.DevicesID,
      success: function (res) {
        console.log('createBLEConnection success:', res)
        wx.showToast({
          title: '加载服务中！',
        });
        that.BLEServicesInit();  //确认已连接，进行服务初始化加载

      },
      fail: function (res) {
        console.log('createBLEConnection fail:', res)
        that.setData({
          BLESCAN: false
        });
      }
    });
  },//DevicesChoose

  /**
  * Switch 启动蓝牙模块，进行搜素
  */
  AllSwitch: function (e) {
    var that = this;

    //触发coolsite360交互事件
    that.setData({
      BLESCAN: e.detail.value,
      ScanView: e.detail.value,
    });
    //console.log('AllSwitch:',that.data.BLESCAN);

    if (that.data.BLESCAN) {
      //启动蓝牙模块
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log('启动蓝牙设备', res);
          wx.getBluetoothAdapterState({
            success: function (res) {
              console.log("getBluetoothAdapterState:", res);
              wx.startBluetoothDevicesDiscovery({
                services: that.data.ServicesID, //设置筛选的设备UUID
                allowDuplicatesKey: true,      //是否重复上传
                success: function (res) {
                  console.log('开始搜索', res);
                },
              })
            }
          });
        },
        fail: function (res) {
          console.log('启动失败', res);
          if (res.errMsg != 'openBluetoothAdapter:fail - already opened') {
            wx.showToast({
              title: '故障,启动失败',
            })
          }
        }
      });

      //每次找到新设备都会触发，将找到的信息放入列表
      wx.onBluetoothDeviceFound(function (res) {
        //console.log('搜索到新蓝牙设备', res);
        wx.getBluetoothDevices({
          success: function (res) {
            //console.log('刷新整个列表',res);
            //console.log(res);
            that.setData({
              List: res.devices
            });
            console.log(that.data.List, '================');
          },
        });
      });
    }
    else {
      // console.log(e.detail.value);  //打印Switch状态  
      if (e.detail.value) {
        wx.closeBLEConnection({
          deviceId: that.data.DevicesID,
          success: function (res) {
            console.log('断开连接 success', that.data.DevicesID, res);
            that.setData({
              DevicesID: [],
              Name: [],
            })
          },
          fail: function (res) {
            console.log('断开连接 fail', res);
          }
        });
      };
      //初始化标志位
      that.setData({
        ScanView: false,
        BLEconnect: false,
        BufferNumB: 0,
        BufferNum: 0,
        BLECanUse: false,
        BLENotifyUse: false,
        ReadHex16: false,
        WriteHex16: false,
        GPIOWriteHexNotify: false,  //GPIO通知功能打开
      });
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log('停止搜索设备 success', res);
        },
      });
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log("卸载蓝牙");
        },
      })
    }
  },//ALLSwitch

    BLEServicesInit: function () {
    var that = this;
    //获取服务
    var TimeOut = 10; //超时时长 20*500ms=10s
    var ConnectTimeOut = setInterval(function () {
      wx.getBLEDeviceServices({  //测试服务是否已经下载完
        deviceId: that.data.DevicesID,
        success: function (res) {//console.log('ConnectTimeOut', ConnectTimeOut);
          clearInterval(ConnectTimeOut);//跳出循环
          that.setData({
            BLEconnect: true,
            ServicesList: res,
            LoadList: false
          });
          console.log('BLEconnect', true, that.data.ServicesList);
        },
      });
      if (TimeOut) {
        TimeOut--;
        console.log('TimeOut', TimeOut);
      }
      else {
        clearInterval(ConnectTimeOut);//关闭循环
        wx.showToast({
          title: '服务获取失败',
        })
      }
    }, 500);

    //获取特征值
    var TimeOut2 = 15;
    var haveServices = false;
    var ConnectTimeOut2 = setInterval(function () {
      if (that.data.BLEconnect & haveServices != true) {
        var LList = [];
        for (var i = 0; i < that.data.NeedUseService.length; i++) {
          LList[i] = that.LoadServices(that.data.NeedUseService[i], that.data.ServicesList.services);
        }
        that.setData({
          UUIDReadServices: LList[0],
          UUIDWriteServices: LList[1],
          UUIDGPIOServices: LList[2],
          UUIDSafetyKeyServices: LList[3],
        })
        haveServices = true;
        that.LoadALLCharacteristic(that.data.DevicesID, LList);
      }
      if (haveServices & that.data.CharacteristicList != '' & that.data.LoadList) {
        that.setData({
          UUIDReadCharacteristic: that.LoadServices(that.data.ReadServices[1], that.data.CharacteristicList),//读数据特征值
          UUIDWriteCharacteristic: that.LoadServices(that.data.WriteServices[1], that.data.CharacteristicList),//发数据特征值
          UUIDGPIOSetCharacteristic: that.LoadServices(that.data.GPIOServices[2], that.data.CharacteristicList),//GPIO设置
          UUIDGPIONotifyCharacteristic: that.LoadServices(that.data.GPIOServices[3], that.data.CharacteristicList),//GPIO输入状态通知
          UUIDGPIOStateCharacteristic: that.LoadServices(that.data.GPIOServices[1], that.data.CharacteristicList),//GPIO输出状态设置
          UUIDSafetyKeyCharacteristic: that.LoadServices(that.data.SafetyKeyServices[1], that.data.CharacteristicList),//GPIO输出设置
          UUIDSafetyKeyNotifyCharacteristic: that.LoadServices(that.data.SafetyKeyServices[2], that.data.CharacteristicList),//GPIO输入状态通知  
          BLECanUse: true
        })

        if (that.data.FunctionItems[2].checked) {
          that.setSafetyKeyInit(that.data.UUIDSafetyKeyValue[0] + that.data.UUIDSafetyKeyValue[0]);
        }
        clearInterval(ConnectTimeOut2);//跳出循环
      }
      if (TimeOut2) {
        TimeOut2--;
        console.log('TimeOut2', TimeOut2);
      }
      else {
        clearInterval(ConnectTimeOut2);//跳出循环
        console.log('DevicesChoose ERROR');
      }
    }, 500);
  },
})