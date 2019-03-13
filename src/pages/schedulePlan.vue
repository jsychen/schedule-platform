<template>
    <div class="container" >
        <div class="page">
            <div class="content-header">
                <div>
                    <button class="btnDefault" :class="{'bgBlue': bgBlueClass }" @click="swichData('week', new Date())">周表</button>
                    <button class="btnDefault" :class="{'bgBlue': !bgBlueClass }" @click="swichData('month', new Date())">月表</button>
                    <div class="tabItem" v-show="bgBlueClass">
                        <span>时间段：</span>
                        <Select v-model="dayNum" @on-change="changeWeek">
                            <Option v-for="item in dayNumList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                        <DatePicker v-model="startDateStr" type="date" placeholder="请选择时间" @on-change="changeDate('start')"></DatePicker> 至
                        <DatePicker v-model="endDateStr" type="date" placeholder="请选择时间" @on-change="changeDate('end')"></DatePicker>
                    </div>
                    <div class="tabItem" v-show="!bgBlueClass">
                        <span>选择月份：</span>
                        <DatePicker v-model="month" type="month" placeholder="请选择月份" @on-change="swichData('month', new Date(month))"></DatePicker>
                    </div>
                </div>
                <div style="margin-top: 20px">
                    <span>站点：</span>
                    <Select v-model="station" clearable>
                        <Option v-for="item in stationList" :value="item.id" :key="item.id">{{ item.stationName }}</Option>
                    </Select>
                    <span>岗位：</span>
                    <Select v-model="post" clearable>
                        <Option v-for="item in postList" :value="item.id" :key="item.id">{{ item.positionName }}</Option>
                    </Select>
                    <p class="selectbutton">
                        <span class="icon-5" ></span>
                        <input type="text" v-model.trim="userName" placeholder="姓名/编号" style="border: 0">
                    </p>
                    <button type="button" class="btnDefault bgBlue" @click="getScheduleInfo">查询</button>
                </div>
            </div>
            <div class="panel-body" style="padding-bottom:0;">
                <div class="float-right" style="margin-top: 20px">
                    <span><i class="colori" style="background-color: #fffc00;"></i>假期</span>
                    <span><i class="colori" style="background-color: #ff9191"></i>班次变更</span>
                    <span><i class="colori" style="background-color: #3A6BCE"></i>临时安排</span>
                    <span><i class="colori" style="background-color: #b10000"></i>旷工缺勤</span>
                    <span><i class="colori" style="background-color: #00d537"></i>补班加班</span>
                    <span><i class="colori" style="background-color: #008121"></i>替班</span>
                </div>
                <div class="clear"></div>
                <div class="postformtable planTable">
                    <!--周表-->
                    <table style="min-width:100%;">
                        <tr>
                            <th rowspan="2">姓名</th>
                            <th rowspan="2">岗位</th>
                            <th v-for="(item, index) in dateArr" :key="'th-0-'+ index">{{item}}</th>
                            <th colspan="3">总计：{{dateArr.length}}天</th>
                        </tr>
                        <tr>
                            <th v-for="(item, index) in weekArr" :key="'th-1-'+ index">{{item}}</th>
                            <th>计划工时</th>
                            <th>实际工时</th>
                            <th>结余</th>
                        </tr>
                        <tr v-for="item in data" :key="item.id">
                            <td :id="'user'+item.id" class="scheduleName" @mouseover="showUserInfo(item)" @mouseout="showInfo=false">{{item.userName}}</td>
                            <td>{{item.positionName}}</td>
                            <!--周表点击事件-->
                            <td v-for="(item, index) in dateArr" :code="item" :key="'aa'+ index" @mouseover="showLeaveInfo" @mouseleave="modal.showLeaveInfo = false">--</td>
                            <td class="planWorkHour">0</td>
                            <td class="actualWorkHour">0</td>
                            <td class="balance">0</td>
                        </tr>
                    </table>
                </div>
                <!--个人信息悬浮框-->
                <div class="peopleMessage" v-show="showInfo">
                    <span>电话</span><span>住址</span>
                    <span>{{phoneNumber}}</span><span>{{homeAddress}}</span>
                    <div class="clear"></div>
                </div>
                <!--请假信息悬浮框-->
                <div class="tdMessage" v-show="modal.showLeaveInfo">
                    <div v-for="item in currentSchedule.leaveList" :key="item.id">
                        <p>假期类型：{{item.leaveDesc || ''}}</p>
                        <p>替班员：{{item.exchangeUserName}}</p>
                        <p>时长：{{item.leaveHours}} 小时</p>
                        <p>备注：{{item.comment || ''}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {getScheduleInfo, getAllPost, askForLeave} from '@/api/api';
    import {getStations} from '@/api/commonAPI';
    export default {
        data: function() {
            return {
                districtId: this.$store.get('districtId'),
                data: [],
                startDateStr: new Date(),
                endDateStr: null,
                beginTime:'',
                endTime:'',
                showTable:true,
                bgBlueClass: true,
                currentTd:'',
                datatr:{},
                clicktr:'',
               // clicktd:'',
                target:'',
                dayNumList: [{value: 7, label: "一周"}, {value: 14, label: "两周"}],
                dayNum: 7,
                station: null,
                post: null,
                userName: '',
                modal:{
                    showLeaveInfo: false
                },
                stationList: [],
                postList: [],
                dateArr: [],
                weekArr: [],
                weekMap: new Map([
                    [0, '日'],
                    [1, '一'],
                    [2, '二'],
                    [3, '三'],
                    [4, '四'],
                    [5, '五'],
                    [6, '六'],
                ]),
                phoneNumber: '',
                homeAddress: '',
                showInfo: false,
                scheduleInfoId: null,
                leaveType: null,
                showMenu: false,
                subType: null,
                leaveCount: 0,
                content: '',
                userList: [],
                instead: null,
                month: new Date(),
                colorMap: new Map([
                    [1, '#fffc00'],
                    [2, '#fffc00'],
                    [3, '#ff9191'],
                    [4, '#3A6BCE'],
                    [5, '#b10000'],
                    [6, '#00d537'],
                    [7, '#008121'],
                    [9, '#fffc00'],
                    [10, '#00d537']
                ]),
                currentSchedule: {},          //  鼠标悬浮人员信息
            };
        },
        created: function () {
            //this.clickHide();
            this.getStations();
            this.getAllPost();
            this.changeWeek();
            this.endDateStr = new Date(this.startDateStr.getTime() + 6*24*60*60*1000);
        },
        methods: {
            //  获取站点
            getStations: async function () {
                let response = await getStations(this.districtId);
                if(response.meta.code === 0){
                    this.stationList = response.data;
                    return;
                }
                this.$Message.error(response.meta.message);
            },
            //  获取岗位
            getAllPost: async function () {
                let response = await getAllPost(this.districtId);
                if(response.meta.code === 0){
                    this.postList = response.data;
                    return;
                }
                this.$Message.error(response.meta.message);
            },
            //  周表月表切换
            changeWeek: function () {
                this.changeDate();
            },
            //  获取排班计划
            getScheduleInfo: async function () {
                let startDateStr = '';
                let endDateStr = '';
                if(this.bgBlueClass){
                    if(!this.startDateStr || !this.endDateStr){
                        this.$Message.warning('开始日期和结束日期不能为空');
                        return;
                    }
                    startDateStr = this.$conversion(this.startDateStr);
                    endDateStr = this.$conversion(this.endDateStr);
                } else {
                    let date = this.month;
                    if(!date){
                        this.$Message.warning('请选择月份');
                        return;
                    }
                    let year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    let days = this.getMonthDays(year, month);
                    let str = year + '-' + (month < 10 ? '0' + month : month) + '-';
                    startDateStr = str + '01';
                    endDateStr = str + days;
                }
                
                let data = {
                    startDateStr: startDateStr,
                    endDateStr: endDateStr
                };
                this.station && (data.stationId = this.station);
                this.post && (data.positionId = this.post);
                this.userName && (data.userName = this.userName);

                let response = await getScheduleInfo(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    let data = response.data
                    this.data = data;
                    this.$nextTick(function () {
                        for(let obj of data){
                            let list = obj.scheduleInfoList;
                            for(let schedule of list){
                                let date = schedule.dateStr.substring(5);
                                let hours = schedule.workingHours;
                                let dutyName = schedule.dutyName || '--';
                                let leaveList = schedule.leaveList || [];
                                let leavehours = 0;
                                let color = '';
                                let countOriginal = 1;
                                if(leaveList.length>0){
                                    leavehours = leaveList[0].leaveHours;
                                    leavehours = leaveList[0].leaveHours;
                                    color = this.colorMap.get(leaveList[0].leaveType);
                                    countOriginal = leaveList[0].countOriginal;
                                    if(leaveList.length>1){
                                        leavehours = 0;
                                        for(let obj of leaveList){
                                            leavehours += obj.leaveHours;
                                        }
                                    }
                                }
                                let target = $('#user'+obj.id).siblings().filter('[code="'+ date +'"]');
                                target.html(dutyName).attr('id', schedule.id).attr('hours', hours).attr('leavehours', leavehours).attr('countoriginal', countOriginal);
                                color && target.css('background-color', color);
                            }
                        }
                        this.countHours();
                    })
                    return;
                } 
                this.$Message.error(message);
            },
            //  选择日期
            changeDate: function (str) {
                if(!this.startDateStr || !this.endDateStr){
                    return;
                }
                if(str === 'end'){
                    this.startDateStr = new Date(this.endDateStr.getTime() - (this.dayNum-1)*24*60*60*1000);
                } else {
                    this.endDateStr = new Date(this.startDateStr.getTime() + (this.dayNum-1)*24*60*60*1000);
                }
                this.dateArr = [];
                this.weekArr = [];
                if(this.startDateStr){
                    let arr = [];
                    for(let i=0;i<this.dayNum;i++){
                        let date = new Date(this.startDateStr.getTime() + i*24*60*60*1000);
                        let weekDay = this.weekMap.get(date.getDay());
                        arr.push(
                            {
                                title: this.$conversion(date).substring(5),
                                children: [
                                    { 
                                        title: weekDay, 
                                        width: 100,
                                    }
                                ]
                            }
                        );
                        this.weekArr.push(weekDay);
                        this.dateArr.push(this.$conversion(date).substring(5));
                    }
                }
                this.endDateStr = new Date(this.startDateStr.getTime() + this.dayNum*24*60*60*1000);
            },
           
            //  统计工时
            countHours: function () {
                $('.planWorkHour').each(function () {
                    let planTotal = 0;
                    let actualTotal = 0;
                    $(this).siblings('[hours]').each(function () {
                        planTotal += parseInt($(this).attr('hours'));
                        actualTotal += parseInt($(this).attr('leavehours'));
                        parseInt($(this).attr('countoriginal')) && (actualTotal += parseInt($(this).attr('hours')));
                    })
                    let balance = actualTotal-planTotal;
                    $(this).html(planTotal);
                    let balanceObj = $(this).next().next();
                    $(this).next().html(actualTotal);
                    balanceObj.html(balance);
                    if(balance < 0){
                        balanceObj.addClass('red');
                    }
                })
            },
            //  显示站务员信息
            showUserInfo: function (item) {
                let obj = $(window.event.target);
                let scrollTop = $(window).scrollTop();
                let left = obj.offset().left + 100;
                let top = obj.offset().top - scrollTop + 30;
                
                $('.peopleMessage').css({'left': left + 'px', 'top': top + 'px'});

                this.phoneNumber = item.phoneNumber;
                this.homeAddress = item.homeAddress;
                this.showInfo = true;
            },
            //  模态框取消事件
            cancel: function () {
                this.scheduleInfoId = null;
                this.substring = null;
                this.subType = null;
                this.leaveCount = 0;
                this.content = '';
                this.instead = null;
            },
            //  周表月表切换
            swichData: function (type, date) {
                this.changeDate();
                this.dateArr = [];
                this.weekArr = [];
                this.data = [];
                let days = 0;
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                if(type === 'month'){
                    this.bgBlueClass = false;
                    days = this.getMonthDays(year, month);
                    for(let i=1;i<=days;i++){
                        this.dateArr.push((month<10 ? '0' + month : month) + '-' + (i<10 ? '0' + i : i));
                        this.weekArr.push(this.getWeekDay(year, month, i));
                    }
                    return;
                } 
                this.bgBlueClass = true;
                this.changeWeek();
            },
            //  根据月份获取天数
            getMonthDays: function (year, month){
                var stratDate = new Date(year,month-1,1),
                endData = new Date(year,month,1);
                var days = (endData - stratDate)/(1000*60*60*24);
                return days;
            },
            //  根据日期获取周几
            getWeekDay: function (year, month, day) {
                let weekDay = new Date(year, month-1, day).getDay();
                return this.weekMap.get(weekDay);
            },
            //  显示请假信息
            showLeaveInfo: function (e) {
                let obj = $(e.target);
                if(!obj.attr('style')){
                    return;
                }
                let id = parseInt(obj.attr('id'));
                let index = obj.parent().index() - 2;
                let schedules = this.data[index].scheduleInfoList;
                let w = parseInt(obj.width());
                for(let obj of schedules){
                    if(obj.id === id){
                        this.currentSchedule = obj;
                        break;
                    }
                    
                }
                if(obj.attr('style')){
                    let containerW = $('.container').offset().left;
                    let left = obj.offset().left - containerW + w + 15;
                    let top = obj.offset().top - 60;
                    $('.tdMessage').css({'left': left + 'px', 'top': top + 'px'});
                    this.modal.showLeaveInfo = true;
                }
            }

        }
    };
</script>
<style scoped>
    @import "../assets/css/index.css";
</style>
