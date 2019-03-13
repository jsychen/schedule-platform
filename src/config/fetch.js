import {baseURL} from "./env";
import http from '../config/http';

const timeoutResponse = {
    "meta":
    {
        "code":-1,
        "message":"请求服务失败"
    }
};

function download (data) {
    if (!data) {
        return
    }
    let url = window.URL.createObjectURL(new Blob([data]))
    let link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', 'schedule.zip')
    document.body.appendChild(link)
    link.click()
}

export default async (url = '', data = {}, method = 'GET') => {
    method = method.toUpperCase();
    url = baseURL + url;

    if (method === 'GET') {
        let params = '';
        Object.keys(data).forEach(key => {
            params += key + '=' + data[key] + '&';
        });

        if (params !== '') {
            params = params.substr(0, params.lastIndexOf('&'));
            url = url + '?' + params;
        }
        if(url.indexOf('/schedule/scheduleinfo/export/img')> -1){
            return await http({
                method: 'get',
                url: url,
                responseType: 'blob'
            }).then(response => {
                download(response);
            }).catch((error) => {
            });
        }else{
            return await http.get(url)
            .then(response => response)
            .catch(function (err) {
                return timeoutResponse;
            });
        }
    }

    if (method === 'POST' || method === 'PUT') {
        return await http({
            method: method,
            url: url,
            data: data
        }).then(response => response)
            .catch(function (err) {
                return timeoutResponse;
            });
    }

    if (method === 'DELETE') {
        return await http.delete(url)
            .then(response => response)
            .catch(function (err) {
                return timeoutResponse;
            });
    }
}

