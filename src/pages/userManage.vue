<template>
    <div class="container">
        <form id="userForm">
            <div class="content-header">
                <div class="float-left">
                    <button class="btnDefault bgGreen mansgebutton" type="button" @click="addPersonModal = true">新增人员</button>
                    <a class="btnDefault" href="#" data-toggle="modal" data-target="#export" v-show="roleId===1||roleId===2" @click="importUserModal = true">导入</a>
                    <a class="btnDefault" @click="downloadTemplate">模板</a>
                </div>
                <div class=" float-right">
                    <div class="search-input float-left">
                        <span class="icon-5"></span>
                        <input type="text" placeholder="按员工卡号查询" name="roleName" v-model.trim="userCardNo">
                    </div>
                    <a class="btnDefault bgBlue queryBtn" @click="getUserList">查询</a>
                </div>
                <div class="clear"></div>
            </div>
            <!-- 表格 start -->
            <div class="wrapper">
                <div class="choicebox">
                    <CheckboxGroup>
                        <Checkbox  v-for="(item,index) in tableItem" :key="index" :label="item.name" v-model="item.ifShow"></Checkbox>
                    </CheckboxGroup>
                </div>
                <div class="table">
                    <table id="userTable">
                        <thead>
                            <tr>
                                <th width="120">操作</th>
                                <th width="80">员工卡号</th>
                                <th width="80">姓名</th>
                                <th width="80">性别</th>
                                <th width="80">年龄</th>
                                <th width="80">电话</th>
                                <th width="80">生日</th>
                                <th width="80">岗位</th>
                                <th width="80">站点</th>
                                <th width="80">站区</th>
                                <th width="80">是否备班人员</th>
                                <th width="80" v-show="tableItem[0].ifShow">身份证</th>
                                <th width="120" v-show="tableItem[1].ifShow">入职时间</th>
                                <th width="120" v-show="tableItem[2].ifShow">参加工作时间</th>
                                <th width="80" v-show="tableItem[3].ifShow">婚姻状况</th>
                                <th width="80" v-show="tableItem[4].ifShow">有无子女</th>
                                <th width="80" v-show="tableItem[5].ifShow">学历</th>
                                <th width="80" v-show="tableItem[6].ifShow">政治面貌</th>
                                <th width="120" v-show="tableItem[7].ifShow">入党时间</th>
                                <th width="200" v-show="tableItem[8].ifShow">住址</th>
                                <th width="80" v-show="tableItem[9].ifShow">站务员证书编号</th>
                                <th width="80" v-show="tableItem[10].ifShow">站务员证书等级</th>
                                <th width="80" v-show="tableItem[11].ifShow">人员编码</th>
                                <th width="80" v-show="tableItem[12].ifShow">消防证书编号</th>
                                <th width="80" v-show="tableItem[13].ifShow">综控员证书编号</th>
                                <th width="80" v-show="tableItem[14].ifShow">综控员证书级别</th>
                            </tr>
                        </thead>
                        <tbody id="userDataTable">
                            <tr v-for="(item,index) in userList" :key='index' :id="index+'-'+item.id">
                                <td>
                                    <a style="margin-right: 5px; color: #0000FF" @click="removeLine(item)">删除</a>
                                    <a style="color: #0000FF" @click="editPersonMethod(item)">修改</a>
                                </td>
                                <td>{{item.employeeCard}}</td>
                                <td>{{item.userName}}</td>
                                <td>{{item.gender}}</td>
                                <td>{{countAge(item.idCardNumber) || ''}}</td>
                                <td>{{item.phoneNumber}}</td>
                                <td>{{item.birthday}}</td>
                                <td>{{item.positionName}}</td>
                                <td>{{item.stationName}}</td>
                                <td>{{item.districtName}}</td>
                                <td>{{item.backup === 1 ? '是' : '否'}}</td>
                                <td v-show="tableItem[0].ifShow">{{item.idCardNumber}}</td>
                                <td v-show="tableItem[1].ifShow">{{item.entryDate}}</td>
                                <td v-show="tableItem[2].ifShow">{{item.beginWorkDate}}</td>
                                <td v-show="tableItem[3].ifShow">{{item.isMarried}}</td>
                                <td v-show="tableItem[4].ifShow">{{(item.hasChild || 0) + '个'}}</td>
                                <td v-show="tableItem[5].ifShow">{{item.eduBackGround}}</td>
                                <td v-show="tableItem[6].ifShow">{{item.partyMember}}</td>
                                <td v-show="tableItem[7].ifShow">{{item.joinDate}}</td>
                                <td v-show="tableItem[8].ifShow">{{item.homeAddress}}</td>
                                <td v-show="tableItem[9].ifShow">{{item.certNo}}</td>
                                <td v-show="tableItem[10].ifShow">{{item.certLevel}}</td>
                                <td v-show="tableItem[11].ifShow">{{item.employeeCode}}</td>
                                <td v-show="tableItem[12].ifShow">{{item.xfzNo}}</td>
                                <td v-show="tableItem[13].ifShow">{{item.zwyNo}}</td>
                                <td v-show="tableItem[14].ifShow">{{item.zwyLevel}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <Page :total="dataCount" :current.sync='currentPage' :page-size="pageSize" show-total class="paging" @on-change="changePage"></Page>
            <!-- 表格 end -->
        </form>
        <!--新增人员-->
        <Modal class="usermanage-model"
            title="新增人员"
            v-model="addPersonModal"
            width="800"
            :loading="true"
            @on-ok="addUser('addUserData')"
            @on-cancel="cancel('addUserData')"
            :mask-closable="false">
            <Form ref="addUserData" :model="addUserData" :label-width="120" :rules="rule">
                <FormItem label="员工卡号" prop="employeeCard" class="userModal">
                    <i-input v-model="addUserData.employeeCard"></i-input>
                </FormItem>
                <FormItem label="人员编码" prop="employeeCode" class="userModal">
                    <i-input  v-model="addUserData.employeeCode"></i-input>
                </FormItem>
                <FormItem label="姓名" prop="userName" class="userModal">
                    <i-input v-model="addUserData.userName"></i-input>
                </FormItem>
                <FormItem label="密码" prop="password" class="userModal">
                    <i-input v-model="addUserData.password" placeholder="请记录此密码作为下次登录用"></i-input>
                </FormItem>
                <FormItem label="站区" prop="districtId" class="userModal"  v-show="showDistrict">
                    <Select v-model="addUserData.districtId" @on-change="getAllStations(addUserData.districtId)">
                        <Option v-for="(item,index) in districts" :value="item.id" :key="index">{{item.districtName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="岗位" prop="positionId" class="userModal">
                    <Select v-model="addUserData.positionId" @on-change="chosePost(addUserData.positionId)">
                        <Option v-for="(item,index) in position" :value="item.id" :key="index">{{item.positionName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="站点" prop="stationId" class="userModal"  v-show="showStation">
                    <Select v-model="addUserData.stationId" clearable>
                            <Option v-for="(item,index) in stations " :value="item.id" :key="index">{{item.stationName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="角色" prop="roleId" class="userModal">
                    <Select v-model="addUserData.roleId">
                        <Option v-for="(item,index) in roles" :value="item.id" :key="index">{{item.name}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="手机号" prop="phoneNumber" class="userModal">
                    <i-input v-model="addUserData.phoneNumber"></i-input>
                </FormItem>
                <FormItem label="身份证" prop="idCardNumber" class="userModal">
                    <i-input  v-model="addUserData.idCardNumber"></i-input>
                </FormItem>
                <FormItem label="入职时间" prop="entryDate" class="userModal">
                    <DatePicker v-model="addUserData.entryDate" type="date" placeholder="请选择入职时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="参加工作时间" prop="beginWorkDate" class="userModal">
                    <DatePicker v-model="addUserData.beginWorkDate" type="date" placeholder="请选择参加工作时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="婚否" prop="isMarried" class="userModal">
                    <Select  v-model="addUserData.isMarried">
                        <Option value="已婚">已婚</Option>
                        <Option value="未婚">未婚</Option>
                    </Select>
                </FormItem>
                <FormItem label="子女个数" prop="hasChild" class="userModal">
                    <Select v-model="addUserData.hasChild">
                        <Option value="0">0个</Option>
                        <Option value="1">1个</Option>
                        <Option value="2">2个</Option>
                        <Option value="3">3个</Option>
                    </Select>
                </FormItem>
                <FormItem label="学历" prop="eduBackGround" class="userModal">
                    <Select v-model="addUserData.eduBackGround">
                        <Option value="高中以下">高中以下</Option>
                        <Option value="大专">大专</Option>
                        <Option value="本科">本科</Option>
                        <Option value="硕士">硕士</Option>
                        <Option value="博士以上">博士以上</Option>
                    </Select>
                </FormItem>
                <FormItem label="政治面貌" prop="partyMember" class="userModal">
                    <Select v-model="addUserData.partyMember">
                        <Option value="群众">群众</Option>
                        <Option value="共青团员">共青团员</Option>
                        <Option value="共产党员">共产党员</Option>
                        <Option value="民主党派">民主党派</Option>
                    </Select>
                </FormItem>
                <FormItem label="入党时间" prop="joinDate" class="userModal">
                    <DatePicker v-model="addUserData.joinDate" type="date" placeholder="请选择入党时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="站务员证书编号" prop="certNo" class="userModal">
                    <i-input v-model="addUserData.certNo"></i-input>
                </FormItem>
                <FormItem label="站务员证等级" prop="certLevel" class="userModal">
                    <i-input v-model="addUserData.certLevel"></i-input>
                </FormItem>
                <FormItem label="住址" prop="homeAddress" class="userModal">
                    <i-input  v-model="addUserData.homeAddress"></i-input>
                </FormItem>
                <FormItem label="消防证书编号" prop="xfzNo" class="userModal">
                    <i-input  v-model="addUserData.xfzNo"></i-input>
                </FormItem>
                <FormItem label="综控员证书编号" prop="zwyNo" class="userModal">
                    <i-input v-model="addUserData.zwyNo"></i-input>
                </FormItem>
                <FormItem label="综控员证书级别" prop="zwyLevel" class="userModal">
                    <i-input v-model="addUserData.zwyLevel"></i-input>
                </FormItem>
                <div class="clear"></div>
            </Form>
        </Modal>
        <!--编辑人员 @on-cancel="cancel('editUser')"-->
        <Modal class="usermanage-model"
            title="编辑人员"
            v-model="editPersonModal"
            width="800"
            @on-ok="editPerson('editUser')"
            :loading="true"
            :mask-closable="false">
            <Form ref="editUser" :model="editUser" :label-width="120" :rules="rule">
                <FormItem label="员工卡号" prop="employeeCard" class="userModal">
                    <i-input v-model="editUser.employeeCard"></i-input>
                </FormItem>
                <FormItem label="人员编码" prop="employeeCode" class="userModal">
                    <i-input  v-model="editUser.employeeCode"></i-input>
                </FormItem>
                <FormItem label="姓名" prop="userName" class="userModal">
                    <i-input v-model="editUser.userName"></i-input>
                </FormItem>
                <FormItem label="密码" prop="password" class="userModal">
                    <i-input v-model="editUser.password" placeholder="请记录此密码作为下次登录用"></i-input>
                </FormItem>
                <FormItem label="站区" prop="districtId" class="userModal" v-show="showDistrict">
                    <Select v-model="editUser.districtId" @on-change="getAllStations(editUser.districtId)">
                        <Option v-for="(item,index) in districts" :value="item.id" :key="index">{{item.districtName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="岗位" class="userModal">
                    <Select v-model="editUser.positionId" @on-change="chosePost(editUser.positionId)">
                        <Option v-for="(item,index) in position" :value="item.id" :key="index">{{item.positionName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="站点" prop="stationId" class="userModal" v-show="showStation">
                    <Select v-model="editUser.stationId" clearable>
                        <Option v-for="(item,index) in stations " :value="item.id" :key="index">{{item.stationName}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="角色" prop="roleId" class="userModal">
                    <Select v-model="editUser.roleId">
                        <Option v-for="(item,index) in roles" :value="item.id" :key="index">{{item.name}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="手机号" prop="phoneNumber" class="userModal">
                    <i-input v-model="editUser.phoneNumber"></i-input>
                </FormItem>
                <FormItem label="身份证" prop="idCardNumber" class="userModal">
                    <i-input  v-model="editUser.idCardNumber"></i-input>
                </FormItem>
                <FormItem label="入职时间" prop="entryDate" class="userModal">
                    <DatePicker v-model="editUser.entryDate" type="date" placeholder="请选择入职时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="参加工作时间" prop="beginWorkDate" class="userModal">
                    <DatePicker v-model="editUser.beginWorkDate" type="date" placeholder="请选择参加工作时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="婚否" prop="isMarried" class="userModal">
                    <Select  v-model="editUser.isMarried">
                        <Option value="1">已婚</Option>
                        <Option value="0">未婚</Option>
                    </Select>
                </FormItem>
                <FormItem label="子女个数" prop="hasChild" class="userModal">
                    <Select v-model="editUser.hasChild">
                        <Option value="0">0个</Option>
                        <Option value="1">1个</Option>
                        <Option value="2">2个</Option>
                        <Option value="3">3个</Option>
                    </Select>
                </FormItem>
                <FormItem label="学历" prop="eduBackGround" class="userModal">
                    <Select v-model="editUser.eduBackGround">
                        <Option value="高中以下">高中以下</Option>
                        <Option value="大专">大专</Option>
                        <Option value="本科">本科</Option>
                        <Option value="硕士">硕士</Option>
                        <Option value="博士以上">博士以上</Option>
                    </Select>
                </FormItem>
                <FormItem label="政治面貌" prop="partyMember" class="userModal">
                    <Select v-model="editUser.partyMember">
                        <Option value="群众">群众</Option>
                        <Option value="共青团员">共青团员</Option>
                        <Option value="共产党员">共产党员</Option>
                        <Option value="民主党派">民主党派</Option>
                    </Select>
                </FormItem>
                <FormItem label="入党时间" prop="joinDate" class="userModal">
                    <DatePicker v-model="editUser.joinDate" type="date" placeholder="请选择入党时间" clearable></DatePicker>
                </FormItem>
                <FormItem label="站务员证书编号" prop="certNo" class="userModal">
                    <i-input v-model="editUser.certNo"></i-input>
                </FormItem>
                <FormItem label="站务员证等级" prop="certLevel" class="userModal">
                    <i-input v-model="editUser.certLevel"></i-input>
                </FormItem>
                <FormItem label="住址" prop="homeAddress" class="userModal">
                    <i-input  v-model="editUser.homeAddress"></i-input>
                </FormItem>
                <FormItem label="消防证书编号" prop="xfzNo" class="userModal">
                    <i-input  v-model="editUser.xfzNo"></i-input>
                </FormItem>
                <FormItem label="综控员证书编号" prop="zwyNo" class="userModal">
                    <i-input v-model="editUser.zwyNo"></i-input>
                </FormItem>
                <FormItem label="综控员证书级别" prop="zwyLevel" class="userModal">
                    <i-input v-model="editUser.zwyLevel"></i-input>
                </FormItem>
                <div class="clear"></div>
            </Form>
        </Modal>
        <!--导入人员-->
        <Modal
            v-model="importUserModal"
            title="导入人员"
            @on-ok="handleImportUsers"
            @on-cancel="cancelImport"
            :loading="true">
            <Form :label-width="80" id="form">
                <FormItem label="选择文件：" id="selectFile">
                    <button type="button" class="btnDefault">选择文件</button>
                    <input type="file" id="userFile" name="file" @change="selectFile">
                    <span>{{fileName}}</span>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
    import {getAllPost} from '@/api/api';
    import {getDistricts, getStations, addUser, getRole, updateUser, getUser, deleteUser, importUsers} from '@/api/commonAPI';
    export default {
        data: function () {
            return {
                fileName: '',
                importUserModal: false,
                // 站区
                districts:[],
                // 岗位
                position:[],
                // 站点
                stations:[],
                // 角色列表
                roles:[],
                // 当前角色
                roleId: this.$store.get('roleId'),
                // 修改用户当前id
                EditId:null,
                // 导入按钮
                userPort: true,
                // 初始化信息总条数
                dataCount: 0,
                // 每页显示条数
                pageSize:10,
                // 获取userList
                historyUserList:[],
                // 当前显示页数
                currentPage:1,
                showStation:true,
                userCardNo:'',
                showDistrict:false,
                addPersonModal: false,
                editPersonModal: false,
                districtId: this.$store.get('districtId'),
                stationId: this.$store.get('stationId'),
                positionId: this.$store.get('positionId'),
                districtName: this.$store.get('districtName'),
                targetId:'',
                tableItem: [
                    {
                        name: '身份证',
                        ifShow: false
                    },
                    {
                        name: '入职时间',
                        ifShow: false
                    },
                     {
                        name: '参加工作时间',
                        ifShow: false
                    },
                    {
                        name: '婚姻状况',
                        ifShow: false
                    },
                    {
                        name: '有无子女',
                        ifShow: false
                    },
                    {
                        name: '学历',
                        ifShow: false
                    },
                    {
                        name: '政治面貌',
                        ifShow: false
                    },
                    {
                        name: '入党时间',
                        ifShow: false
                    },
                    {
                        name: '住址',
                        ifShow: false
                    },
                    {
                        name: '站务员证书编号',
                        ifShow: false
                    },
                    {
                        name: '站务员证书等级',
                        ifShow: false
                    },
                    {
                        name: '人员编码',
                        ifShow: false
                    },
                    {
                        name: '消防证书编号',
                        ifShow: false
                    },
                    {
                        name: '综控员证书编号',
                        ifShow: false
                    },
                    {
                        name: '综控员证书级别',
                        ifShow: false
                    },
                ],
                rule:{
                   entryDate: [{type: 'date',required: true, message: '入职时间不能为空', trigger: 'change' }],
                   beginWorkDate: [{type: 'date',required: true, message: '参加工作时间不能为空', trigger: 'change' }],
                   userName: [{required: true, message: '姓名不能为空', trigger: 'blur' }],
                   roleId: [{required: true, type: 'integer', message: '角色不能为空', trigger: 'change' }],
                   districtId: [{required: true, type: 'integer', message: '站区不能为空', trigger: 'change' }],
                   password: [{required: true, message: '密码不能为空', trigger: 'blur' }],
                   phoneNumber: [{required: true, message: '手机号不能为空', trigger: 'blur' }],
                   idCardNumber: [{required: true, message: '身份证不能为空', trigger: 'blur' }],
                   homeAddress: [{required: true, message: '住址不能为空', trigger: 'blur' }]
                },
                userList:[],
                selectedItmes: [],
                addUserData: {
                    employeeCard: '',
                    employeeCode: '',
                    userName: '',
                    districtId: this.$store.get('districtId'),
                    stationId: null,
                    positionId: null,
                    password: '',
                    roleId: null,
                    phoneNumber: '',
                    idCardNumber: '',
                    entryDate: null,
                    beginWorkDate: null,
                    isMarried: '',
                    hasChild: '',
                    eduBackGround: '',
                    partyMember: '',
                    joinDate: null,
                    certNo: '',
                    certLevel: '',
                    homeAddress: '',
                    xfzNo: '',
                    zwyNo: '',
                    zwyLevel: ''
                },
                editUser: {}
            }
        },
        mounted: function () {
            // 获取站区/站点
            this.request();
            // 获取角色
            this.getRole();
            // 获取用户列表
            this.getUserList();
            // 站区长登录时获取岗位
            this.getPosts();
        },
        methods:{
            // 改变页数
            changePage:function(index){
                var _start = ( index - 1 ) * this.pageSize;
                var _end = index * this.pageSize;
                this.userList = this.historyUserList.slice(_start,_end);
                this.currentPage = index;
            },
            // 获取用户列表
            getUserList: async function () {
                let data = {
                   districtId: this.districtId,
                   stationId: this.stationId,
                   positionId: this.positionId
                }
                let employeeCard = this.userCardNo;
                employeeCard && (data.employeeCard = employeeCard);
                let response = await getUser(data);
                if (response.meta.code !== 0) {
                    this.$Loading.error();
                    this.$Message.error(response.meta.message);
                }else{
                    this.$Loading.finish();
                    // 获取分页
                    this.historyUserList = response.data;
                    this.dataCount = response.data.length;
                    this.currentPage = 1;
                    if(this.historyUserList.length < this.pageSize){
                        this.userList = this.historyUserList;
                    }else{
                        this.userList = this.historyUserList.slice(0,this.pageSize);
                    }
                }
            },
            // 获取站区/站点
            request: async function(){
                if(this.roleId === 1){
                    this.showDistrict = true;
                    let response = await getDistricts();
                    if (response.meta.code !== 0) {
                        this.$Loading.error();
                        this.$Message.error(response.meta.message);
                    }else{
                        this.$Loading.finish();
                        this.districts = response.data;
                    }
                }else if(this.roleId === 2){
                    this.showDistrict = false;
                    let id = this.districtId;
                    let response = await getStations(id);
                    let message = response.meta.message;
                    if(response.meta.code === 0){
                        this.stations = response.data;
                        return;
                    }
                    this.$Message.error(message);
                    }
            },
            // 获取角色
            getRole: async function (){
                let response = await getRole();
                if (response.meta.code !== 0) {
                    this.$Loading.error();
                    this.$Message.error(response.meta.message);
                }else{
                    this.$Loading.finish();
                    let data = response.data;
                    this.roles = [];
                    for(let obj of data) {
                        if(obj.id === 1){
                            this.roleId === 1 && this.roles.push(obj);
                        } else {
                            this.roles.push(obj);
                        }
                    }
                }
                this.userPort = (this.roleId === 1 ? true : false);
            },
            // 判断是否显示站点
            chosePost: function(id){
                this.showStation = (id === 1 ? false : true);
            },
            // 获取站点和岗位
            getAllStations: async function (id) {
                if (id) {
                    // 清空
                    this.addUserData.stationId = '';
                    this.addUserData.positionId = '';
                    this.stations = [];
                    this.position = [];
                    // 获取站点
                    let response = await getStations(id);
                    let message = response.meta.message;
                    if(response.meta.code === 0){
                        this.stations = response.data;
                    }else{
                        this.$Message.error(message);
                    }
                    // 获取岗位
                    let responsePost = await getAllPost(id);
                    let messagePost = responsePost.meta.message;
                    if(responsePost.meta.code === 0){
                        this.position = responsePost.data;
                        return;
                    }
                    this.$Message.error(messagePost);
                }
            },
            // 站区长登录时获取岗位
            getPosts: async function(){
                if(this.roleId===2){
                    let id = this.districtId;
                    let responsePost = await getAllPost(id);
                    let messagePost = responsePost.meta.message;
                    if(responsePost.meta.code === 0){
                        this.position = responsePost.data;
                        return;
                    }
                    this.$Message.error(messagePost);
                }
            },
            //  删除一行
            removeLine: async function(item){
                var id = item.id;
                let response = await deleteUser(id);
                if (response.meta.code !== 0) {
                    this.$Loading.error();
                    this.$Message.error(response.meta.message);
                }else{
                    this.$Loading.finish();
                    this.userList = response.data;
                    // 获取分页
                    this.historyUserList = response.data;
                    this.dataCount = response.data.length;
                    this.currentPage = 1;
                    if(this.historyUserList.length < this.pageSize){
                        this.userList = this.historyUserList;
                    }else{
                        this.userList = this.historyUserList.slice(0, this.pageSize);
                    }
                    this.$Message.success("删除人员成功");
                } 
            },
             //编辑人员提交验证
            editPerson: function(name){
                let e = window.event;
                let target = $(e.target).parent();
                target.attr('disabled', true);
                setTimeout(function () {
                    target.attr('disabled', false);
                },3000);
                let that = this;
                  this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.editPersonModal = false;
                        this.beforeEditPerson(that, name);
                    } else {
                        this.$Message.error('编辑人员失败');
                    }
                })
            },
            beforeEditPerson: async function (that, name) {
                let data ={};
                 for (let key in that.editUser) {
                    data[key] = that.editUser[key];
                }
                if(that.roleId === 2){
                    data.districtId = that.districtId;
                }else if(that.roleId === 1){
                    data.districtId = that.editUser.districtId;
                }
                
                // 日期类型格式转换
                data.entryDate && (data.entryDate = that.$conversion(data.entryDate));
                data.beginWorkDate && (data.beginWorkDate = that.$conversion(data.beginWorkDate));
                data.joinDate && (data.joinDate = that.$conversion(data.joinDate));
                !data.employeeCard && delete data.employeeCard;
                !data.employeeCode && delete data.employeeCode;
                
                let response = await updateUser(data);
                if (response.meta.code !== 0) {
                    that.$Loading.error();
                    that.$Message.error(response.meta.message);
                }else{
                    that.$Loading.finish();
                     // 获取分页
                    that.userList = [];
                    that.historyUserList = response.data;
                    that.dataCount = response.data.length;
                    if(that.historyUserList.length < that.pageSize){
                        that.userList = that.historyUserList;
                    }else{
                        let start = (that.currentPage-1)*10;
                        let end = (that.currentPage-1)*10 + that.pageSize;
                        that.userList = that.historyUserList.slice(start, end);
                    }
                    that.$Message.success("修改人员成功");
                } 
                that.$refs[name].resetFields();
            },
            // 编辑人员
            editPersonMethod: async function (item) {
                this.showStation = (item.positionName === "替班员" ? false : true);
                // 获取编辑id
                this.EditId = item.id;
                // 判断角色获取站点
                await function () {
                    if(this.roleId === 1){
                        this.getAllStations(this.districtId);
                    }else if(this.roleId === 2){
                        this.getAllStations(item.districtId);
                    }
                }
                
                for (let key in item) {
                    this.editUser[key] = item[key];
                }
                this.editPersonModal = true;
            },
            // 新增人员
            addUser: function (name) {
                let e = window.event;
                let target = $(e.target).parent();
                target.attr('disabled', true);
                setTimeout(function () {
                    target.attr('disabled', false);
                },3000);
                let self = this;
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.addUserFun(name);
                    } 
                })
            },
            addUserFun: async function (name) {
                let data = this.addUserData;
                if(!this.showStation){
                    delete data.stationId;
                }else{
                    data.stationId= this.addUserData.stationId;
                }
                if(this.roleId === 2){
                    data.districtId = this.districtId;
                }else if(this.roleId === 1){
                    data.districtId = this.addUserData.districtId;
                }
                // 日期类型格式转换
                data.entryDate && (data.entryDate = this.$conversion(data.entryDate));
                data.beginWorkDate && (data.beginWorkDate = this.$conversion(data.beginWorkDate));
                data.joinDate && (data.joinDate = this.$conversion(data.joinDate));
                !data.employeeCard && delete data.employeeCard;
                !data.employeeCode && delete data.employeeCode;
                let response = await addUser(data);
                let message = response.meta.message;
                if (response.meta.code === 0) {
                    this.addPersonModal = false;
                    this.$Message.success(message);
                    this.userList = response.data;
                    this.$refs[name].resetFields();
                    this.position = [];
                    this.stations = [];
                    this.historyUserList = response.data;
                    this.dataCount = response.data.length;
                    this.currentPage = 1;
                    if(this.historyUserList.length < this.pageSize){
                        this.userList = this.historyUserList;
                    }else{
                        this.userList = this.historyUserList.slice(0,this.pageSize);
                    }
                    return;
                } 
                this.$Message.error(message);
            },
            // 取消提交清空验证信息
            cancel:function (name){
                this.$refs[name].resetFields();
            },
            // 导入人员
            handleImportUsers: async function () {
                let formData = new FormData('form');
                let file = $('#userFile').get(0).files[0];
                if(!file){
                    this.$Message.warning('请先选择文件');
                    return;
                }
                formData.append('file', file);
                this.fileName = file.name;
                let response = await importUsers(formData);
                if(response.meta.code === 0){
                    this.$Message.success('导入成功');
                } else {
                    this.$Message.error(response.data);
                }
                this.importUserModal = false;
                $('#userFile').val('');
                this.fileName = '';
            },
            //  选择文件
            selectFile: function () {
                let file = $('#userFile').get(0).files[0];
                this.fileName = file.name;
            },
            // 取消导入人员
            cancelImport: function () {
                $('#userFile').val('');
                this.fileName = '';
            },
            // 计算年龄
            countAge: function (idCard) {
                if(!idCard){
                    return;
                }
                let date = new Date();
                let birthYear = parseInt(idCard.substring(6,10));
                return date.getFullYear() - birthYear;
            },
            // 下载模版
            downloadTemplate: function () {
                location.href = 'https://schedule-test.oss-cn-beijing.aliyuncs.com/%E4%BA%BA%E5%91%98%E4%BF%A1%E6%81%AF%E6%A8%A1%E6%9D%BF.xlsx';
            }
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>