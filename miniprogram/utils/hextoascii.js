// 解密二维码id，生成arraybuffer
function toHex(str) {
    var ASCII = str;
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
    // var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    //     return parseInt(h, 16)
    // }
    // ));
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi));
    var buffer = typedArray.buffer;
    console.log(typedArray, buffer)
    return buffer
}

// arraybuffer转为string
function toStr(buffer, readHex16) {
    var dataView = new DataView(buffer);
    var Str = "";
    var Length = "0";
    for (var i = 0; i < dataView.byteLength; i++) {
        if (readHex16) {
            Str += dataView.getUint8(i).toString(16); //转为16进制字符串
        }
        else {
            Str += String.fromCharCode(dataView.getUint8(i));
        }
        Length++;
    };
    return Str;
}

module.exports = {
    toHex,
    toStr
}
