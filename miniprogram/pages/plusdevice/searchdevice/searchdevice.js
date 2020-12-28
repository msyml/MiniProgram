// miniprogram/pages/plusdevice/searchdevice/searchdevice.js
import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast';

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
    SafetyKeyNotifyValue: ['无'],//防劫持密钥通知数据
    UUIDWriteValue: "No Messege",//写数据缓存
    SafetyKeyValue: '000000',
    GPIOstate: '',


    ReadHex16: false,
    WriteHex16: false,

    LoadList: false,

    List: [],//服务列表
    ServicesList: [],//服务列表
    CharacteristicList: [],
    BufferNumB: 0,
    BufferNum: 0,

    FunctionItems: [
      { name: 'TTM', value: '透传', checked: true, disabled: true },
      { name: 'GPIO', value: 'GPIO', checked: false, disabled: false },
      { name: 'SafetyKey', value: '防劫持', checked: false, disabled: false },
    ],

    // 图片
    src: "../../../images/s.png",
    // switch 开关
    isAbleScan: false,
    // loading toast
    toast: "",
    // 连接状态
    connectStatus: 0,
    connectStatusList: {
      0: '未连接',
      1: '已连接'
    },
    // 显示激活界面
    showActive: false
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
    this.data.toast = Toast.loading({
      duration: 0, // 持续展示 toast
      forbidClick: true,
      message: '倒计时 3 秒',
      selector: '#custom-selector',
    });
    
    let second = 3;
    const timer = setInterval(() => {
      second--;
      if (second) {
        this.data.toast.setData({
          message: `倒计时 ${second} 秒`,
        });
      } else {
        clearInterval(timer);
        Toast.clear();
      }
    }, 1000);

    // 初次渲染
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log('初次渲染', res);
      },
    })
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
    var that = this;
    if (that.data.BLEconnect) {
      wx.closeBLEConnection({
        deviceId: that.data.DevicesID,
        success: function (res) {
          console.log('断开连接 success', res);
          that.setData({
            DevicesID: [],
            Name: [],
          })
        },
        fail: function (res) {
          console.log('断开连接 fail', res);
        }
      });
    }
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log("卸载蓝牙");
      },
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    if (that.data.BLEconnect) {
      wx.closeBLEConnection({
        deviceId: that.data.DevicesID,
        success: function (res) {
          console.log('断开连接 success', res);
          that.setData({
            DevicesID: [],
            Name: [],
          })
        },
        fail: function (res) {
          console.log('断开连接 fail', res);
        }
      });
    }
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log('停止搜索设备 success', res);
      },
    });
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

  // 扫描滤芯二维码
  scan: function () {
    const that = this
    wx.scanCode({
      onlyFromCamera: true,
      success: function (obj) {
        console.log('success', obj)
        // 显示激活按钮界面
        that.setData({
          showActive: true
        })
        // 获取二维码数据
        // 向设备发送激活指令
        // 调用激活接口
        // 激活完成 打开绑定信息
      },
      fail: function (obj) {
        console.log('fail', obj)
      }
    })
  },

 //控件函数**************************************************************************************************
  //以下为自定义点击事件
  /**
 * Switch 启动蓝牙模块，进行搜素
 */
