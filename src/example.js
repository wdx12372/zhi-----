// 假设原来使用 base64url
// const base64url = require('base64url');

function encodeData(data) {
    return Buffer.from(data).toString('base64');  // 使用 Buffer 进行编码
}

function decodeData(encodedData) {
    return Buffer.from(encodedData, 'base64').toString('utf-8');  // 使用 Buffer 进行解码
} 