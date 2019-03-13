<template>
    <div class="container">
        <div class="page" style="padding-bottom: 200px;">
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
                    <button type="button" class="btnDefault" @click="exportImg">导出个人</button>
                </div>
            </div>
            <div class="panel-body">
                <div class="float-right" style="margin-top: 20px;">
                    <span><i class="colori" style="background-color: #fffc00;"></i>假期</span>
                    <span><i class="colori" style="background-color: #ff9191"></i>班次变更</span>
                    <span><i class="colori" style="background-color: #3A6BCE"></i>临时安排</span>
                    <span><i class="colori" style="background-color: #b10000"></i>旷工缺勤</span>
                    <span><i class="colori" style="background-color: #00d537"></i>补班加班</span>
                    <span><i class="colori" style="background-color: #008121"></i>替班</span>
                </div>
                <div class="clear"></div>
                <div class="postformtable">
                    <div class="left">
                        <table>
                            <tr>
                                <th>姓名</th>
                                <th>岗位</th>
                                <th>车站</th>
                                <th>员工卡号</th>
                            </tr>
                        </table>
                        <div class="inner">
                            <table>
                                <tr v-for="item in data" :key="item.id" :backup="item.backup" :suiteid="item.scheduleInfoList[0].suiteId">
                                    <td :id="'tr'+item.id" class="scheduleName" @mouseover="showUserInfo(item)" @mouseout="showInfo=false">{{item.userName}}</td>
                                    <td>{{item.positionName}}</td>
                                    <td>{{item.stationName}}</td>
                                    <td>{{item.employeeCard}}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="right" style="margin-right: 0;">
                        <div class="head">
                            <table>
                                <tr>
                                    <th v-for="(item, index) in dateArr" :key="'th-0-'+ index">
                                        <span>{{item}}</span>
                                    </th>
                                    <th colspan="3">
                                        <span>总计：{{dateArr.length}}天</span>
                                    </th>
                                </tr>
                                <tr>
                                    <th v-for="(item, index) in weekArr" :key="'th-1-'+ index">
                                        <span>{{item}}</span>
                                    </th>
                                    <th><span>计划工时</span></th>
                                    <th><span>实际工时</span></th>
                                    <th><span>结余</span></th>
                                </tr>
                            </table>
                        </div>
                        <div class="inner" @scroll="doScroll">
                            <table>
                                <tr v-for="item in data" :id="'user'+item.id" :key="item.id" :card="item.employeeCard" :backup="item.backup" :suiteid="item.scheduleInfoList[0].suiteId">
                                    <!--周表点击事件-->
                                    <td v-for="(item, index) in dateArr" :code="item" :key="'aa'+ index" @mouseleave="modal.showLeaveInfo = false;"><span @mouseover="showLeaveInfo" @click="clickTd">--</span></td>
                                    <td class="planWorkHour"><span>0</span></td>
                                    <td class="actualWorkHour"><span>0</span></td>
                                    <td class="balance"><span>0</span></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <!--假期悬浮框-->
                <div class="vocationDiv" v-show="showMenu">
                    <div @click="modal.scheduleChange = true">换班</div>
                    <div @click="getAnnualHoliday" code="1">年假</div>
                    <div @click="updateHoliday" code="2">假期编辑</div>
                    <div @click="changeClass" code="3">班次变更</div>
                    <div @click="modal.provisionalDisposition = true; leaveType = 4" code="4">临时安排</div>
                    <div @click="modal.absenteeism = true; leaveType = 5" code="5">旷工缺勤</div>
                    <div @click="modal.overtime = true; leaveType = 6" code="6">加班补班</div>
                    <div @click="handleInstead" code="7">替班</div>
                    <div @click="handleTransfer" code="8">调离</div>
                    <div @click="modal.smallVocation = true; leaveType = 9" code="9">零星假</div>
                    <div @click="modal.other = true; leaveType = 10" code="10">其它</div>
                    <div code="11" @click="handleCancelLeave">撤销</div>
                </div>
                <!-- 换班模态框 -->
                <Modal
                    v-model="modal.scheduleChange"
                    title="换班"
                    @on-ok="changeSchedule"
                    @on-cancel="cancel"
                    :loading="true">
                    <Form :label-width="80">
                        <FormItem label="换班人">
                            <Select v-model="changeEmployeeCard">
                                <Option v-for="item in data" :value="item.employeeCard" :key="item.id" :disabled="employeeCard == item.id">{{item.userName}}</Option>
                            </Select>
                        </FormItem>
                    </Form>
                </Modal>
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
            <!-- 年假模态框 -->
            <Modal
                v-model="modal.annualLeave"
                title="年假"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="年假天数">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                        <p>年假剩余{{annualHoliday}}天</p>
                    </FormItem>
                    <FormItem label="替班人" v-show="backup">
                        <Select v-model="instead">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.userName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea  name="remark" class="content"  v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--假期编辑-->
            <Modal
                v-model="modal.editVocation"
                title="假期编辑"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="假期类型">
                        <Select v-model="subType" @on-change="getSickleft">
                            <Option :value="1">病假/病</Option>
                            <Option :value="2">事假/事</Option>
                            <Option :value="3">婚假/婚</Option>
                            <Option :value="4">丧假/丧</Option>
                            <Option :value="5">探亲假/探</Option>
                            <Option :value="6">生育津贴假/产1</Option>
                            <Option :value="7">企业延长产假/产2</Option>
                            <Option :value="8">男方陪产假/产陪</Option>
                            <Option :value="9">计生假/计</Option>
                            <Option :value="10">工伤假/工</Option>
                            <Option :value="11">旷工假/旷</Option>
                            <Option :value="12">搬家假/搬</Option>
                            <Option :value="13">出差假/差</Option>
                            <Option :value="14">调休/调</Option>
                        </Select>
                        <p v-show="subType === 1">{{sickleft.limit || '暂无医疗期数据'}}，已使用{{sickleft.consumed || 0}}天</p>
                    </FormItem>
                    <FormItem label="请假天数">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="替班人" v-show="backup">
                        <Select v-model="instead">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.userName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea v-model.trim="content" name="remark" class="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--班次变更-->
            <Modal
                v-model="modal.shiftChange"
                title="班次变更"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="班次">
                        <Select v-model="instead">
                            <Option :value="item.id" v-for="item in suites" :key="item.id">{{item.dutyName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea v-model.trim="content" name="remark" class="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--临时安排-->
            <Modal
                v-model="modal.provisionalDisposition"
                title="临时安排"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="100">
                    <FormItem label="临时安排类型">
                        <Select v-model="subType">
                            <Option :value="1">培训</Option>
                            <Option :value="2">演练</Option>
                            <Option :value="3">会议</Option>
                            <Option :value="4">活动</Option>
                            <Option :value="5">考试</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="额外占用工时">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea v-model.trim="content" name="remark" class="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--旷工缺勤-->
            <Modal
                v-model="modal.absenteeism"
                title="旷工缺勤"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="缺勤工时">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea  name="remark" class="content"  v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--补班加班-->
            <Modal
                v-model="modal.overtime"
                title="补班加班"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="加班工时">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea name="remark" class="content" v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--替班-->
            <Modal
                v-model="modal.substitute"
                title="替班"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="替班人员" v-show="backup">
                        <Select v-model="instead">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.userName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea name="remark" class="content" v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--其它-->
            <Modal
                v-model="modal.other"
                title="其它"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="工时">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea name="remark" class="content" v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--零星假-->
            <Modal
                v-model="modal.smallVocation"
                title="零星假"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="工时">
                        <i-input v-model.trim="leaveCount" :required="true" clearable></i-input>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea name="remark" class="content" v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
            <!--调离-->
            <Modal
                v-model="modal.transfer"
                title="调离"
                @on-ok="askForLeave"
                @on-cancel="cancel"
                :loading="true">
                <Form :label-width="80">
                    <FormItem label="上岗人员">
                        <Select v-model="instead">
                            <Option v-for="item in userList" :value="item.id" :key="item.id">{{item.userName}}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注">
                        <textarea name="remark" class="content" v-model.trim="content"></textarea>
                    </FormItem>
                </Form>
            </Modal>
        </div>
    </div>
</template>
<script>
    import {getScheduleInfo, getAllPost, askForLeave, getAnnualHoliday, getSickleft, exportImg, cancelLeave, getClass, changeSchedule} from '@/api/api';
    import {getStations, getBackupUser} from '@/api/commonAPI';
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
                clicktd:'',
                target:'',
                dayNumList: [{value: 7, label: "一周"}, {value: 14, label: "两周"}],
                dayNum: 7,
                station: null,
                post: null,
                userName: '',
                modal:{
                    editVocation:false,
                    shiftChange:false,
                    provisionalDisposition:false,
                    absenteeism:false,
                    overtime:false,
                    substitute:false,
                    transfer:false,
                    smallVocation:false,
                    other:false,
                    annualLeave:false,
                    showLeaveInfo: false,
                    scheduleChange: false
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
                currentId: null,
                annualHoliday: 0,
                sickleft: 0,
                suites: [],
                backup: true,               //  控制是否显示备班员选项
                employeeCard: '',       // 换班的用户
                changeEmployeeCard: '',        // 换班员的id
                changeDateStr: '',              // 换班开始日期
            };
        },
        created: function () {
            this.clickHide();
            this.getStations();
            this.getAllPost();
            this.changeWeek();

            this.endDateStr = new Date(this.startDateStr.getTime() + 6*24*60*60*1000);
            
        },
        mounted: function () {
            let width1 = $('.page').width() - 340;
            let width2 = $('.right table').width();
            $('.postformtable .right').width(width1);
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
            //  获取备班员
            getBackupUser: async function () {
                let response = await getBackupUser(this.districtId, this.scheduleInfoId);
                if(response.meta.code === 0){
                    this.userList = response.data;
                    return;
                }
                this.$Message.error('站务员请求失败');
            },
            //  周表月表切换
            changeWeek: function () {
                this.changeDate();
            },
            //  获取排班计划
            getScheduleInfo: async function () {
                let data = this.getQueryDate();
                if(!data){
                    return;
                }
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
                                let dutyName = schedule.workflowCode ? schedule.dutyCode + schedule.workflowCode : schedule.dutyName;
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
                                let target = $('#user'+ obj.id).find('[code="'+ date +'"]');
                                target.find('span').html(dutyName).attr('datestr', schedule.dateStr);
                                target.attr('id', schedule.id).attr('hours', hours).attr('leavehours', leavehours).attr('countoriginal', countOriginal);
                                color ? target.css('background-color', color) : target.removeAttr('style');
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
            //  请假
            askForLeave: async function () {
                let e = window.event;
                let target = $(e.target).parent();
                target.attr('disabled', true);
                setTimeout(function () {
                    target.attr('disabled', false);
                },5000);
                let scheduleInfoId = this.scheduleInfoId;
                let leaveType = this.leaveType;
                if(!scheduleInfoId){
                    return;
                }
                if(leaveType !== 2 && leaveType !== 4){
                    this.subType = 1;
                }
                if(!this.subType){
                    let mes = '请选择请假类型';
                    if(leaveType === 4){
                        mes = '请选择临时安排类型';
                    }
                    this.$Message.warning(mes);
                    return;
                }
                let data = {
                    scheduleInfoId: scheduleInfoId,
                    leaveType: leaveType,
                    subType: this.subType,
                    leaveCount: parseInt(this.leaveCount),
                }
                let instead = this.instead;
                if(instead !== null){
                    data.instead = instead;
                }
                if(this.content){
                    data.content = this.content;
                }
                // instead
                let response = await askForLeave(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    let data = response.data;
                    for(let obj of data){
                        let target = $('#' + obj.scheduleInfoId);
                        let color = this.colorMap.get(obj.leaveType);
                        if(target.length>0){
                            target.attr('leavehours', obj.leaveHours).attr('hours', obj.countOriginal).css('background-color', color);
                        }
                    }
                    for(let key in this.modal){
                        this.modal[key] = false;
                    }
                    // this.countHours();
                    this.getScheduleInfo();
                }
                
                this.scheduleInfoId = null;
                this.substring = null;
                this.subType = null;
                this.leaveCount = 0;
                this.content = '';
                this.instead = null;
                for(let key in this.modal){
                    this.modal[key] = false;
                }
                target.attr('disabled', false);
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
                    $(this).find('span').html(planTotal);
                    let balanceObj = $(this).next().next().find('span');
                    $(this).next().find('span').html(actualTotal);
                    balanceObj.html(balance);
                    balance<0 ? balanceObj.addClass('red') : balanceObj.removeClass('red')
                })
            },
            clickHide: function(){
                let self = this;
                $(document).click(function(e){
                    self.showMenu = false;
                });
            },
            //  点击排班表格
            clickTd: function(e){ 
                let obj = $(e.target).parent();
                let id = parseInt(obj.attr('id'));
                if(!id){
                    return;
                }
                this.employeeCard = obj.closest('tr').attr('card');
                this.scheduleInfoId = id;
                let dateStr = $(e.target).attr('datestr');
                this.changeDateStr = dateStr;
                let roleId = this.$store.get('roleId');
                // 如果是值班站长只能操作以后的排班
                // 最多可修改上一个月的排班
                let date1 = new Date();
                let year1 = date1.getFullYear();
                let month1 = date1.getMonth() + 1;
                let day1 = date1.getDate();
                let date2 = new Date(dateStr);
                let year2 = date2.getFullYear();
                let month2 = date2.getMonth() + 1;
                if(month1 - month2 > 1 || year2> year1){
                    return;
                }
                if(month1 === 1 && (month2 !== 12 || year1 - year2 !== 1)){
                    return;
                }
                if(new Date(year1 + '-' + month1 + '-' + day1) >= new Date(dateStr) && roleId === 4){
                    return;
                }
                let containerW = $('.container').offset().left;
                let left = obj.offset().left - containerW;
                let top = obj.offset().top - 20;
                $('.vocationDiv').css({'left': left + 'px', 'top': top + 'px'});                
                //防止点击自己弹框消失
                e.stopPropagation();
                this.showMenu = true;
                this.currentId = parseInt(obj.siblings('.scheduleName').attr('id'));
                let backup = parseInt(obj.parent().attr('backup'));
                this.backup = backup ? false : true;
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
                console.log(date);
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
                console.log(111)
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
                let obj = $(e.target).parent();
                if(!obj.attr('style')){
                    return;
                }
                let id = parseInt(obj.attr('id'));
                let index = obj.closest('tr').index();
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
            },
            //  获取年假余量
            getAnnualHoliday: async function () {
                this.modal.annualLeave = true; 
                this.leaveType = 1;
                let backup = parseInt($('#' + this.scheduleInfoId).parent().attr('backup'))
                !backup && this.getBackupUser();
                let response = await getAnnualHoliday(this.currentId);
                if(!response){
                    return;
                }
                if(response.meta.code === 0){
                    let data = response.data;
                    this.annualHoliday = data.limit - data.consumed;
                } else {
                    this.$Message.error('获取年假余量失败');
                }
                this.currentId = null;
            },
            // 假期编辑
            updateHoliday: function () {
                this.modal.editVocation = true; 
                this.leaveType = 2;
                this.getBackupUser();
            },
            // 班次变更
            changeClass: async function () {
                this.modal.shiftChange = true; 
                this.leaveType = 3;
                let suiteId = parseInt($('#'+ this.scheduleInfoId).parent().attr('suiteid'));
                if(!suiteId){
                    return;
                }
                let response = await getClass(suiteId);
                if(!response){
                    return;
                }
                if(response.meta.code === 0){
                    this.suites = response.data.dutyclass;
                    return;
                } 
                this.$Message.error('获取班次失败');
            },
            //  获取病假余量
            getSickleft: async function () {
                if(this.subType == 1){
                    let response = await getSickleft(this.scheduleInfoId);
                    if(!response){
                        return;
                    }
                    if(response.meta.code === 0){
                        let data = response.data;
                        this.sickleft = response.data;
                    } else {
                        this.$Message.error('获取年假余量失败');
                    }
                }
            },
            //  导出个人
            exportImg: async function () {
                let data = this.getQueryDate();
                if(!data){
                    return;
                }
                await exportImg(data);
            },
            //  获取日期
            getQueryDate: function () {
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
                return data;
            },
            // 撤销
            handleCancelLeave: async function () {
                let data = {
                    scheduleInfoId: this.scheduleInfoId
                };
                let response = await cancelLeave(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.getScheduleInfo();
                    return;
                } 
                this.$Message.error(message);
            },
            // 替班
            handleInstead: function () {
                this.modal.substitute = true; 
                this.leaveType = 7;
                this.getBackupUser();
            },
            // 调离
            handleTransfer: function () {
                this.modal.transfer = true; 
                this.leaveType = 8;
                this.getBackupUser();
            },
            // 排班表格滚动事件
            doScroll: function () {
                //固定和滚动
                let rightInner = $('.right .inner');
                let top = rightInner.scrollTop();
                let left = rightInner.scrollLeft();
                let leftInner = $('.left .inner');
                let head = $('.right .head');
                leftInner.scrollTop(top);
                head.scrollLeft(left);
            },
            // 换班
            changeSchedule: async function () {
                let data = {
                    startDateStr: this.changeDateStr,
                    employeeCard: this.employeeCard,
                    changeEmployeeCard: this.changeEmployeeCard
                }
                let response = await changeSchedule(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.modal.scheduleChange = false;
                    this.getScheduleInfo();
                    return;
                }
                this.$Message.error(message);
            }
        }        
    };
</script>
<style scoped>
    @import "../assets/css/index.css";
</style>