AllSwitch: function (e) {
  var that = this;

  //触发coolsite360交互事件
  //app.coolsite360.fireEvent(e,this);
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
          //console.log(that.data.List);
        },
      });
    });
  }
  else {
    // console.log(e.detail.value);  //打印Switch状态  
    if (that.data.BLEconnect) {
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
          // 打开摄像头扫描二维码
          that.scan();
          // 连接蓝牙成功，打开摄像头扫描二维码
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
* Switch 开始监听设备TTM UUID Notify
* 待优化
*/
SwitchKeyNotify: function (res) {
  var that = this;
  //console.log('SwitchTTMNotify:', res.detail.value);  //打印Switch状态
  that.data.BLENotifyUse = res.detail.value;
  var SerID = {
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDReadServices,
    characteristicId: that.data.UUIDReadCharacteristic,
  };
  that.SetNotify(SerID, res.detail.value); //设置透传通知
},

/**
* Switch 开始监听设备GPIO UUID Notify
* 待优化   
*/
SwitchGPIOWriteHex: function (res) {
  var that = this;
  console.log('SwitchGPIOWriteHex:', res.detail.value);  //打印Switch状态
  that.data.GPIOWriteHexNotify = res.detail.value;
  var SerID = {
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDGPIOServices,
    characteristicId: that.data.UUIDGPIONotifyCharacteristic,
  };
  that.SetNotify(SerID, res.detail.value); //设置GPIO通知
},

/**
* 防劫持 使能功能
*/
SafetyKeySwitch: function (res) {
  var that = this;
  console.log('SafetyKeySwitch:', res.detail.value);  //打印Switch状态
  that.data.SafetyKeyNotify = res.detail.value;
  var SerID = {
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDSafetyKeyServices,
    characteristicId: that.data.UUIDSafetyKeyNotifyCharacteristic,
  };
  that.SetNotify(SerID, res.detail.value); //设置防劫持通知
},

/**
* Switch 16进制开关，开启将设置成16进制接收数据
* 
*/
SwitchReadHex16: function (res) {
  var that = this;
  if (res.detail.value) {
    that.setData({
      ReadHex16: true
    });
  }
  else {
    that.setData({
      ReadHex16: false
    });
  }
  console.log('SwitchReadHex16:', res.detail.value, that.data.ReadHex16);  //打印Switch状态
},

/**
* Switch 16进制开关，开启将设置成16进制发送数据
* 待优化
*/
SwitchWriteHex16: function (res) {
  var that = this;
  if (res.detail.value) {
    that.setData({
      WriteHex16: true
    });
    wx.showToast({
      title: '完善中!',
    })
  }
  else {
    that.setData({
      WriteHex16: false
    });
  }
  console.log('SwitchWriteHex16:', res.detail.value, that.data.ReadHex16);  //打印Switch状态
},

/**
 * button 发送数据按键
 */
TTMSendData: function () {
  var that = this;

  if (!that.data.BLECanUse) {
    wx.showToast({
      title: '服务获取功能未被打开!',
    })
  }
  else {

    //输入16进制字符，输出16进制字符的ASKII
    // var ASCII = that.data.UUIDWriteValue;
    console.log('SEND', that.data.UUIDWriteValue)
    var ASCII = 'qwer';
    var val = [];
    for (var i = 0; i < ASCII.length; i++) {
      if (val == "") {
        val = ASCII.charCodeAt(i).toString(16);
      }
      else {
        val += ASCII.charCodeAt(i).toString(16);
      }
    };

    //转化字符为16进制字符
    var hex = val;
    console.log(hex)
    // hex = 'AA 55 28 00 01 23 BD 34 39 31 66 64 63 31 31 31 37 64 65 34 31 64 34 61 36 66 32 32 36 31 35 35 36 37 31 65 30 64 34 8D'
    // hex = 'AA 55 28 00 01 23 BD 65 65 66 32 62 32 36 62 38 66 32 63 34 30 31 64 38 66 37 38 62 65 61 31 64 37 35 63 39 64 61 61 0C'
    // hex = 'AA 55 28 00 01 23 BD 34 39 31 66 64 63 31 31 31 37 64 65 34 31 64 34 61 36 66 32 32 36 31 35 35 36 37 31 65 30 64 34 8D'
    // hex = 'AA 20 01 65 65 66 32 62 32 36 62 38 66 32 63 34 30 31 64 38 66 37 38 62 65 61 31 64 37 35 63 39 64 61 61 15'
    hex = 'AA 20 01 65 65 66 32 62 32 36 62 38 66 32 63 34 30 31 64 38 66 37 38 62 65 61 31 64 37 35 63 39 64 61 61 15'
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }
    ));
    //console.log(typedArray)
    //console.log([0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37])
    var buffer = typedArray.buffer;
    console.log("buffer++", buffer)

    wx.writeBLECharacteristicValue({
      deviceId: that.data.DevicesID,
      serviceId: that.data.UUIDWriteServices,
      characteristicId: that.data.UUIDWriteCharacteristic,
      value: buffer,
      success: function (res) {
        console.log(res.errMsg)
      }
    });

  }
},

