<template>
    <div class="container">
        <div class="content">
            <div class="content-header">
                <div class="tabItem">
                    <span>选择班制：</span>
                    <Select v-model="suiteId" @on-change="loadTemplate(suiteId)">
                        <Option v-for="item in suites" :value="item.id" :key="item.id">{{ item.dutyName }}</Option>
                    </Select>
                    <button class="btnDefault bgGreen" @click="selectDateModal=true">保存排班</button>
                    <button type="button" class="btnDefault bgBlue" @click="createTemplate">生成模板</button>
                    <!-- <button class="btnDefault bgGreen" v-show="showSaveBtn">保存排班</button> -->
                    <p class="result" v-show="showResult">
                        <span>日平均<b>{{result.dayAverage || 0}}</b>小时，</span>
                        <span>周平均<b>{{result.weekAverage || 0}}</b>小时，</span>
                        <span>30日平均<b>{{result.monthAverage || 0}}</b>小时，</span>
                        <span>365日平均<b>{{result.yearAverage || 0}}</b>小时，</span>
                        <span>最少人数<b>{{result.minPeople || 0}}</b>人</span>
                    </p>
                </div>
            </div>
            <!-- 表格 start -->
            <div class="wrapper" v-show="showTable">
                <div class="tab-content">
                    <div class="tab-pane" id="tab2">
                        <p class="result">请选择各个岗位的排班方案，并点击右侧的<b>生成模板</b>按钮</p>
                    </div>
                    <div class="tab-pane in active" id="tab1">
                        <div class="schedule postformtable">
                            <table class="scheduleForm" v-show="showTable">
                                <thead>
                                <tr id="theHead0">
                                    <th>站务员</th>
                                    <th v-for="i in 7" :key="'th'+i">
                                        <div :id="'weekDay'+(i-1)">
                                            <p v-for="item in dutyClass" :key="item.id" :code="item.id" :shiftNum="item.userCount"><em>{{item.dutyName}}：</em><span>0</span></p>
                                        </div>
                                    </th>
                                    <th>周工时</th>
                                </tr>
                                </thead>
                                <tbody id="theBody">
                                    <tr v-for="(n, index) in weeks" :key="'tr'+index" :row="index">
                                        <td class="userName" :id="'user'+ n" @click="clickUserTd(n-1)" :weeknum="n-1"></td>
                                        <td v-for="m in 7" :key="'td'+ m" :id="'td'+(n-1)+'-'+(m-1)" :weeknum="n-1" :daynum="m-1" @click="beforeChange"></td>
                                        <td class="workHours">
                                            <span v-show="!((index === currentTr) && showDelete)"></span>
                                            <button type="button" class="deleteItem" v-show="(index === currentTr) && showDelete" @click="deleteTr(n-1)">删除本行</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 表格 end -->
            <div id="remarks"></div>
            <div id="select-user">
                <table class="user-table"></table>
            </div>
        </div>
        <div id="btnChange" v-show="showChangeBtn">
            <button type="button" class="btnDefault bgOrange" @click="changeTemplate">交换</button>
        </div>
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
                    <DatePicker type="date" placeholder="请选择时间"  v-model.trim="startDate"></DatePicker>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
    let self = null;
    import {getSuites, getScheduleInfo, loadTemplate, createTemplate, changeTemplate, setSheduleUser, resetSheduleUser, deleteOneWeek, saveSchedule} from '@/api/api';
    export default {
        data:function () {
            return {
                dutyClass: [],                              //  所有班次
                districtId: this.$store.get('districtId'),
                showChangeBtn: false,
                showTable: false,
                globalShiftCounts: {},
                globalShiftIds: [],
                userList: [],
                showUserModal: false,
                selectDateModal: false,
                startDate: null,
                currentResult: {},
                suites: [],
                suiteId: null,
                showResult: false,
                result: {
                    dayAverage: 0,
                    weekAverage: 0,
                    monthAverage: 0,
                    yearAverage: 0,
                    minPeople: 0
                },
                weeks: 0,
                currentTr: null,
                showDelete: false,
                totalHours: 0,
                weekMinHours: 0,
                weekMaxHours: 0,
                selectedTds: new Map(),
                currentRows: new Map(),
                temporaryUser: {},
                weekNum: null
            }
        },
        mounted: function () {
            self = this;
            //  获取班制列表
            this.getSuites();
        },
        methods:{
            //  获取所有班制
            getSuites: async function () {
                let data = {
                    districtId: this.districtId,
                    backup: 0
                };
                let response = await getSuites(data);
                if(response.meta.code === 0){
                    this.suites = response.data;
                    if(this.suites.length !== 0){
                        this.suiteId = response.data[0].id;
                    }
                    return;
                }
                this.$Message.error(response.meta.message);
            },
            // 查询排班计划
            getScheduleInfo: async function (id) {
                let response = await getScheduleInfo(id);
            },
            //  加载模板
            loadTemplate: async function(id){
                if(!id){
                    return;
                }
                let response = await loadTemplate(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    let data = response.data;
                    this.weeks = response.data.weeks;
                    this.dutyClass = data.dutyclass;
                    this.userList = [];
                    this.scheduleUsers = [];
                    this.userList = data.userlist;
                    this.template(data.templatelist);
                    this.$nextTick(function () {
                        let users = data.scheduleUsers;
                        $('.userName').html('').removeAttr('userid');
                        for(let i=0;i<users.length;i++){
                            let obj = $('.userName[weeknum="'+ users[i].weekNum +'"]');
                            obj.html(users[i].userName).attr('userid', users[i].userId);
                            $('.userList [code="'+ users[i].userId +'"]').addClass('selected');
                        }
                    })
                    return;
                }
                this.$Message.error(message);
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
                if(hours>this.weekMaxHours || hours<this.weekMinHours){
                    currentTd.find('span').addClass('red');
                } else {
                    currentTd.find('span').removeClass('red');
                }
                currentTd.find('span').html(hours);
                //  如果排班为空，显示删除本行按钮
                if (hours == 0) {
                    this.currentTr = n;
                    this.showDelete = true;
                }
            },
            //  计算工时平均值
            calcAverage: function () {
                let length = $('.userName').length;
                let daily = this.totalHours / length / 7;
                let weekly = daily * 7;
                let monthly = daily * 30;
                let yearly = daily * 365;
                this.weekMinHours = weekly * 0.9;
                this.weekMaxHours = weekly * 1.1;
                self.result.dayAverage = Math.round(daily * 1000) / 1000;
                self.result.weekAverage = Math.round(weekly * 1000) / 1000;
                self.result.monthAverage = Math.round(monthly * 1000) / 1000;
                self.result.yearAverage = Math.round(yearly * 1000) / 1000;
                self.result.minPeople = length;
                self.showResult = true;
            },
            drawOwners: function (owners) {
                for (var i = 0; i < owners.length; i++) {
                    var userId = owners[i].userId;
                    var userName = owners[i].userName;
                    var week = owners[i].weekNumber;
                    $("[tdType=-1]:eq(" + week + ")").attr("userId", userId).text(userName);
                    $(".user-table td[userId='" + userId + "']").css("color", "orange");
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
            //  点击站务员表格
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
                if(!this.temporaryUser.id){
                    this.$Message.warning('请选择站务员');
                    return;
                }
                let user = this.temporaryUser;
                let data = {
                    suiteId: this.suiteId,
                    weekNum: this.weekNum,
                    userId: user.id
                }
                let response = await setSheduleUser(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    $('.td-active').removeClass('td-active');
                    this.$Message.success(message);
                    
                    this.loadTemplate(this.suiteId);
                } else {
                    this.$Message.error(message);
                }
                this.temporaryUser = null;
                this.weekNum = null;
                this.showUserModal = false;
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
                    $('.td-active').removeClass('td-active');
                    $('.active').removeClass('active');
                    $('.selected').removeClass('selected');
                    this.loadTemplate(this.suiteId);
                } else {
                    this.$Message.error(message);
                }
                this.weekNum = null;
                this.showUserModal = false;
            },
            //  点击选择站务员模态框取消按钮
            cancel: function () {
                $('.td-active').removeClass('td-active');
                this.weekNum = null;
                this.currentRows.clear();
                this.selectedTds.clear();
            },
            //  点击排班单元格
            beforeChange: function (e) {
                let target = $(e.target);
                let map = this.selectedTds;
                let size = map.size;
                let index = parseInt($(target).attr('code'));
                let key = target.attr('id');
                let value = {
                    'weekNum': target.attr('weeknum'),
                    'dayNum': target.attr('daynum')
                };
                if(size<2){
                    map.set(key, value);
                }
                if (target.hasClass("td-active")) {
                    target.removeClass("td-active");
                    map.delete(key);
                    $("#btnChange").hide();
                    self.showChangeBtn = false;
                } else {
                    let actived = $(".td-active");
                    if(size > 1){
                        this.$Message.error("不可选中,选中节点过多");
                        return;
                    } else{
                        let row = $(target).parent().attr('row');
                        target.addClass("td-active");
                        if (size === 1) {
                            this.currentRows.set(1, row);
                            let a = actived[0];
                            $("#btnChange").css({"top":(e.pageY-20)+'px',"left":(e.pageX-200)+'px'});
                            this.showChangeBtn = true;
                            return;
                        }
                        this.currentRows.set(0, row);
                    }
                }
            },
            //  交换排班
            changeTemplate: async function () {
                let map = this.selectedTds;
                if(map.size !== 2){
                    this.$Message.error("操作失败，无法定位交换节点");
                    return;
                }
                let arr = [...map.entries()];
                let obj1 = arr[0][1];
                let obj2 = arr[1][1];
                let weekNum1 = parseInt(obj1.weekNum);
                let dayNum1 = parseInt(obj1.dayNum);
                let weekNum2 = parseInt(obj2.weekNum);
                let dayNum2 = parseInt(obj2.dayNum);
                let data = {
                    suiteId: this.suiteId,
                    weekNum1: weekNum1,
                    dayNum1: dayNum1,
                    weekNum2: weekNum2,
                    dayNum2: dayNum2
                };
                let response = await changeTemplate(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    let obj1 = $('[weeknum="'+ weekNum1 +'"][dayNum="'+ dayNum1 +'"]');
                    let obj2 = $('[weeknum="'+ weekNum2 +'"][dayNum="'+ dayNum2 +'"]');
                    let style = obj1.attr('style');
                    let html = obj1.html();
                    if(obj2.attr('style')){
                        obj1.attr('style',obj2.attr('style'));
                    } else {
                        obj1.removeAttr('data-hours').removeAttr('style');
                    }
                    obj1.html(obj2.html());
                    if(style){
                        obj2.attr('style', style);
                    } else {
                        obj2.removeAttr('data-hours').removeAttr('style');
                    }
                    obj2.html(html);
                    $(".workHours").each(function (n) {
                        self.calcWeeklyTime(n);
                    });
                    this.loadTemplate(this.suiteId);
                } else {
                    this.$Message.error(message);
                }
                $('.td-active').removeClass('td-active');
                this.showChangeBtn = false;
                this.selectedTds.clear();
            },
            //  删除一行
            deleteTr: async function (id) {
                let response = await deleteOneWeek(this.suiteId, id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.loadTemplate(this.suiteId);
                    $('.workHours span').show();
                    $('.deleteItem').hide();
                    return;
                }
                this.$Message.error(message);
            },
            //  生成模版
            createTemplate: async function () {
                let response = await createTemplate(this.suiteId);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success('生成模版成功');
                    let data = response.data;
                    this.weeks = 0;
                    this.weeks = response.data.weeks + 1;
                    this.dutyClass = data.dutyclass;
                    this.userList = [];
                    this.scheduleUsers = [];
                    this.userList = data.userlist;
                    this.template(data.templatelist);
                    this.$nextTick(function () {
                        let users = data.scheduleUsers;
                        $('.userName').html('').removeAttr('userid');
                        for(let i=0;i<users.length;i++){
                            let obj = $('.userName[weeknum="'+ users[i].weekNum +'"]');
                            obj.html(users[i].userName).attr('userid', users[i].userId);
                            $('.userList [code="'+ users[i].userId +'"]').addClass('selected');
                        }
                    })
                    return;
                }
                this.$Message.error(message);
            },
            //  加载模版
            template: function (allData) {
                let data = allData;
                let dataLen = allData.length;
                this.totalHours = 0;
                $('#theHead0').find('p span').html('0');
                this.$nextTick(function () {
                    for(let i=0;i<dataLen;i++){
                        let obj = data[i];
                        let n = obj.weekNum;
                        let m = obj.dayNum;
                        let hours = obj.workingLength/60;
                        this.totalHours += hours;
                        let dutyName = obj.workflowCode ? obj.dutyCode + obj.workflowCode : obj.dutyName;
                        $('[weeknum="'+ n +'"][daynum="'+ m +'"]').html(dutyName).css('background-color', obj.cellColor).attr({'data-hours': hours,'code': i});
                        let classId = obj.classId;
                        let span = $('#weekDay'+ m).find('[code="'+ classId +'"]').find('span');
                        let num = parseInt(span.html());
                        num++;
                        span.html(num);
                    }
                    let ps = $('#theHead0').find('p');
                    for(let i=0;i<ps.length;i++){
                        let obj = ps.eq(i);
                        if(obj.attr('shiftnum') !== obj.find('span').html()){
                            obj.addClass('red');
                        }
                    }
                    this.calcAverage();
                    $(".workHours").each(function (n) {
                        self.calcWeeklyTime(n);
                    });
                    self.globalShiftCounts = allData.shifts;
                    self.globalShiftIds = allData.shiftIds;
                    allData.owners && self.drawOwners(allData.owners);
                    $("th[thead]").each(function(n) {
                        self.calcDailySchedule(n);
                    });
                    this.showTable = true;
                })
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
            }
        }
    }
    
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>