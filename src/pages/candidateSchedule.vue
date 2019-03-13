<template>
    <div class="container">
        <div class="content-header">
            <span>选择班制：</span>
            <Select v-model="suiteId" @on-change="loadTemplate(suiteId)">
                <Option v-for="item in suites" :value="item.id" :key="item.shiftId">{{ item.dutyName }}</Option>
            </Select>
            <!-- <button type="button" class="btnDefault bgBlue">创建排班</button> -->
            <button type="button" class="btnDefault bgGreen" @click="selectDateModal = true">保存排班</button>
        </div>
        <div class="schedule postformtable">
            <table class="scheduleForm" >
                <tr>
                    <th>站务员</th>
                    <th>一</th>
                    <th>二</th>
                    <th>三</th>
                    <th>四</th>
                    <th>五</th>
                    <th>六</th>
                    <th>日</th>
                    <th>总工时</th>
                </tr>
                <tr v-for="n in userList.length" :key="n">
                    <td @click="clickUserTd(n-1)" class="userName" :weeknum="n-1"></td>
                    <td v-for="i in 7" @click="beforeSelectClass" :key="'item.userId-'+i" :weeknum="n-1" :daynum="i-1"></td>
                    <td class="totalHours"></td>
                </tr>
            </table>
        </div>
        <!-- 选择排班 -->
        <Modal v-model="classModal"
            id="usersModal"
            title="选择班次" 
            width="600"
            @on-ok="setTemplateClass"
            @on-cancel="cancel"
            :loading="true">
            <button type="button" class="btnDefault bgBlue" @click="deleteTemplateClass">重置</button>
            <div class="userList shiftsList">
                <span v-for="item in dutyclass" :key="item.id" @click="clickClassTd(item)" :code="item.id" :style="'background-color:'+item.classColor">{{item.dutyName}}</span>
            </div>
        </Modal>
        <!-- 选择站务员 -->
        <Modal v-model="showUserModal"
            id="usersModal"
            title="选择站务员" 
            width="600"
            @on-ok="setSheduleUser"
            @on-cancel="cancel"
            :loading="true">
            <button type="button" class="btnDefault bgBlue" @click="resetSheduleUser">重置</button>
            <div class="userList">
                <span v-for="item in userList" :key="item.id" @click="clickUser(item)" :code="item.id">{{item.userName}}</span>
            </div>
        </Modal>
        <!-- 保存排班-选择开始日期 -->
        <Modal v-model="selectDateModal"
            id="selectDate"
            title="选择开始日期" 
            width="500"
            @on-ok="saveSchedule"
            @on-cancel="cancel"
            :loading="true">
            <Form :label-width="110">
                <FormItem label="选择开始日期">
                    <DatePicker type="date" style="width:320px;" placeholder="请选择时间"  v-model.trim="startDate"></DatePicker>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import {result} from '@/assets/data/data.js';