/**
* ButtonTest
* 测试用按键
* return string
*/
ButtonTest: function (e) {
  var that = this;
  console.log('ButtonTest:', e)
  //that.LoadALLCharacteristic(that.data.DevicesID,that.data.ServicesList.services);
  wx.openBluetoothAdapter({
    success: function (res) {
      console.log('openBluetoothAdapter', res);
    },
  })
},

/**
 * 透传 TTM输入数据框
 */
BindKeyInput: function (Data) {
  var that = this;
  //console.log(Data.detail.value);
  that.setData({
    UUIDWriteValue: Data.detail.value
  })
},

/**
* 防劫持 输入数据框
*/
SafetyKeyInput: function (Data) {
  var that = this;
  var Str = that.data.UUIDSafetyKeyValue;
  Str[1] = Data.detail.value;
  //console.log(Str);
  that.setData({
    UUIDSafetyKeyValue: Str
  })
},



/**
* 防劫持 发送按键功能
*/
SafetyKeySendData: function (res) {
  var that = this;
  var Value = that.data.UUIDSafetyKeyValue;
  var EN = false;
  //输入16进制字符，输出16进制字符的ASKII
  console.log(Value);

  if (that.data.SafetyKeyNotify) {

    //检测长度是否为6个字节
    if (Value[1].length != 6) {
      wx.showModal({
        title: '防劫持功能',
        content: '数据长度错误',
      })
      var TimeOut = 1; //超时时长 20*500ms=10s
    }
    else {
      //Value[1] = that.UUIDSafetyKeyValue;
      that.setData({
        UUIDSafetyKeyValue: Value,
      })
      EN = true;
      var TimeOut = 20; //超时时长 20*500ms=10s
    }

    //等待异步执行完成，再进行数据发送

    var ConnectTimeOut = setInterval(function () {

      if (EN) {
        clearInterval(ConnectTimeOut);//关闭循环
        var ASCII = Value[0] + Value[1];
        console.log(ASCII);
        var val = [];
        for (var i = 0; i < ASCII.length; i++) {
          if (val == "") {
            val = ASCII.charCodeAt(i).toString(16);
          }
          else {
            val += ASCII.charCodeAt(i).toString(16);
          }
        };
        //转化字符为16进制字符
        var hex = val;
        var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
          return parseInt(h, 16)
        }
        ));
        var buffer = typedArray.buffer;

        wx.writeBLECharacteristicValue({
          deviceId: that.data.DevicesID,
          serviceId: that.data.UUIDSafetyKeyServices,
          characteristicId: that.data.UUIDSafetyKeyCharacteristic,
          value: buffer,
          success: function (res) {
            console.log(res.errMsg)
          }
        });
      }

      if (TimeOut) {
        TimeOut--;
        console.log('TimeOut', TimeOut);
      }
      else {
        clearInterval(ConnectTimeOut);//关闭循环
        wx.showToast({
          title: '数据发送失败',
        })
      }
    }, 100);
  }
  else {
    wx.showModal({
      title: '防劫持功能',
      content: '防劫持功能未启用',
    })
  }

},

/**
* GPIOStatcheckboxChange
* GPIO 状态窗口事件
* return 0
*/
GPIOStatcheckboxChange: function (res) {
  var that = this;
  var itemValue = res.detail.value;
  var LList = that.data.GPIOitems;
  var Value = 0x00;
  for (var i = 0; i < 8; i++) { LList[i].Statchecked = false; LList[i].OutPutdisabled = true; }

  if (itemValue.length != 0) {
    for (var i = 0; i < itemValue.length; i++) {
      switch (itemValue[i]) {
        case "GPIO7":
          Value = Value | 0x80;
          LList[0].Statchecked = true;
          LList[0].OutPutdisabled = false;
          break;
        case "GPIO6":
          Value = Value | 0x40;
          LList[1].Statchecked = true;
          LList[1].OutPutdisabled = false;
          break;
        case "GPIO5":
          Value = Value | 0x20;
          LList[2].Statchecked = true;
          LList[2].OutPutdisabled = false;
          break;
        case "GPIO4":
          Value = Value | 0x10;
          LList[3].Statchecked = true;
          LList[3].OutPutdisabled = false;
          break;
        case "GPIO3":
          Value = Value | 0x08;
          LList[4].Statchecked = true;
          LList[4].OutPutdisabled = false;
          break;
        case "GPIO2":
          Value = Value | 0x04;
          LList[5].Statchecked = true;
          LList[5].OutPutdisabled = false;
          break;
        case "GPIO1":
          Value = Value | 0x02;
          LList[6].Statchecked = true;
          LList[6].OutPutdisabled = false;
          break;
        case "GPIO0":
          Value = Value | 0x01;
          LList[7].Statchecked = true;
          LList[7].OutPutdisabled = false;
          break;
        default:
          console.log('GPIOStatcheckboxChange', 'ERROR');
      }
    }
  };
  that.setData({
    GPIOitems: LList
  })
  var Value2 = [];
  Value2[0] = Value;
  var buffer = new Uint8Array(Value2).buffer;

  console.log('GPIOOutPutcheckboxChangef', Value, LList);

  wx.writeBLECharacteristicValue({
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDGPIOServices,
    characteristicId: that.data.UUIDGPIOStateCharacteristic,
    value: buffer,
    success: function (res) {
      console.log(res.errMsg)
    }
  });

},

