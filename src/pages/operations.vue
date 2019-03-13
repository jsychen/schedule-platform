<template>
    <div class="container">
        <!-- 操作记录 -->
        <div class="content-header">
            <span>手机号：</span>
            <Input v-model="phoneNumber" placeholder="请输入手机号" clearable style="width: 200px"/>
            <span>选择日期：</span>
            <DatePicker v-model="date" placeholder="请选择日期" style="width: 200px" clearable></DatePicker>
            <button class="btnDefault bgBlue" type="button" @click="getOperations">查询</button>
        </div>
        <div class="panel-body">
            <Table border :columns="columns" :data="data"></Table>
            <Page :total="dataCount" :current.sync='currentPage' :page-size="pageSize" show-total class="paging" @on-change="changePage"></Page>
        </div>
    </div>
</template>
<script>
import {getOperations} from '@/api/commonAPI';
export default {
    data: function () {
        return {
            dataCount: 0,
            currentPage: 1,
            historyUserList: [],
            // 每页显示记录条数
            pageSize:10,
            // 获取数据
            hostoryData:[],
            phoneNumber: '',
            date: null,
            columns: [
                {
                    title: '操作人',
                    key: 'operatorName'
                },
                {
                    title: '操作时间',
                    key: 'createDate',
                    render: (h, params) => {
                        let date = new Date(params.row.createDate);
                        let dateStr = this.conversion(date);
                        return h('span', dateStr);
                    }
                },
                {
                    title: '操作内容',
                    key: 'operationName'
                }
            ],
            data: []
        }
    },
    mounted: function(){
        this.getOperations();
    },
    methods: {
        //  分页
        changePage: function(index){
            let start = ( index - 1 ) * this.pageSize;
            let end = index * this.pageSize;
            this.data = this.hostoryData.slice(start,end);
        },
        //  查询
        getOperations: async function () {
            let data = {};
            let phoneNumber = this.phoneNumber;
            phoneNumber && (data.phoneNumber = phoneNumber);

            let date = this.date;
            date && (data.dateStr = this.$conversion(date));
            
            let response = await getOperations(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                // 获取分页
                this.hostoryData = response.data;
                this.dataCount = response.data.length;
                this.currentPage = 1;
                if(this.hostoryData.length < this.pageSize){
                    this.data = this.hostoryData;
                }else{
                    this.data = this.hostoryData.slice(0,this.pageSize);
                }
                return;
            }
            this.$Message.error(message);
        },
        // 时间戳转日期
        conversion: function (date) {
            let unixTimestamp = new Date(date);
            let year = unixTimestamp.getFullYear();
            let month = unixTimestamp.getMonth() + 1;
            let day = unixTimestamp.getDate();
            let hours = unixTimestamp.getHours();
            let minutes = unixTimestamp.getMinutes();
            let seconds = unixTimestamp.getSeconds();

            let mm = month < 10 ? '0' + month : month + '';
            let dd = day < 10 ? '0' + day : day + '';
            let hh = hours<10 ? '0' + hours : hours + '';
            let mi = minutes<10 ? '0' + minutes : minutes + '';
            let ss = seconds<10 ? '0' + seconds : seconds + '';

            let commonTime = year + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;
            return commonTime;
        }
    }
}
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>

