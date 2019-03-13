<template>
    <div class="container">
        <div class="content-header">
            <span>年份：</span>
            <DatePicker v-model="year" type="year" placeholder="请选择年份" clearable></DatePicker>
            <span>站区：</span>
            <Select v-model="districtId" clearable>
                <Option v-for="item in districtList" :value="item.id" :key="item.id">{{ item.districtName }}</Option>
            </Select>
            <span>身份证号：</span>
            <i-input placeholder="请输入身份证号" v-model.trim="idCardNo" clearable></i-input>
            <button class="btnDefault bgBlue" type="button" @click="getHoliday">查询</button>
            <button class="btnDefault bgBlue" type="button" @click="updateModal = true">新增</button>
            <button class="btnDefault bgGreen" type="button" @click="holidayModal = true">导入年假</button>
        </div>
        <div class="panel-body">
            <Table border :columns="columns" :data="data"></Table>
            <Page :total="dataCount" :current.sync='currentPage' :page-size="pageSize" show-total class="paging" @on-change="changePage"></Page>
        </div>
        <!--导入年假-->
        <Modal
            v-model="holidayModal"
            title="导入年假"
            @on-ok="importHoliday"
            @on-cancel="cancel"
            :loading="true">
            <Form :label-width="80" id="form">
                <FormItem label="选择文件：" id="selectFile">
                    <button type="button" class="btnDefault">选择文件</button>
                    <input type="file" id="holidayFile" name="file" @change="selectFile">
                    <span>{{fileName}}</span>
                </FormItem>
            </Form>
        </Modal>
        <!-- 设置年假 -->
        <Modal title="设置年假"
            v-model="updateModal"
            :loading="true"
            @on-ok="handleUpdate('updateValidate')"
            @on-cancel="handleCancel">
            <Form ref="updateValidate" :model="updateValidate" :rules="rule" :label-width="80">
                <FormItem label="年份" prop="yearStr"> 
                    <DatePicker v-model="updateValidate.yearStr" type="year" placeholder="请选择年份" clearable></DatePicker>
                </FormItem>
                <FormItem label="身份证号" prop="userIdCard">
                    <Input v-model.trim="updateValidate.userIdCard" clearable/>
                </FormItem>
                <FormItem label="员工编码" prop="userCode">
                    <Input v-model.trim="updateValidate.userCode" clearable/>
                </FormItem>
                <FormItem label="年假额度" prop="yearlyLimit">
                    <Input v-model="updateValidate.yearlyLimit" @on-blur="blur"/>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import {getDistricts, getHoliday, importHoliday, updateHoliday} from '@/api/commonAPI';
export default {
    data: function () {
        return {
            dataCount: 0,
            currentPage: 1,
            historyUserList: [],
            // 每页显示记录条数
            pageSize: 10,
            // 获取数据
            hostoryData:[],
            year: new Date(),
            lineNumber: '',
            columns: [
                {
                    title: '姓名',
                    key: 'userName'
                },
                {
                    title: '年份',
                    key: 'yearStr'
                },
                {
                    title: '身份证号',
                    key: 'userIdCard'
                },
                {
                    title: '站区',
                    key: 'districtName'
                },
                {
                    title: '年假额度',
                    key: 'yearlyLimit'
                },
                {
                    title: '操作',
                    align: 'center',
                    key: 'action',
                    render: (h, params) => {
                        return h('div', [
                            h('a', {
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        let data = params.row;
                                        let item = this.updateValidate;
                                        for(let key in item){
                                            item[key] = data[key];
                                        }
                                        this.updateModal = true;
                                        this.index = params.index;
                                    }
                                }
                            }, '编辑'),
                        ]);
                    }
                }
            ],
            data: [],
            districtList: [],
            districtId: null,
            lineNumbers: ['2号线', '8号线', '10号线', '13号线', '新线'],
            holidayModal: false,
            fileName: '',
            idCardNo: '',
            updateModal: false,
            updateValidate: {
                userId: null,
                userIdCard: '',
                userCode: '',
                yearStr: '',
                yearlyLimit: null
            },
            rule: {
                yearStr: {type: 'date', required: true, message: '年份不能为空', trigger: 'change' },
                yearlyLimit: {type: 'number', required: true, message: '年假额度不能为空', trigger: 'blur' },
            },
            index: -1,
        }
    },
    mounted: function () {
        this.getDistricts();
        this.getHoliday();
    },
    methods: {
        blur: function () {
            this.updateValidate.yearlyLimit = parseInt(this.updateValidate.yearlyLimit) || 0;
        },
        //  获取站区
        getDistricts: async function () {
            let response = await getDistricts();
            if(response.meta.code === 0){
                this.districtList = response.data;
                return;
            }
            this.$Message.error(response.meta.message);
        },
        //  查询
        getHoliday: async function () {
            if(!this.year){
                this.$Message.warning('请选择年份');
                return;
            }
            let year = String(this.year.getFullYear());
            let data = {
                year: year
            };

            let districtId = this.districtId;
            districtId && (data.districtId = districtId);
            let idCardNo = this.idCardNo;
            idCardNo && (data.idCardNo = idCardNo);
            let response = await getHoliday(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
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
        //  分页
        changePage: function(index){
            let start = ( index - 1 ) * this.pageSize;
            let end = index * this.pageSize;
            this.data = this.hostoryData.slice(start,end);
        },
        //  选择文件
        selectFile: function () {
            let file = $('#holidayFile').get(0).files[0];
            this.fileName = file.name;
        },
        //  导入年假
        importHoliday: async function () {
            let formData = new FormData('form');
            let file = $('#holidayFile').get(0).files[0];
            if(!file){
                this.$Message.warning('请先选择文件');
                return;
            }
            formData.append('file', file);
            this.fileName = file.name;
            let response = await importHoliday(formData);
            if(response.meta.code === 0){
                this.$Message.success('导入成功');
                this.cancel();
                return;
            }
            this.$Message.error(response.meta.message);
        },
        //  取消
        cancel: function () {
            $('#holidayFile').val('');
            this.fileName = '';
        },
        // 设置年假
        handleUpdate: function (name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.setFuntion();
                } else {
                    this.$Message.error('操作失败');
                }
            })
            
        },
        setFuntion: async function () {
            let data = {};
            let item = this.updateValidate;
            if(!item.userCode && !item.userIdCard){
                this.$Message.warning('身份证号和员工编码至少填写一项');
                return;
            }
            for(let key in item){
                if(item[key]){
                    data[key] = item[key];
                }
            }
            data.yearStr = String(item.yearStr.getFullYear());
            data.yearlyLimit = parseInt(data.yearlyLimit);
            let response = await updateHoliday(data);
            let message = response.meta.message;
            if(response.meta.code ===0){
                this.$Message.success(message);
                let data = response.data;
                if(this.index > -1) {
                    this.$set(this.data, this.index, data);
                } else {
                    this.data.unshift(data);
                }
            } else {
                this.$Message.error(message);
            }
            this.updateModal = false;
            this.index = -1;
        },
        handleCancel: function () {
            this.$refs['updateValidate'].resetFields();
            this.index = -1;
        }
    }
}
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>