/**
* GPIOOutPutcheckboxChange
* GPIO 输出状态事件
* return 0
*/
GPIOOutPutcheckboxChange: function (res) {
  var that = this;
  var itemValue = res.detail.value;
  var LList = that.data.GPIOitems;
  var Value = 0x00;
  for (var i = 0; i < 8; i++) { LList[i].OutPutchecked = false; }

  if (itemValue.length != 0) {
    for (var i = 0; i < itemValue.length; i++) {
      switch (itemValue[i]) {
        case "GPIO7":
          Value = Value | 0x80;
          LList[0].OutPutchecked = true;
          break;
        case "GPIO6":
          Value = Value | 0x40;
          LList[1].OutPutchecked = true;
          break;
        case "GPIO5":
          Value = Value | 0x20;
          LList[2].OutPutchecked = true;
          break;
        case "GPIO4":
          Value = Value | 0x10;
          LList[3].OutPutchecked = true;
          break;
        case "GPIO3":
          Value = Value | 0x08;
          LList[4].OutPutchecked = true;
          break;
        case "GPIO2":
          Value = Value | 0x04;
          LList[5].OutPutchecked = true;
          break;
        case "GPIO1":
          Value = Value | 0x02;
          LList[6].OutPutchecked = true;
          break;
        case "GPIO0":
          Value = Value | 0x01;
          LList[7].OutPutchecked = true;
          break;
        default:
          console.log('GPIOOutPutcheckboxChangef', 'ERROR');
      }
    }
  };
  that.setData({
    GPIOitems: LList
  })
  var Value2 = [];
  Value2[0] = Value;
  var buffer = new Uint8Array(Value2).buffer;

  console.log('GPIOOutPutcheckboxChangef', Value, LList);

  wx.writeBLECharacteristicValue({
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDGPIOServices,
    characteristicId: that.data.UUIDGPIOSetCharacteristic,
    value: buffer,
    success: function (res) {
      console.log(res.errMsg)
    }
  });
},


/**
* CheckboxSafetyKeyUse
* SafetyKey 选中
* return 0
*/
CheckboxSafetyKeyUse: function (res) {
  var that = this;
  var itemValue = res.detail.value;
  var LList = that.data.FunctionItems;
  for (var i = 0; i < LList.length; i++) {
    LList[i].checked = false;
    LList[i].disabled = false;
  }

  if (itemValue.length != 0) {
    for (var i = 0; i < itemValue.length; i++) {
      switch (itemValue[i]) {
        case "TTM":
          LList[0].checked = true;
          LList[0].disabled = true;
          break;
        case "GPIO":
          LList[1].checked = true;
          LList[1].disabled = true;
          break;
        case "SafetyKey":
          LList[2].checked = true;
          LList[2].disabled = true;
          break;
        default:
          console.log('CheckboxSafetyKeyUse', 'ERROR');
      }
    }
  };
  that.setData({
    FunctionItems: LList
  })
  //console.log('CheckboxSafetyKeyUse', itemValue,LList);
},

//Demo专有函数************************************************************************************************
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

/**
* setTTMServices
* 设置透传服务
* return 0
*/
setGPIOInit: function (e) {
},
//

