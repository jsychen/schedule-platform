
/**
 * 配置开发环境和测试、生产环境之间的接口配置
 *
 * baseURL: 接口地址
 * routerMode: 路由模式
 */
let baseURL = '';

let routerMode = 'history';

if (process.env.NODE_ENV === 'development') {
    // baseURL = 'http://118.24.12.191/api';
    // baseURL = 'http://localhost:8765';
    baseURL = 'http://192.168.2.175:8765';
} else {
    baseURL = 'http://118.24.12.191/api';
}

export { baseURL, routerMode, baseImageURL }
