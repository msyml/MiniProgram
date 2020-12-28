// const CryptoJS = require('../node_modules/crypto-js/index.js');  //引用AES源码js

import CryptoJS from '../miniprogram_npm/crypto-js/index'

const key = CryptoJS.enc.Utf8.parse("abcd1234!@#$abcd");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   //十六位十六进制数作为密钥偏移量

// 解密二维码uuid，返回id
function Decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { /*iv: iv, */mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    // Array.prototype.map.call(new Uint8Array(hextoascii.toHex(a)), x => ('00' + x.toString(16)).slice(-2)).join('')
    return decryptedStr.toString();
}

// console.log(Decrypt('AF90BB6F1588F645C843D0731355B8662205A4FDF342DDEA5E21CF7CCD1A0F9EA4B0AEC5B68E801646235DC26E674E63'))

module.exports = Decrypt