/**
* setTTMServices
* 设置透传服务
* return 0
*/
setTTMInit: function (e) {
  var that = this;
},

setSafetyKeyInit: function (e) {
  var that = this;
  var ASCII = e;
  console.log('提交防劫持密钥', ASCII);
  var val = [];
  for (var i = 0; i < ASCII.length; i++) {
    if (val == "") {
      val = ASCII.charCodeAt(i).toString(16);
    }
    else {
      val += ASCII.charCodeAt(i).toString(16);
    }
  };
  //转化字符为16进制字符
  var hex = val;
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }
  ));
  var buffer = typedArray.buffer;

  //数据发送
  wx.writeBLECharacteristicValue({
    deviceId: that.data.DevicesID,
    serviceId: that.data.UUIDSafetyKeyServices,
    characteristicId: that.data.UUIDSafetyKeyCharacteristic,
    value: buffer,
    success: function (res) {
      console.log(res.errMsg)
    }
  });
},

/**
 * setTTMServices
 * 设置透传服务
 * return 0
 */
setTTMServices: function (e) {
  var that = this;
},

/**
 * setTTMServices
 * 设置透传服务
 * return 0
 */
setGPIOServices: function (e) {
},
//

/**
* GPIONotifyValueHand
* GPIO通知信息处理
* return 0
*/
GPIONotifyValueHand: function (res) {
  var that = this;
  let buffer = res.value;
  let dataView = new DataView(buffer);
  var Str = "";
  var GPIONotify = that.data.GPIOitems;
  for (var i = 0; i < dataView.byteLength; i++) {
    Str += dataView.getUint8(i).toString(2); //转为16进制字符串
  };
  Str = Str.toString();
  var N = 0;
  var GValue = [];
  for (var i = 2; i < 8; i++) {
    if (Str.substring(i, i + 1) == '1') {
      GPIONotify[i].InPutchecked = true;
    }
    else if (!Str.substring(i, i + 1) == '0') {
      GPIONotify[i].InPutchecked = false;
    }
    else {
      GPIONotify[i].InPutchecked = false;
    }
  }
  that.setData({
    GPIONotigyValue: Str,
    GPIOitems: GPIONotify
  })
  console.log('GPIONotifyValueHand', Str, GPIONotify);
},

/**
* TTMNotifyValueHand
* TTM通知信息处理
* return 0
*/
TTMNotifyValueHand: function (res) {
  var that = this;

  // let buffer = res.value;
  // console.log('111', buffer)
  // let dataView = new DataView(buffer);
  // console.log('222', dataView, dataView.byteLength)
  // var Str = "";
  // var Length = "0";
  // for (var i = 0; i < dataView.byteLength; i++) {
  //   if (that.data.ReadHex16) {
  //     console.log('CYCLE IF', i, dataView.getUint8(i), dataView.getUint8(i).toString(16))
  //     Str += dataView.getUint8(i).toString(16); //转为16进制字符串
  //   }
  //   else { 
  //     console.log('CYCLE ELSE', i, dataView.getUint8(i))
  //     Str += String.fromCharCode(dataView.getUint8(i)); 
  //   }
  //   Length++;
  // };
  // console.log('333', Length)

  // console.log('TTMNotifyValueHand:', Str);
  console.log('xxxxxxxxxxxx', res.value)
  let buffer = res.value;
  let dataView = new DataView(buffer);
  // ================
  var hex = 'AA 55 18 00 02 24 23 00 00 9C 40 32 30 32 30 30 38 30 31 30 39 31 30 0F'
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }
  ));
  var buffer1 = typedArray.buffer;
  wx.writeBLECharacteristicValue({
      deviceId: that.data.DevicesID,
      serviceId: that.data.UUIDWriteServices,
      characteristicId: that.data.UUIDWriteCharacteristic,
      value: buffer1,
      success: function (res) {
        console.log(res.errMsg)
      }
    });
  // ================
  var Str = "";
  var Length = "0";
  console.log('HEX16', that.data.ReadHex16)
  for (var i = 0; i < dataView.byteLength; i++) {
    if (that.data.ReadHex16) {
      console.log(
      dataView.getUint8(i), dataView.getUint8(i).toString(16))
      Str += dataView.getUint8(i).toString(16); //转为16进制字符串
    }
    else { 
      console.log(dataView.getUint8(i), String.fromCharCode(dataView.getUint8(i)))
      Str += String.fromCharCode(dataView.getUint8(i)); 
    }
    Length++;
  };

  console.log('TTMNotifyValueHand:', Str);
  
  that.setData({
    UUIDNotifyValue: Str,
    BufferNumB: that.data.BufferNumB + 1,
    BufferNum: that.data.BufferNum + Length
  })
},

