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
            <p style="padding: 10px;">
                <Checkbox v-model="open">{{open ? '展开表格' : '收起表格'}}</Checkbox>
            </p>
            <table class="scheduleForm manualSchedule" :class="{'openTable': open}">
                <tr id="theHead0">
                    <th>站务员</th>
                    <th v-for="i in 7" :key="'th'+i">
                        <div :id="'weekDay'+(i-1)">
                            <p v-for="item in dutyClass" :key="item.id" :code="item.id" :shiftNum="item.userCount"><em>{{item.dutyName}}：</em><span>0</span></p>
                        </div>
                    </th>
                    <th>周工时</th>
                </tr>
                <tr v-for="n in weeks" :key="n">
                    <td @click="clickUserTd(n-1)" class="userName" :weeknum="n-1">
                        <p v-for="item in users" :key="'user'+ item.id" v-if="item.weekNum === n-1">
                            {{item.userName}}
                            <span class="delete" @click.stop="deleteUser(suiteId, item.userId)"></span>
                        </p>
                    </td>
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
                <span v-for="item in dutyClass" :key="item.id" @click="clickClassTd(item)" :code="item.id" :style="'background-color:'+item.classColor">{{item.dutyName}}</span>
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
                    <DatePicker type="date" :options="options" style="width:320px;" placeholder="请选择时间"  v-model.trim="startDate"></DatePicker>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import {result} from '@/assets/data/data.js';
