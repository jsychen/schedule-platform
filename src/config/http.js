import axios from 'axios';
import store from 'storejs';
import router from '../router/index.js'
import {Alert} from 'iview';

/* axios全局设置 */
const http = axios.create({
    timeout: 30000,
    responseType: "json",
    withCredentials: false,
    headers: {
        "Content-Type": "application/json;charset=UTF-8",

    }
});

let IDENTIFICATION = 'schedule_identify';

/* request拦截器 */
http.interceptors.request.use(
    config => {
      if (store.has(IDENTIFICATION)) {
        // 若token存在则添加request header
        let identify = store.get(IDENTIFICATION);
        config.headers.Authorization = identify;
      }

      return config;
    },
    error => {
        // TODO
        return Promise.reject(error.data.error.message);
    }
  );

/* response拦截器 */
http.interceptors.response.use(
    response => {
      return response.data;
    },
    error => {
        if (!store.has(IDENTIFICATION)) {
            router.push({
                path: "/"
            });
        }else{
            if (error.response.status === 401) {
                router.push({
                    path: '/'
                });
            }
        }
        let errorInfo =  error.data.error ? error.data.error.message : error.data;
        return Promise.reject(errorInfo);
    }
  );

export default http;