/**
* SafetyKeyValueHand
* 防劫持通知信息处理
* return 0
*/
SafetyKeyValueHand: function (res) {
  var that = this;
  var Value = that.data.UUIDSafetyKeyValue;

  let buffer = res.value;
  let dataView = new DataView(buffer);
  var Str = "";
  for (var i = 0; i < dataView.byteLength; i++) {
    Str += dataView.getUint8(i);
  };
  //Str = Str.toString(16);

  switch (Str) {
    case '0':
      var T = "提交密码成功";
      break;
    case '1':
      var T = "提交密码错误";
      break;
    case '2':
      var T = "密码修改成功";
      Value[0] = Value[1];
      Value[2] = true;
      break;
    case '3':
      var T = "取消密码成功";
      Value[0] = Value[1];
      Value[2] = false;
      break;
    default:
      var T = "未知错误";
  }
  if (T) {
    wx.showToast({
      title: T,
    })
  }

  if (Value[1] == '000000') {
    Value[2] = false;
  }

  Value[3] = that.data.DevicesID;
  wx.setStorageSync('SafetyKey', Value);
  console.log('SafetyKeyValueHand:', Str, Value);
  that.setData({
    UUIDSafetyKeyValue: Value,
    SafetyKeyNotifyValue: Str
  })
},


//
//运算函数**********************************************************************************************
/**
 * arrayBufferToASCII
 * 将arrayBuffer换成对应的ASCII码
 * return string
 */
ArrayToASCII: function (e) {
  var that = this;
  //console.log('接收到通知数据:', res);
  let buffer = e;
  let dataV = new DataView(buffer);
  var Str = "";

  for (var i = 0; i < dataV.byteLength; i++) {
    if (that.data.ReadHex16) {
      Str += dataV.getUint8(i).toString(16); //转为16进制字符串
    }
    else { Str += String.fromCharCode(dataV.getUint8(i)); }
    //Str += dataView.getUint8(i).toString(16); //转为16进制字符串
  };

  //等待结果返回
  var ReValue = '';
  var TimeOut = 10;
  var ConnectTimeOut = setInterval(function () {
    if (Str != "") {
      ReValue = Str;
      clearInterval(ConnectTimeOut);//跳出循环
      return ReValue;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
      console.log('ArrayToASCII ERROR');
    }
    if (TimeOut) {
      i--;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
      return false;
    }
  }, 100);
},

/**
 * ASCIIto16ASCII
 * 将ASCII码转换成对应的ASCII码16进制
 * return string
 */
ASCIIto16ASCII: function (e) {
  // 将字符框的ASCII内容转化成16进制的ASCII码
  var ASCII = e;
  var val = [];
  for (var i = 0; i < ASCII.length; i++) {
    if (val == "") {
      val = ASCII.charCodeAt(i).toString(16);
    }
    else {
      val += ASCII.charCodeAt(i).toString(16);
    }
  }
  //console.log('val', val);
  //等待结果返回
  var ReValue = '';
  var TimeOut = 10;
  var ConnectTimeOut = setInterval(function () {
    if (val != []) {
      ReValue = val;
      clearInterval(ConnectTimeOut);//跳出循环
      return ReValue;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
      console.log('ASCIIto16ASCII ERROR');
    }
    if (TimeOut) {
      i--;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
    }
  }, 10);
},

/**
 * ASCII16toArray
 * 将16进制ASCII码转换成对应的array数组数据
 * return string
 */
ASCII16toarrayBuffer: function (e) {
  //转化16进制字符为arrayBuffer组
  var hex = e
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))
  var buffer = typedArray.buffer
  //console.log("buffer1", buffer1)

  //等待结果返回
  var ReValue = '';
  var TimeOut = 10;
  var ConnectTimeOut = setInterval(function () {
    if (buffer != []) {
      ReValue = buffer;
      clearInterval(ConnectTimeOut);//跳出循环
      return ReValue;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
      console.log('ASCII16toarrayBuffer ERROR');
    }
    if (TimeOut) {
      i--;
    }
    else {
      clearInterval(ConnectTimeOut);//跳出循环
    }
  }, 10);
},