import {getSuites, loadTemplate, setSheduleUser, resetSheduleUser, setTemplateClass, deleteTemplateClass, saveSchedule, deleteUser} from '@/api/api';
var self = null;
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
            dutyClass: [],
            temporary: {},
            currentUser: null,
            temporaryUser: null,
            weekNum: null,
            dayNum: null,
            id: null,
            startDate: '',
            weeks: 0,
            showResult: false,
            totalHours: 0,
            options: {
                disabledDate (date){
                    return date && date.valueOf() < Date.now() - 86400000;
                }
            },
            currentUserId: null,
            open: false,
            users: []
        }
    },
    created: function () {
        this.getSuites();
        self = this;
    },
    methods: {
        //  获取班制
        getSuites: async function () {
            let data = {
                districtId: this.districtId
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
            let self = this;
            if(response.meta.code === 0){
                let data = response.data;
                this.userList = data.userlist;
                this.dutyClass = data.dutyclass;
                this.weeks = Math.ceil(data.userlist.length/4)*4;
                this.$nextTick(function () {
                    this.initTable(data.templatelist);
                    let users = data.scheduleUsers;
                    this.users = users;
                    // $('.userName').html('').removeAttr('userid');
                    $('.userList span').removeAttr('class');
                    for(let i=0;i< users.length;i++){
                        // let obj = $('.userName[weeknum="'+ users[i].weekNum +'"]');
                        // obj.append('<p id="'+ users[i].userId +'">'+ users[i].userName +'<span class="delete"></span></p>');
                        $('.userList [code="'+ users[i].userId +'"]').addClass('selected');
                    }
                    $(".workHours").each(function (n) {
                        self.calcWeeklyTime(n);
                    });
                    this.globalShiftCounts = data.shifts;
                    this.globalShiftIds = data.shiftIds;
                    $("th[thead]").each(function(n) {
                        self.calcDailySchedule(n);
                    });
                    this.showTable = true;
                })
                
                return;
            }
            this.$Message.error(response.meta.message);
        },
        //  模态框取消事件
        cancel: function () {
            this.weekNum = null;
            this.dayNum = null;
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
            let obj = $('.userList').find('span[code="'+ item.id +'"]');
            obj.toggleClass('active');
        },
        setSheduleUser: async function () {
            let arr = [];
            $('.userList span.active').each(function () {
                arr.push($(this).attr('code'));
            })
            if(arr.length === 0){
                this.$Message.warning('请选择站务员');
                return;
            }
            if(arr.length>25){
                this.$Message.warning('站务员数量超过上线');
                return;
            }
            let data = {
                suiteId: this.suiteId,
                weekNum: this.weekNum,
                userIds: arr.join(',')
            }
            let response = await setSheduleUser(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                this.loadTemplate(this.suiteId);
            } else {
                this.$Message.error(message);
            }
            this.weekNum = null;
            this.userId = null;
            this.showUserModal = false;
            $('.td-active').removeClass('td-active');
        },
        //  重置站务员
        resetSheduleUser: async function () {
            let userId = this.currentUserId;
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
                classId: this.temporary.id,
                relevance: 0

            }
            if(this.temporary.relevant){
                data.relevance = 1;
                data.reClassId = this.temporary.relevant.id;
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
                let hours = obj.workingLength/60;
                this.totalHours += hours;
                let dutyName = obj.dutyName || '--';
                $('[weeknum="'+ obj.weekNum +'"][daynum="'+ obj.dayNum +'"]').html(dutyName).css('background-color', obj.cellColor).attr('hours', hours).attr('id', obj.id).attr('dutycode', obj.dutyCode);
                let classId = obj.classId;
            }
            this.countHours();
            let self = this;
            setTimeout(function () {
                self.calcClassNum();
            },500)
        },
        //  计算周工时
        calcWeeklyTime: function (n) {
            let currentTd = $(".workHours").eq(n);
            let works = currentTd.parent().find("td[data-hours]");
            let hours = 0;
            for (let i = 0; i < works.length; i++) {
                hours += parseInt(works.eq(i).attr('data-hours'));
            }
            //  低于或者高于平均值的百分之十显示红色
            // if(hours>this.weekMaxHours || hours<this.weekMinHours){
            //     currentTd.find('span').addClass('red');
            // } else {
            //     currentTd.find('span').removeClass('red');
            // }
            currentTd.find('span').html(hours);
            //  如果排班为空，显示删除本行按钮
            if (hours == 0) {
                this.currentTr = n;
                this.showDelete = true;
            }
        },
        calcDailySchedule: function (n) {
            var header=$("th[thead="+n+"]");
            var array=$("[tdType="+n+"]>div");
            var counts={};
            for(var i=0;i<array.length;i++){
                var id=$(array[i]).attr("shiftId")+"";
                if(!counts[id]){
                    counts[id]=0;
                }
                counts[id]+=1;
            }
            var html="";
            for(var i=0;i<this.globalShiftIds.length;i++){
                var index = this.globalShiftIds[i];
                var c = counts[index];
                var num = this.globalShiftCounts[index].shiftNum;
                html += "<span";
                if(c!=num){
                    html+=" style='color:red'";
                }else {
                    html+=" style='color:white'";
                }
                html += ">";
                html += this.globalShiftCounts[index].shiftName;
                html += ":";
                html += c;
                html += "</span><br/>";
            }
            $(header).html(html);
        },
        // 计算班次数
        calcClassNum: function () {
            $('[id^="weekDay"]').find('p span').html('0');
            $('td[dutycode]').each(function () {
                let dutyCode = $(this).attr('dutycode');
                let dayNum = $(this).attr('daynum');
                let weekNum = $(this).attr('weeknum');
                let userNum = $(this).closest('tr').find('.userName p').length;
                let span = $('#weekDay' + dayNum).find('[code="'+ dutyCode +'"] span');
                let num = parseInt(span.html());
                num += userNum;
                span.html(num);
            })
        },
        // 删除单个站务员
        deleteUser: async function (suiteId, userId) {
            let response = await deleteUser(suiteId, userId);
            if(response.meta.code === 0){
                this.loadTemplate(this.suiteId);
            }
        }
    }
}

// $(document).on('click', '.userName p', function (e) {
//     e.stopPropagation();
//     let obj = $(this).closest('td');
//     let n = parseInt(obj.attr('weeknum'));
//     $('#usersModal').find('.active').removeClass('active');
//     self.showUserModal = true;
//     $(".userName").removeClass("td-active");
//     obj.addClass("td-active");
//     self.weekNum = n;
//     self.currentUserId = parseInt($(this).attr('id'));
// })
</script>