import {getSuites, loadTemplate, setSheduleUser, resetSheduleUser, setTemplateClass, deleteTemplateClass, saveSchedule} from '@/api/api';
export default {
    data: function () {
        return {
            districtId: this.$store.get('districtId'),
            classModal: false,
            showUserModal: false,
            selectDateModal: false,
            suites: [],
            userList: [],
            suiteId: null,
            dutyclass: [],
            temporary: {},
            currentUser: null,
            temporaryUser: null,
            weekNum: null,
            dayNum: null,
            id: null,
            startDate: '',
        }
    },
    created: function () {
        this.getSuites();
    },
    methods: {
        //  获取班制
        getSuites: async function () {
            let data = {
                districtId: this.districtId,
                backup: 1
            };
            let response = await getSuites(data);
            if(response.meta.code === 0){
                this.suites = response.data;
                this.suiteId = response.data[0].id;
                this.loadTemplate(this.suiteId);
                return;
            }
            this.$Message.error(response.meta.message);
        },
        //  加载排班模版
        loadTemplate: async function () {
            let response = await loadTemplate(this.suiteId);
            if(response.meta.code === 0){
                let data = response.data;
                this.userList = data.userlist;
                this.dutyclass = data.dutyclass;
                this.$nextTick(function () {
                    this.initTable(data.templatelist);
                    let users = data.scheduleUsers;
                    $('.userName').html('').removeAttr('userid');
                    $('.userList span').removeAttr('class');
                    for(let i=0;i<users.length;i++){
                        let obj = $('.userName[weeknum="'+ users[i].weekNum +'"]');
                        obj.html(users[i].userName).attr('userid', users[i].userId);
                        $('.userList [code="'+ users[i].userId +'"]').addClass('selected');
                    }
                })
                return;
            }
            this.$Message.error(response.meta.message);
        },
        //  模态框取消事件
        cancel: function () {
            this.weekNum = null;
            this.dayNum = null;
            this.temporaryUser = null;
            this.temporary = {};
            this.id = null;
            $('.td-active').removeClass('td-active');
            $('span.active').removeClass('active');
        },
        //  设置人员
        clickUserTd: function (n) {
            let obj = $('.userName[weeknum="'+ n +'"]');
            $('#usersModal').find('.active').removeClass('active');
            this.showUserModal = true;
            $(".userName").removeClass("td-active");
            obj.addClass("td-active");
            this.weekNum = n;
        },
        //  选择站务员
        clickUser: function (item) {
            this.temporaryUser = item;
            let obj = $('.userList').find('span[code="'+ item.id +'"]');
            obj.toggleClass('active').siblings().removeClass('active');
        },
        setSheduleUser: async function () {
            if(!this.temporaryUser){
                this.$Message.warning('请选择站务员');
                return;
            }
            let userId = this.temporaryUser.id;
            let user = this.temporaryUser;
            let data = {
                suiteId: this.suiteId,
                weekNum: this.weekNum,
                userId: userId
            }
            let response = await setSheduleUser(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                this.loadTemplate(this.suiteId);
            } else {
                this.$Message.error(message);
            }
            this.temporaryUser = null;
            this.weekNum = null;
            this.userId = null;
            this.showUserModal = false;
            $('.td-active').removeClass('td-active');
        },
        //  重置站务员
        resetSheduleUser: async function () {
            let obj = $('.userName[weeknum="'+ this.weekNum +'"]');
            let userId = obj.attr('userid');
            if(!userId){
                return;
            }
            let data = {
                suiteId: this.suiteId,
                weekNum: this.weekNum
            }
            let response = await resetSheduleUser(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                $('.userName.td-active').removeClass('td-active');
                this.loadTemplate(this.suiteId);
            } else {
                this.$Message.error(message);
            }
            this.showUserModal = false;
        },
        //  点击单元格选择班次
        beforeSelectClass: function (e) {
            $('.td-active').removeClass('td-active');
            let obj = $(e.target);
            obj.addClass('td-active');
            this.weekNum = parseInt(obj.attr('weeknum'));
            this.dayNum = parseInt(obj.attr('daynum'));
            this.classModal = true;
            this.id = parseInt(obj.attr('id'));
        },
        //  点击模态框班次
        clickClassTd: function (item) {
            this.temporary = item;
            $('span[code="' + item.id + '"]').addClass('active').siblings().removeClass('active');
        },
        //  选择班次确定
        setTemplateClass: async function () {
            if(!this.temporary.id){
                this.$Message.warning('请选择班次');
                return;
            }
            let data = {
                suiteId: this.suiteId,
                weekNum: this.weekNum,
                dayNum: this.dayNum,
                classId: this.temporary.id
            }
            let response = await setTemplateClass(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                this.loadTemplate(this.suiteId);
            } else {
                this.$Message.error(message);
            }
            this.weekNum = null;
            this.dayNum = null;
            this.classModal = false; 
            $('.td-active').removeClass('td-active');     
        },
        //  保存排班
        saveSchedule: async function () {
            let date = this.startDate;
            if(!date){
                this.$Message.warning('请选择开始日期');
                return;
            }
            let month = (date.getMonth()+1) < 10 ? ('0' + (date.getMonth()+1)) : (date.getMonth()+1);
            let day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
            let dateStr = date.getFullYear() + '-' + month  + '-' + day;
            let suiteId = this.suiteId;

            let response = await saveSchedule(suiteId, dateStr);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
            } else {
                this.$Message.error(message);
            }
            this.selectDateModal = false;
            this.startDate = '';
        },
        //  重置班次
        deleteTemplateClass: async function () {
            let id = this.id;
            if(id){
                let response = await deleteTemplateClass(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.loadTemplate(this.suiteId);
                    this.countHours();
                } else {
                    this.$Message.error(message);
                }
            }
            this.id = null;
            this.classModal = false;
        },
        //  统计工时
        countHours: function () {
            $('.totalHours').each(function () {
                let total = 0;
                let tds = $(this).prevAll();
                tds.each(function () {
                    let hours = $(this).attr('hours');
                    if(hours){
                        total += parseInt(hours);
                    }
                })
                total = total === 0 ? '' : total;
                $(this).html(total);
            })
        },
        //  渲染表格数据
        initTable: function (data) {
            $('td[id]').html('').removeAttr('id').removeAttr('style').removeAttr('hours').removeAttr('class');
            $('.shiftsList span').removeClass();
            for(let obj of data){
                $('[weeknum="'+ obj.weekNum +'"][daynum="'+ obj.dayNum +'"]').html(obj.dutyName).css('background-color', obj.cellColor).attr('hours', obj.workingLength/60).attr('id', obj.id);
            }
            this.countHours();
        }
    }
}
</script>