//调用函数********************************************************************************************
/**
* LoadALLCharacteristic
* 一次性获取列表内服务的特征值
* return 0
*/
LoadALLCharacteristic: function (devicesID, SList) {
  var that = this;
  //console.log('LoadALLCharacteristic', SList);      
  var TimeNum = 0;
  var Run = true;
  var LoadOutTime = setInterval(function () {
    if (Run) {
      Run = false;
      wx.getBLEDeviceCharacteristics({
        deviceId: devicesID,
        serviceId: SList[TimeNum],
        success: function (res) {
          Run = true;
          if (res.characteristics.length > 0) {
            TimeNum++;
            that.setData({
              CharacteristicList: that.data.CharacteristicList.concat(res.characteristics)
            });
          }
          else {
            console.log("未能获取服务！正在尝试重新获取")
          }
          if (TimeNum >= SList.length) {
            that.setData({
              LoadList: true
            });
            clearInterval(LoadOutTime);
          }
        },
      })
    }
    else {
    }
  }, 100)
},

/**ReServices:
* 输入16位服务服务，返回对应的特征值;
*  BLEconnect 必须为true;
* 输入变量:
* DevicesID设备ID，ServicesUUID 128位UUID，Characteristic16bit 16位UUID
* 输出变量:     
* 1.false
* 2.Characteristic128bit
* BLEconnect 标志位
 */
ReServices: function (DevicesID, ServicesUUID, Characteristic16bit) {
  var that = this;
  var Characteristic128bit = '';
  if (that.data.BLEconnect) {
    wx.getBLEDeviceCharacteristics({
      deviceId: DevicesID,
      serviceId: ServicesUUID,
      success: function (res) {
        Characteristic128bit = that.LoadServices(Characteristic16bit, res.characteristics);
        //console.log('ReServices1', Characteristic16bit,Characteristic128bit);
      },
    })
  }
  else {
    wx.showToast({
      title: '设备未连接!',
    })
    Characteristic128bit = false;
    console.log('ReServices', false);
  }
  setTimeout(function () {
    if (Characteristic128bit != '') {
      console.log('ReServices:', Characteristic16bit, Characteristic128bit);
      return Characteristic128bit;
    }
    else {
      wx.showToast({
        title: '读取特征值出错!',
      })
      return false;
    }
  }, 100)
},//RequestServices

/**
* LoadServices
* 对比获取服务  部分设备获取的大小写不同
* return 128位服务
*/
LoadServices: function (UUID, SList) {
  var a = '';
  var LServices = '';
  var BUUID = UUID.toLocaleLowerCase(); //小写
  var LUUID = UUID.toLocaleUpperCase();//大写   
  for (var i = 0; i < SList.length; i++) {
    a = SList[i].uuid;
    a = a.substring(4, 8);
    //筛选128位的服务
    if ((a == BUUID) | (a == LUUID)) {
      LServices = SList[i].uuid
    };
  };//for
  console.log('LoadServices', LServices);
  return LServices;
},

//通知设置
/**
* SetNotify
＊通知设置
* 待优化
＊    var ServicesID ={
      deviceId: ‘’,
      serviceId: ‘’,
      characteristicId: ‘’,
    };
*/
SetNotify: function (ServicesID, stat) {
  var that = this;
  var Sure = false;
  console.log('SetNotify:', ServicesID, stat);

  wx.notifyBLECharacteristicValueChange({
    deviceId: ServicesID.deviceId,
    serviceId: ServicesID.serviceId,
    characteristicId: ServicesID.characteristicId,
    state: stat,// 启动通知
    success: function (res) {
      console.log('启动读取数据通知：', res);
      Sure = true;
    },
    fail: function (res) {
      console.log('启动读取数据通知 fail:', res);
    }
  })

  if (stat) {
    wx.showToast({
      title: '通知功能打开!',
    })
  }
  else {
    wx.showToast({
      title: '通知功能关闭!',
    })
  }
},
})