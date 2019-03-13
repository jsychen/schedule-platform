<template>
    <div class="container">
        <div class="content-header">
            <Select v-model="position.current" placeholder="请选择岗位" style="margin: 0px 0px 4px 20px " @on-change="getChangeSuite">
                <Option v-for="item in position.data" :value="item.id+'-'+item.backupPosition+'-'+item.positionName" :key="item.id">{{ item.positionName }}</Option>
            </Select>
            <a class="btnDefault bgGreen" @click="modal.addShift=true">新增班制</a>
        </div>
        <div class="myTab">
            <span :class="{'active': suiteId === item.id}" v-for="(item,index) in suites" :key="'tab'+index" @click="swichTab(index)">{{item.dutyName}}</span>
            <div class="line"></div>
        </div>
        <div class="panel-body" v-show = "suitBody">
            <div class="buttonblock"></div>
            <div class="shifts-content">
                <!--班制表-->
                <div class="shiftform">
                    <div class="title">
                        <b>班制表</b>
                        <div class="btn-group">
                            <a class="btnDefault bgGreen" href="javascript:;" @click="beforeUpdateSuite">编辑班制</a>
                            <a class="btnDefault bgRed" href="javascript:;" @click="handleClose()" style="margin-left:8px;">删除班制</a>
                        </div>
                    </div>
                    <ul class="info">
                        <li>
                            <label>班制名称：</label>
                            <span>{{info.dutyName}}</span>
                        </li>
                        <li>
                            <label>站区：</label>
                            <span>{{info.districtName}}</span>
                        </li>
                        <li>
                            <label>站点：</label>
                            <span>{{info.stationName}}</span>
                        </li>
                        <li>
                            <label>周工时下限：</label>
                            <span>{{info.minWorkingHour}}</span>
                        </li>
                        <li>
                            <label>周工时上限：</label>
                            <span>{{info.maxWorkingHour}}</span>
                        </li>
                        <li>
                            <label>每周最少休班：</label>
                            <span>{{info.minWeeklyRestDays}}</span>
                        </li>
                        <li>
                            <label>每周最多休班：</label>
                            <span>{{info.maxWeeklyRestDays}}</span>
                        </li>
                        <li>
                            <label>月工时上限：</label>
                            <span>{{info.monthlyWorkingHourLimit}}</span>
                        </li>
                        <li>
                            <label>年工时上限：</label>
                            <span>{{info.yearlyWorkingHourLimit}}</span>
                        </li>
                    </ul>
                </div>
                <!--24小时值班人数表-->
                <div class="twentyfourform">
                    <div id="echart" v-show="showEchart"></div>
                    <div class="title">
                        <b>24小时值班人数表</b>
                        <div class="btn-group">
                            <a class="btnDefault bgGreen" @click="modal.addTimeSlot=true">新增时间段</a>
                            <a class="btnDefault bgBlue" style="margin-left:10px;" @click="initEchart">方案验算</a>
                        </div>
                    </div>
                    <Table :columns="onDutyColumns" :data="onDutyData"></Table>
                </div>
                <!--班次表-->
                <div class="banciform">
                    <div class="title">
                        <b>班次表</b>
                        <div class="btn-group">
                            <a class="btnDefault bgGreen" @click="modal.addClass=true">新增班次</a>
                        </div>
                    </div>
                    <Table :columns="shiftColumns" :data="dutyData" class="shiftTableColor"></Table>
                </div>
            </div>
        </div>
        <!-- 新增班次表 -->
        <Modal title="新增班次"
            v-model="modal.addClass"
            @on-ok="addClass('addFormValidateClass')"
            @on-cancel="handleCancel('addFormValidateClass')"
            :loading="true">
            <Form ref="addFormValidateClass" :model="addFormValidateClass" :rules="ruleValidate1" :label-width="80">
                <FormItem label="班次名称" prop="dutyName">
                    <Input v-model="addFormValidateClass.dutyName" placeholder=""/>
                </FormItem>
                <FormItem label="班次代号" prop="dutyCode">
                    <Input v-model="addFormValidateClass.dutyCode" placeholder=""/>
                </FormItem>
                <FormItem label="班次颜色" prop="classColor" class="colorLine">
                    <Poptip trigger="click" content="content">
                        <div class="shiftColor"></div>
                        <div class="ivu-form-item-error-tip" v-if="addFormValidateClass.shiftColorConfirn">班次颜色不能为空</div>
                        <div class="shiftColorBox" slot="content">
                            <a v-for="(item, index) in colors" :key="'color' + index" 
                            :style="'background-color:' + item" 
                            :value="item" @click="getBackColor"></a>
                        </div>
                    </Poptip>
                </FormItem>
                <FormItem label="起止时间" prop="timeSlot" element-id="timeSlot">
                    <TimePicker  v-model="addFormValidateClass.startTimeStr" placeholder="选择开始时间" format="HH:mm" @on-change="getsectionTime"></TimePicker> 至 
                    <TimePicker  v-model="addFormValidateClass.endTimeStr" placeholder="选择结束时间" format="HH:mm" @on-change="getsectionTime"></TimePicker>
                    <div class="ivu-form-item-error-tip" v-if="addFormValidateClass.ifTimeSlot">时间段不能为空</div>
                </FormItem>
                <FormItem label="班次间隔" prop="restMinutes">
                    <Input v-model="addFormValidateClass.restMinutes" placeholder=""/>
                </FormItem>
                <FormItem label="班次关联" prop="relevantDuty">
                    <Select v-model="addFormValidateClass.relevantDuty" clearable>
                        <Option v-for="item in dutyData" :value="item.id" :key="item.id">{{ item.dutyName }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="值班人数" prop="userCount">
                    <Input v-model="addFormValidateClass.userCount" placeholder=""/>
                </FormItem>
                <FormItem label="注意事项" prop="comment">
                    <textarea  v-model="addFormValidateClass.comment" placeholder="" class="content"></textarea>
                </FormItem>
            </Form>
        </Modal>
        <!-- 编辑班次表 -->
        <Modal title="编辑班次"
               v-model="modal.editShifyClass"
               :loading="true"
               @on-ok="editShifyClass('editFormValidateClass')"
               @on-cancel="handleCancel('editFormValidateClass')">
            <Form ref="editFormValidateClass" :model="editFormValidateClass" :rules="ruleValidate1" :label-width="80">
                <FormItem label="班次名称" prop="dutyName">
                    <Input v-model="editFormValidateClass.dutyName" placeholder=""/>
                </FormItem>
                <FormItem label="班次代号" prop="dutyCode">
                    <Input v-model="editFormValidateClass.dutyCode" placeholder=""/>
                </FormItem>
                <FormItem label="班次颜色" prop="classColor" class="colorLine">
                    <Poptip trigger="click" content="content">
                        <div class="shiftColor"></div>
                        <div class="ivu-form-item-error-tip" v-if="editFormValidateClass.shiftColorConfirn">班次颜色不能为空</div>
                        <div class="shiftColorBox" slot="content">
                            <a v-for="(item, index) in colors" :key="'color' + index" 
                            :style="'background-color:' + item" 
                            :value="item" @click="getBackColor"></a>
                        </div>
                    </Poptip>
                </FormItem>
                <FormItem label="起止时间" prop="timeSlot" element-id="timeSlot" >
                    <TimePicker  v-model="editFormValidateClass.startTimeStr" placeholder="选择开始时间" format="HH:mm" ></TimePicker>至
                    <TimePicker  v-model="editFormValidateClass.endTimeStr" placeholder="选择结束时间" format="HH:mm" ></TimePicker>
                    <div class="ivu-form-item-error-tip" v-if="editFormValidateClass.ifTimeSlot">时间段不能为空</div>
                </FormItem>
                <FormItem label="班次间隔" prop="restMinutes">
                    <Input v-model="editFormValidateClass.restMinutes" placeholder=""/>
                </FormItem>
                <FormItem label="班次关联" prop="relevantDuty"> 
                    <Select v-model="editFormValidateClass.relevantDuty" clearable>
                        <Option v-for="item in dutyData" :value="item.id" :key="item.id">{{ item.dutyName }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="值班人数" prop="userCount">
                    <Input v-model="editFormValidateClass.userCount" placeholder=""/>
                </FormItem>
                <FormItem label="注意事项" prop="comment">
                    <textarea  v-model="editFormValidateClass.comment" placeholder="" class="content"></textarea>
                </FormItem>
            </Form>
        </Modal>
        <!-- 编辑班制 -->
        <Modal title="编辑班制"
            v-model="modal.editShift"
            :loading="true"
            @on-ok="updateSuite('formValidate')"
            @on-cancel="handleCancel('formValidate')">
            <Form ref="formValidate" :model="formValidate"  :label-width="110">
                <FormItem label="周工时下限：" prop="minWorkingHour">
                    <Input v-model="formValidate.minWorkingHour" placeholder=""/>
                </FormItem>
                <FormItem label="周工时上限：" prop="maxWorkingHour">
                    <Input v-model="formValidate.maxWorkingHour" placeholder=""/>
                </FormItem>
                <FormItem label="每周最少休班：" prop="minWeeklyRestDays">
                    <Input v-model="formValidate.minWeeklyRestDays" placeholder=""/>
                </FormItem>
                <FormItem label="每周最多休班：" prop="maxWeeklyRestDays">
                    <Input v-model="formValidate.maxWeeklyRestDays" placeholder=""/>
                </FormItem>
                <FormItem label="月工时上限：" prop="monthlyWorkingHourLimit">
                    <Input v-model="formValidate.monthlyWorkingHourLimit" placeholder=""/>
                </FormItem>
                <FormItem label="年工时上限：" prop="yearlyWorkingHourLimit">
                    <Input v-model="formValidate.yearlyWorkingHourLimit" placeholder=""/>
                </FormItem>
            </Form>
        </Modal>
        <!-- 新增班制 -->
        <Modal title="新增班制"
            v-model="modal.addShift"
            :loading="true"
            @on-ok="addSuite('addFormValidate')"
            @on-cancel="handleCancel('addFormValidate')">
            <Form ref="addFormValidate" :model="addFormValidate" :label-width="110">
                <FormItem label="班制名称：" prop="dutyName" :rules="{required:true,message:'班制名称不能为空'}">
                    <Input v-model="addFormValidate.dutyName" placeholder=""/>
                </FormItem>
                <FormItem label="是否备班：" prop="backup" :rules="{required:true,message:'是否备班不能为空'}">
                    <Select v-model="addFormValidate.backup" placeholder="请选择">
                        <Option :value="1">是</Option>
                        <Option :value="0">否</Option>
                    </Select>
                </FormItem>
                <FormItem label="站点：" prop="stationId" :rules="{required:true,message:'站点不能为空'}">
                    <Select v-model="addFormValidate.stationId" placeholder="请选择">
                        <Option v-for="(item,index) in stations " :value="item.id" :key="index">{{item.stationName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="周工时下限：" prop="minWorkingHour" :rules="{required:true,message:'周工时下限不能为空不能为空'}">
                    <Input v-model="addFormValidate.minWorkingHour" placeholder=""/>
                </FormItem>
                <FormItem label="周工时上限：" prop="maxWorkingHour" :rules="{required:true,message:'周工时上限不能为空'}">
                    <Input v-model="addFormValidate.maxWorkingHour" placeholder=""/>
                </FormItem>
                <FormItem label="每周最少休班：" prop="minWeeklyRestDays" :rules="{required:true,message:'每周最少休班不能为空'}">
                    <Input v-model="addFormValidate.minWeeklyRestDays" placeholder=""/>
                </FormItem>
                <FormItem label="每周最多休班：" prop="maxWeeklyRestDays" :rules="{required:true,message:'每周最多休班不能为空'}">
                    <Input v-model="addFormValidate.maxWeeklyRestDays" placeholder=""/>
                </FormItem>
                <FormItem label="月工时上限：" prop="monthlyWorkingHourLimit" :rules="{required:true,message:'月工时上限不能为空'}">
                    <Input v-model="addFormValidate.monthlyWorkingHourLimit" placeholder=""/>
                </FormItem>
                <FormItem label="年工时上限：" prop="yearlyWorkingHourLimit" :rules="{required:true,message:'年工时上限不能为空'}">
                    <Input v-model="addFormValidate.yearlyWorkingHourLimit" placeholder=""/>
                </FormItem>
            </Form>
        </Modal>
        <!-- 新增时间段 -->
        <Modal title="新增时间段"
            v-model="modal.addTimeSlot"
            :loading="true"
            @on-ok="addTimeSlot('addTimeValidate')"
            @on-cancel="handleCancelTime('addTimeValidate')">
            <Form ref="addTimeValidate" :model="addTimeValidate" :rules="ruleAddTimeValidate" :label-width="80">
                <FormItem label="时间段" prop="timeSlot" element-id="timeSlot">
                    <TimePicker  v-model="addTimeValidate.startTimeStr" placeholder="选择开始时间" format="HH:mm" ></TimePicker> 至
                    <TimePicker  v-model="addTimeValidate.endTimeStr" placeholder="选择结束时间" format="HH:mm" ></TimePicker>
                    <div class="ivu-form-item-error-tip" v-if="addTimeValidate.ifTimeSlot">时间段不能为空</div>
                </FormItem>
                <FormItem label="值班人数" prop="userCount">
                    <Input v-model="addTimeValidate.userCount" placeholder=""/>
                </FormItem>
            </Form>
        </Modal>
        <!--编辑时间段-->
        <Modal title="编辑时间段"
               v-model="modal.editTimeSlot"
               :loading="true"
               @on-ok="editTimeSlot('editTimeValidate')"
               @on-cancel="handleCancel('editTimeValidate')">
            <Form ref="editTimeValidate" :model="editTimeValidate" :rules="ruleAddTimeValidate" :label-width="80">
                <FormItem label="时间段" prop="timeSlot" element-id="timeSlot">
                    <TimePicker  v-model="editTimeValidate.startTimeStr" placeholder="选择开始时间" format="HH:mm" ></TimePicker> 至
                    <TimePicker  v-model="editTimeValidate.endTimeStr" placeholder="选择结束时间" format="HH:mm" ></TimePicker>
                    <div class="ivu-form-item-error-tip" v-if="editTimeValidate.ifTimeSlot">时间段不能为空</div>
                </FormItem>
                <FormItem label="值班人数" prop="userCount">
                    <Input v-model="editTimeValidate.userCount" placeholder=""/>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script >
import {getAllPost, getSuites, addSuites, getClass, addClass, deteleSuites, deteleClass, updateClass, updateSuites, addPeriod, updatePeriod, detelePeriod} from '@/api/api';
import {stationAreaList, getStations} from '@/api/commonAPI';
let echarts = require('echarts');
export default {
    data:function () {
        return {
            dutyData: [],           //  班次
            onDutyData:[],          // 时间段
            showEchart:false,           //图标显示
            tabModel: 0,
            // 当前站区id
            suiteId:null,
            //  岗位
            position: {
                data: [],
                id: null,
                current: ''
            },
            // 切换tab显示班制内容
            suitBody:true,
            districtId: this.$store.get('districtId'),
            stationId: this.$store.get('stationId'),
            // 当前班次id
            classId:null,
            // 当前时间段id
            currentPeriod: null,
            //  班制
            suites: [],
            //  站点
            stations: [],
            editTime:[],
            addTime:[],
            modal: {
                editShift:false,
                addShift:false,
                addTimeSlot:false,
                editTimeSlot:false,
                editShifyClass:false,
                addClass:false
            },
            positions: [],
            info: {
                dutyName: '',
                backup:null,
                districtId:null,
                districtName: '',
                stationId:null,
                stationName: '',
                positionId:null,
                positionName:'',
                minWorkingHour: '',
                maxWorkingHour: '',
                minWeeklyRestDays: '', 
                maxWeeklyRestDays: '', 
                monthlyWorkingHourLimit: '',
                yearlyWorkingHourLimit: ''                 
            },
            formValidate: {
                minWorkingHour: '',
                maxWorkingHour: '',
                minWeeklyRestDays: '', 
                maxWeeklyRestDays: '', 
                monthlyWorkingHourLimit: '',
                yearlyWorkingHourLimit: ''   
            },
            addTimeValidate:{
                startTimeStr: '',
                endTimeStr: '',
                userCount: null,
                ifTimeSlot: false
            },
            editTimeValidate: {
                startTimeStr: '',
                endTimeStr: '',
                userCount: null,
                ifTimeSlot: false
            },
            addFormValidateClass:{
                dutyName:'',
                dutyCode:'',
                comment:'',
                relevantDuty:null,
                restMinutes:null,
                relevantClassId:null,
                userCount:null,
                ifTimeSlot:false,
                shiftColorConfirn:false,
                startTimeStr:'',
                endTimeStr:'',
            },
            editFormValidateClass:{
                dutyName:'',
                dutyCode:'',
                comment:'',
                relevantDuty:null,
                restMinutes:null,
                relevantClassId:null,
                userCount:null,
                ifTimeSlot:false,
                shiftColorConfirn:false,
                startTimeStr:'',
                endTimeStr:'',
            },
            addFormValidate:{
                dutyName: '',
                backup: null,
                stationId:null,
                minWorkingHour:'',
                maxWorkingHour:'',
                minWeeklyRestDays:'',
                maxWeeklyRestDays:'',
                monthlyWorkingHourLimit:'',
                yearlyWorkingHourLimit:''
            },
            //  新增班制弹框验证
            ruleValidate: {
                dutyName: [
                    { required: true, message: '班制名称不能为空', trigger: 'blur' }
                ],
                station: [
                    { required: true, message: '站点不能为空', trigger: 'change' }
                ],
                minWorkingHour: [
                    { required: true, message: '周工时下限不能为空', trigger: 'blur' }
                ],
                maxWorkingHour: [
                    { required: true, message: '周工时上限不能为空', trigger: 'blur' }
                ],
                minWeeklyRestDays: [
                    { required: true, message: '每周最少修班不能为空', trigger: 'blur' }
                ],
                maxWeeklyRestDays: [
                    { required: true, message: '每周最多休班不能为空', trigger: 'blur' }
                ],
                monthlyWorkingHourLimit: [
                    { required: true, message: '月工时上限不能为空', trigger: 'blur' }
                ],
                yearlyWorkingHourLimit: [
                    { required: true, message: '年工时上限不能为空', trigger: 'blur' }
                ]
            },
            //  新增时间段弹框
            ruleAddTimeValidate: {
                userCount: [
                    { required: true, message: '值班人数不能为空', trigger: 'blur' },
                ]
            },
            //  新增班次弹框
            ruleValidate1: {
                dutyName: [
                    { required: true, message: '班次名称不能为空', trigger: 'blur' }
                ],
                dutyCode:[
                    { required: true, message: '班制代号不能为空', trigger: 'blur' }
                ],
                restMinutes: [
                    { required: true, message: '班次间隔不能为空', trigger: 'blur' }
                ],
                userCount: [
                    { required: true, message: '值班人数不能为空', trigger: 'blur' }
                ]
            },
            //  班次表
            shiftColumns: [
                {
                    title: '班次名称',
                    align: 'center',
                    key: 'dutyName',
                    render: (h, params) => {
                        return h('div', [
                            h('div', {
                                style: {
                                    backgroundColor:params.row.classColor,
                                    color:'white',
                                    lineHeight:'30px',
                                },
                                },params.row.dutyName ),
                        ]);
                    }
                },
                {
                    title: '起止时间',
                    align: 'center',
                    key: 'timeSlot',
                    render: (h, params) => {
                        let beginTimeSlot=params.row.startTimeStr;
                        let endTimeSlot=params.row.endTimeStr;
                        return h('div', [
                            h('span', params.row.startTimeStr),
                            h('span', '-'),
                            h('span', params.row.endTimeStr),
                        ]);
                    }
                },
                {
                    title: '本班工时',
                    align: 'center',
                    key: 'workingLength',
                    render: (h, params) => {
                        return h('div', params.row.workingLength/60 + '小时');
                    }
                },
                {
                    title: '班次间隔',
                    align: 'center',
                    key: 'restMinutes',
                    render: (h, params) => {
                        return h('div', params.row.restMinutes/60 + '小时');
                    }
                },
                {
                    title: '班次关联',
                    align: 'center',
                    key: 'relevantClassName'
                },
                {
                    title: '值班人数',
                    align: 'center',
                    key: 'userCount'
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
                                        this.edite(params.index)
                                    }
                                }
                            }, '编辑'),
                            h('a', {
                                on: {
                                    click: () => {
                                        this.handleDeleteSuite(params.index)
                                    }
                                }
                            }, '删除')
                        ]);
                    }
                }
            ],
            onDutyColumns: [
                {
                    title: '时间段',
                    align: 'center',
                    key: 'timeSlot',
                    render: (h, params) => {
                        let beginTimeSlot=params.row.startTimeStr;
                        let endTimeSlot=params.row.endTimeStr;
                        return h('div', [
                            h('span', beginTimeSlot),
                            h('span', '-'),
                            h('span', endTimeSlot),
                        ]);
                    }
                },
                {
                    title: '值班人数',
                    align: 'center',
                    key: 'userCount'
                },
                {
                    title: '操作',
                    align: 'center',
                    key: 'action',
                    render: (h, params) => {
                        return h('div', [
                            h('a', {
                                style: {
                                    marginRight: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.editpeoplenumber(params.index)
                                    }
                                }
                            }, '编辑'),
                            h('a', {
                                on: {
                                    click: () => {
                                        this.handleDeleteTimeSlot(params.index)
                                    }
                                }
                            }, '删除')
                        ]);
                    }
                }
            ],
            colors: ['rgb(110, 121, 190)', 'rgb(227, 82, 140)', 'rgb(228, 121, 121)', 'rgb(198, 65, 222)', 
            'rgb(62, 152, 175)', 'rgb(41, 173, 125)', 'rgb(119, 85, 247)', 'rgb(59, 199, 85)', 'rgb(214, 129, 73)',
            'rgb(196, 167, 68)', 'rgb(199, 191, 65)', 'rgb(103, 188, 57)']
        }
    },
    mounted: function () {
        //  获取岗位
        this.getAllPost();
        // 获取站点
        this.handleGetStations();
    },
    methods:{
        // 对象深度拷贝
        cloneObj:function(obj){
            var newObj = {};
            if (obj instanceof Array) {
                newObj = [];
            }
            for (var key in obj) {
                var val = obj[key];
                newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。
            }
            return newObj;
        },
        //  获取所有岗位
        getAllPost: async function () {
            let response = await getAllPost(this.districtId);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.position.data = response.data;
                if(response.data.length >0){
                    this.position.current = this.position.data[0].id+'-'+this.position.data[0].backupPosition+'-'+this.position.data[0].positionName;
                    this.getChangeSuite();
                }
                return;
            }
           
            this.$Message.error(message);
        },
        //  切换岗位获取班制
        getChangeSuite: async function () {
            this.tabModel = -1;
            // 方案验算清空
            this.showEchart = false;
            this.suites =[];
            this.dutyData = [],
            this.onDutyData =[],
            this.info = {};
            let that = this;
            let currentPosition = this.position.current.split('-');
            let data = {
                districtId: this.districtId,
                positionId: parseInt(currentPosition[0]),
            }
            let stationId = this.stationId;
            stationId && (data.stationId = stationId);
            let response = await getSuites(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.suites = response.data;
                if(response.data.length > 0){
                    this.suitBody = true;
                    this.suiteId = response.data[0].id;
                }else{
                    this.suitBody = false;
                }
                if(response.data.length>0){
                    this.suiteId = response.data[0].id;
                }else{
                    this.suiteId = null;
                }
                // 显示班制内容
                let obj = this.suites[0]; 
                for(let key in obj){
                    this.info[key] = obj[key];
                }
                this.getClass(this.suiteId);
                return;
            }
            this.$Message.error(message);
        },
        //  切换tab
        swichTab: function (index) {
            this.showEchart = false;
            if (this.suites.length>0){
                let obj = this.suites[index]; 
                for(let key in obj){
                    this.info[key] = obj[key];
                }
                this.suiteId = obj.id;
                this.getClass();
            }
        },
        //  获取站点
        handleGetStations: async function () {
            let id = this.districtId;
            let response = await getStations(id);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.stations = response.data;
                return;
            }
            this.$Message.error(message);
        },
        // 获取班次
        getClass: async function () {
            let suiteId = this.suiteId;
            if (suiteId){
                let response = await getClass(suiteId);
                if (response.meta.code !== 0) {
                    this.$Message.error(response.meta.message);
                }else{
                    this.dutyData = response.data.dutyclass;
                    for(var i = 0;i<response.data.dutyclass.length;i++){
                        let obj = response.data.dutyclass[i].relevant;
                        if(obj != null){
                            this.dutyData[i].relevantClassName = obj.dutyName;
                        }
                    }
                    this.onDutyData = response.data.dutyperiodchecking;
                    // this.getChangeSuite();
                }
            }
        },
        //  新增时间段验证
        addTimeSlot: function (name) {
            let startTime = this.addTimeValidate.startTimeStr;
            let endTime = this.addTimeValidate.endTimeStr;
            if(startTime === '' || endTime === ''){
                this.addTimeValidate.ifTimeSlot = true;
                return;
            } else {
                $('[element-id="timeSlot"]').removeClass('ivu-form-item-error');
                this.addTimeValidate.ifTimeSlot = false;
            }
            this.$refs[name].validate((valid) => {
                if (valid) {
                    let that = this;
                    this.beforeAddTimeSlot(that, name);
                } else {
                    this.$Message.error('新增失败');
                }
                this.addTimeValidate.ifTimeSlot = false;
            })
        },
        beforeAddTimeSlot: async function (that, name) {
            let startTime = that.addTimeValidate.startTimeStr;
            let endTime = that.addTimeValidate.endTimeStr;
            let startTimeInt  = parseInt(startTime.substring(0,2));
            let endTimeInt = parseInt(endTime.substring(0,2));
            // if(startTimeInt > endTimeInt){
            //     this.$Message.warning('开始时间不能大于结束时间');
            //     return;
            // }
            if(endTime === '00:00' &&  endTimeInt < startTimeInt){
                endTime = '24:00';
            }
            let data = {
                suiteId: that.suiteId,
                startTimeStr: startTime,
                endTimeStr: endTime,
                userCount: that.addTimeValidate.userCount,
            }
            let response = await addPeriod(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                that.$Message.success("新增时间段成功");
                that.modal.addTimeSlot = false;
                that.$refs[name].resetFields();
                that.getClass(that);
            } else{
                that.$Message.error(message);
            }
        },
        //  编辑时间段验证
        editTimeSlot:function(name){
            let startTime = this.editTimeValidate.startTimeStr;
            let endTime = this.editTimeValidate.endTimeStr;
            if(startTime === '' || endTime === ''){
                this.editTimeValidate.ifTimeSlot = true;
                return;
            } else {
                $('[element-id="timeSlot"]').removeClass('ivu-form-item-error');
                this.editTimeValidate.ifTimeSlot = false;
            }
            this.$refs[name].validate((valid) => {
                if (valid) {
                    let that = this;
                    this.$options.methods.beforeEditTimeSlot(that, name);
                } else {
                    this.$Message.error('修改失败');
                }
                
            })
        },
        beforeEditTimeSlot: async function (that, name) {
            let startTime = that.editTimeValidate.startTimeStr;
            let endTime = that.editTimeValidate.endTimeStr;
            let startTimeInt  = parseInt(startTime.substring(0,2));
            let endTimeInt = parseInt(endTime.substring(0,2));
            if(endTime === '00:00' &&  endTimeInt < startTimeInt){
                endTime = '24:00';
            }
            // if(startTimeInt > endTimeInt){
            //     that.$Message.warning('开始时间不能大于结束时间');
            //     return;
            // }
            let data = {
                id: that.currentPeriod,
                startTimeStr: startTime,
                endTimeStr: endTime,
                userCount: that.editTimeValidate.userCount
            }
            let response = await updatePeriod(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                that.$Message.success("编辑时间段成功");
                that.getClass(that);
            }else{
                that.$Message.error(message);
            }
            that.modal.editTimeSlot = false;
            that.$refs[name].resetFields();
            that.editTimeValidate.startTimeStr = '';
            that.editTimeValidate.endTimeStr = '';
            that.editTimeValidate.ifTimeSlot = false;
        },
        //  编辑时间段
        editpeoplenumber: function(index) {
            let obj = this.onDutyData[index];
            this.currentPeriod = this.onDutyData[index].id;
            this.modal.editTimeSlot = true;
            this.editTimeValidate.startTimeStr = obj.startTimeStr;
            this.editTimeValidate.endTimeStr = obj.endTimeStr;
            this.editTimeValidate.userCount = obj.userCount.toString();
        },
        //  删除时间段
        handleDeleteTimeSlot: async function (index) {
            let id = this.onDutyData[index].id;
            let response = await detelePeriod(id);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success("删除时间段成功");
                this.getClass(this);
                return;
            }else{
                this.$Message.error(message);
            }
        },
        //  新增班次验证
        addClass: function(name) {
            let that = this;
            if($(".shiftColor").css('background-color')==='rgba(0, 0, 0, 0)'){
                this.addFormValidateClass.shiftColorConfirn = true;
                return false;
            }else{
                this.addFormValidateClass.shiftColorConfirn = false;
            }
            if (this.addFormValidateClass.startTimeStr && this.addFormValidateClass.endTimeStr){
                this.addFormValidateClass.ifTimeSlot = false;
            }else{
                this.addFormValidateClass.ifTimeSlot = true;
                return false;
            }
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.$options.methods.beforeAddClass(that, name);
                } else {
                    this.$Message.error('修改失败');
                }
                this.addFormValidateClass.startTimeStr = '';
                this.addFormValidateClass.endTimeStr = '';
                this.addFormValidateClass.ifTimeSlot = false;
                this.addFormValidateClass.shiftColorConfirn = false;
            })
        },
        beforeAddClass: async function  (that, name) {
            //  let data = that.cloneObj(that.addFormValidateClass);
            let endTime = that.addFormValidateClass.endTimeStr;
            let startTime = that.addFormValidateClass.startTimeStr;
            let startTimeInt  = parseInt(startTime.substring(0,2));
            let endTimeInt = parseInt(endTime.substring(0,2));
            // if(startTimeInt > endTimeInt){
            //     that.$Message.warning('开始时间不能大于结束时间');
            //     return;
            // }
            if(endTime === '00:00' &&  endTimeInt < startTimeInt){
                endTime = '24:00';
            }
             let data = {
                dutyName: that.addFormValidateClass.dutyName,
                dutyCode: that.addFormValidateClass.dutyCode,
                comment: that.addFormValidateClass.comment,
                restMinutes: that.addFormValidateClass.restMinutes*60,
                relevantClassId: that.addFormValidateClass.relevantDuty,
                userCount: that.addFormValidateClass.userCount,
                startTimeStr: startTime,
                endTimeStr: endTime,
             }
             data.suiteId = that.suiteId;
             data.classColor = $(".shiftColor").css('background-color');
            let response = await addClass(data);
            let message = response.meta.message;
             if(response.meta.code === 0){
                 that.$Message.success("新增班次成功");
                 that.getClass(that);
                return;
            }else{
                that.$Message.error(message);
            }
            that.modal.addClass = false;
            that.modal.editShifyClass = false;
            that.$refs[name].resetFields();
            $(".shiftColor").css("background-color","rgba(0, 0, 0, 0)");
        },
        //  编辑班次验证提交
        editShifyClass: function(name) {
            if($(".shiftColor").css('background-color')==='rgba(0, 0, 0, 0)'){
                this.editFormValidateClass.shiftColorConfirn = true;
                return false;
            }else{
                this.editFormValidateClass.shiftColorConfirn = false;
            }
            if (this.editFormValidateClass.startTimeStr && this.editFormValidateClass.endTimeStr){
                this.editFormValidateClass.ifTimeSlot = false;
            }else{
                this.editFormValidateClass.ifTimeSlot = true;
                return false;
            }
            this.$refs[name].validate((valid) => {
                if (valid) {
                    let that = this;
                    this.$options.methods.beforeEditClass(that, name);
                } else {
                    this.$Message.error('修改失败');
                }
            })
        },
        beforeEditClass: async function (that, name) {
            let endTime = that.editFormValidateClass.endTimeStr;
            let startTime = that.editFormValidateClass.startTimeStr;
            let startTimeInt  = parseInt(startTime.substring(0,2));
            let endTimeInt = parseInt(endTime.substring(0,2));
            // if(startTimeInt > endTimeInt){
            //     that.$Message.warning('开始时间不能大于结束时间');
            //     return;
            // }
            if(endTime === '00:00' &&  endTimeInt < startTimeInt){
                endTime = '24:00';
            }
            let data = {
                dutyName: that.editFormValidateClass.dutyName,
                dutyCode: that.editFormValidateClass.dutyCode,
                comment: that.editFormValidateClass.comment,
                restMinutes: that.editFormValidateClass.restMinutes*60,
                relevantClassId: that.editFormValidateClass.relevantDuty,
                userCount: that.editFormValidateClass.userCount,
                startTimeStr: startTime,
                endTimeStr: endTime,
            }
            data.id = that.classId;
            data.classColor = $(".shiftColor").css('background-color');
            let response = await updateClass(data);
            let message = response.meta.message;
            if(response.meta.code === 0){
                that.$Message.success("编辑班次成功");
                that.getClass(that);
            }else{
                that.$Message.error(message);
            }
            that.modal.addClass = false;
            that.modal.editShifyClass = false
            that.$refs[name].resetFields();
            $(".shiftColor").css("background-color","white");
            that.editFormValidateClass.startTimeStr = '';
            that.editFormValidateClass.endTimeStr = '';
            that.editFormValidateClass.ifTimeSlot = false;
            that.editFormValidateClass.shiftColorConfirn = false;
        },
        //  编辑班次
        edite: function(index){
            this.classId= this.dutyData[index].id;
            this.modal.editShifyClass=true;
            let obj = this.dutyData[index];
            for(let key in obj){
                this.editFormValidateClass[key] =  obj[key];
            }
            this.editFormValidateClass.relevantDuty = obj.relevantClassId;
            this.editFormValidateClass.restMinutes = (obj.restMinutes/60).toString();;
            this.editFormValidateClass.userCount = obj.userCount.toString();
            $(".shiftColor").css("background-color",this.dutyData[index].classColor);
        },
        //  删除班次
        handleDeleteSuite: async function (index) {
            let id = this.dutyData[index].id;
            let suiteId = this.suiteId;
            let response = await deteleClass(id,suiteId);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success("删除班次成功");
                this.getClass(this);
                return;
            }else{
                this.$Message.error(message);
            }
        },
        handleCancel: function (name) {
            this.$refs[name].resetFields();
            this.addFormValidateClass.ifTimeSlot = false;
            this.addTimeValidate.ifTimeSlot = false;
            this.addFormValidateClass.shiftColorConfirn = false;
            this.editFormValidateClass.shiftColorConfirn = false;
            $(".shiftColor").css("background-color","rgba(0, 0, 0, 0)");
        },
        handleCancelTime:function(name){
            this.$refs[name].resetFields();
            this.addTimeValidate.ifTimeSlot = false;
            $('[element-id="timeSlot"]').removeClass('ivu-form-item-error');
            $(".shiftColor").css("background-color","white");
        },
        //  图表
        initEchart: function () {
            let myChart = echarts.init(document.getElementById('echart'));
            let arr = [];
            for(let i=1;i<=24;i++){
                let str = i<10 ? '0'+ i +':00' : i + ':00'
                arr.push(str);
            }
            // 指定图表的配置项和数据
            let option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:['值班人数表','班次表']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: arr
                },
                yAxis: {
                    type: 'value',
                    splitLine:{show: false}
                },
                series: [
                    {
                        name:'值班人数表',
                        type:'line',
                        data: this.countOnDutyNum(this.onDutyData)
                    },
                    {
                        name: '班次表',
                        type: 'line',
                        data: this.countOnDutyNum(this.dutyData)
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表
            myChart.setOption(option, true);
            this.showEchart = true;
        },
        //  计算各时间段值班人数
        countOnDutyNum: function (array) {
            let map = new Map();
            for(var i=1;i<=24;i++){
                map.set(i, 0);
            }
            for(let obj of array){
                let arr = [];
                arr.push(obj.startTimeStr);
                arr.push(obj.endTimeStr);
                let n = obj.userCount;
                if(arr[1]<arr[0]){
                    for(let i = parseInt(arr[0])+1;i<=24;i++){
                        map.set(i, map.get(i)+n);
                    }
                    for(let i=1;i<=parseInt(arr[1]);i++){
                        map.set(i, map.get(i)+n);
                    }
                } else {
                    for(let i=parseInt(arr[0])+1;i<=parseInt(arr[1]);i++){
                        map.set(i, map.get(i)+n);
                    }
                }
            }
            let arr = [];
            for(let i=1;i<=24;i++){
                arr.push(map.get(i));
            }
            return arr;
        },
        //  新增班制
        addSuite: function(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    let that = this;
                    this.addSuiteFun(that, name);
                } else {
                    this.$Message.error('新增班制失败');
                    return false;
                }
            })
        },
        addSuiteFun:async function(that, name){
            let currentPosition = that.position.current.split('-');
            let data = that.cloneObj(that.addFormValidate);
            data.positionId = parseInt(currentPosition[0]);
            data.districtId = that.districtId;
            let response = await addSuites(data);   
            let message = response.meta.message;
            if(response.meta.code === 0){
                if (that.suites.length === 0){
                    that.suiteId = response.data.dutysuite.id
                }
                // 显示班制内容
                let obj = response.data.dutysuite; 
                that.suites.push(obj);
                that.suiteId = response.data.dutysuite.id;
                that.getClass();
                for(let key in obj){
                    that.info[key] = obj[key];
                }
                that.$Message.success("新增班制成功");
            }else{
                that.$Message.error(message);
            }
            that.modal.addShift = false;
            that.$refs[name].resetFields();
            that.getChangeSuite();
            // that.stations = [];
        },
        //  删除班制
        handleClose: async function () {
            let id = this.suiteId;
            let response = await deteleSuites(id);
            let message = response.meta.message;
            if(response.meta.code === 0){
                this.$Message.success(message);
                this.getChangeSuite();
                this.tabModel = -1;
                return;
            }
            this.$Message.error(message);
        },
        //  编辑班制取值
        beforeUpdateSuite: function () {
            let obj = this.info; 
            for(let key in obj){
                this.formValidate[key] = obj[key];
            }
            this.modal.editShift = true;
        },
        // 编辑班制验证提交
        updateSuite: function (name) {
            this.$refs[name].validate((valid) => {
                let that = this;
                if (valid) {
                    this.$options.methods.updateSuiteFun(that, name);
                } else {
                    this.$Message.error('修改失败');
                }
            })
        },
        updateSuiteFun: async function (that, name) {
            let data = that.cloneObj(that.formValidate);
            data.id = that.suiteId;
            let response = await updateSuites(data); 
            let message = response.meta.message;
            if(response.meta.code === 0){
                that.info = response.data.dutysuite;
                that.getChangeSuite();
                that.tabModel = -1;
                that.$Message.success("编辑班制成功");
            }else{
                that.$Message.error(message);
            }
            that.$refs[name].resetFields();
            that.modal.editShift=false;
        },
        //  班次选择颜色
        getBackColor:function(){
            var e = e || window.event;
            var target = e.target || e.srcElement;
            var backgroundColor=target.getAttribute("value");
            $(".shiftColor").css("background-color",backgroundColor);
        },
        //  取得工时
        getsectionTime:function(){
            if (this.addFormValidateClass.timeSlotBegin && this.addFormValidateClass.timeSlotEnd){
                let beginTime=parseInt(this.addFormValidateClass.timeSlotBegin.split(":")[0])*60+parseInt(this.addFormValidateClass.timeSlotBegin.split(":")[1]);
                let endTime=parseInt(this.addFormValidateClass.timeSlotEnd.split(":")[0])*60+parseInt(this.addFormValidateClass.timeSlotEnd.split(":")[1]);
                let total=0;
                if (endTime>beginTime){
                    total=endTime-beginTime;
                }else if (endTime<beginTime) {
                    total=endTime-beginTime+1440;
                }
                let totalTime='';
                let totalHour;
                let totalMinute;
                if(total>0){
                    totalHour=parseInt(total/60);
                    totalMinute=total%60;
                    totalTime=totalHour+'小时'+totalMinute+'分钟';
                }else{
                    totalTime=0+'小时'+0+'分钟';
                }
                this.addFormValidateClass.workingLength=totalTime;
            }
            
        },
    }
}
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>