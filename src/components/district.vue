<template>
    <div class="stationArea">
        <div class="content-block">
            <div class="blockheader">
                <span class="listBlockSpan changeStationName">
                    {{item.districtName}}
                </span>
                <div class="rgbutton">
                    <Dropdown>
                        <a>
                            <span class="white">操作</span>
                            <Icon type="arrow-down-b"></Icon>
                        </a>
                        <DropdownMenu slot="list">
                            <DropdownItem><a @click="beforeUpdateDistrice">修改站区</a></DropdownItem>
                            <DropdownItem><a @click="modal.addStation = true">添加站点</a></DropdownItem>
                            <DropdownItem><a class="red" @click="beforeDeleteDistrict">删除站区</a></DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div class="blockcontent">
                <ul class="blockul">
                    <li v-for="(item, index) in stations" :key="index">
                        <span class="blockspan" v-show="!(editStation && currentStation === item.id)">{{item.stationName}}</span>
                        <input type="text" v-model.trim="editStationName" v-show="editStation && currentStation === item.id" @blur="updateStation(item.id)" style="margin-left:5px;"/>
                        <a class="icon-1 delete" @click="beforeDeleteStation(item.id)"></a>
                        <a class="icon-4 edit" @click="beforeUpdateStation(item)"></a>
                    </li>
                </ul>
            </div>
        </div>
        <!--修改站区弹框-->
        <Modal
            @on-ok="updateDistrict"
            :loading="true"
            title="修改站区"
            v-model="modal.updateDistrict"
            on-cancel="cancel">
            <Form :label-width="80">
                <FormItem label="线别：">
                    <i-input v-model.trim="lineNum" clearable></i-input>
                </FormItem>
                <FormItem label="站区名称：">
                    <i-input v-model.trim="districtName" clearable></i-input>
                </FormItem>
                <FormItem label="站区说明：">
                    <i-input type="textarea" :rows="2" v-model.trim="content" clearable></i-input>
                </FormItem>
            </Form>
        </Modal>
        <!--添加站点弹框-->
        <Modal
            @on-ok="addStation"
            :loading="true"
            title="添加站点"
            v-model="modal.addStation"
            on-cancel="cancel">
            <Form :label-width="80">
                <FormItem label="站点名称：">
                    <i-input v-model.trim="addStationName" clearable></i-input>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
    import {deleteDistrict, getStations, addStation, updateDistrict, deleteStation, updateStation, getUser} from "../api/commonAPI";
    export default {
        data:function(){
            return{ 
                //  模态框显示状态
                modal: {
                    addStation: false,
                    updateDistrict: false,
                    setUserManager: false,
                },   
                editStation: false,
                stations: [],               //  站点
                stationObj: {
                    districtId: null,
                    stationName: ''
                },
                blockSpanList:[],
                addStationName:'',
                editStationName: '',
                districtName:'',
                content: '',
                lineNum: '',
                users:[],
                currentStation: null,
            }
        },
        props:['item'],
        created: function () {
            this.getStations(this.item.id);
        },
        methods:{
            //  获取用户
            getUser: async function () {
                
            },
            //  修改站区
            beforeUpdateDistrice: function () {
                let item = this.item;
                this.districtName = item.districtName;
                this.lineNum = item.lineNumber;
                this.content = item.content;
                this.modal.updateDistrict = true;
            },
            updateDistrict: async function(){
                let districtName = this.districtName;
                let lineNum = this.lineNum;
                if( !districtName || !lineNum){
                    this.$Message.warning('线别或者站区名称不能为空');
                    return;
                }
                let data = {
                    lineNumber: lineNum,
                    districtName: districtName,
                };
                if(this.content){
                    data.content = this.content;
                }
                let response = await updateDistrict(this.item.id, data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.modal.updateDistrict = false;
                    this.$Message.success(message);
                    this.item.districtName = districtName;
                    this.item.lineNumber = lineNum;
                    this.item.content = this.content;
                    this.lineNum = '';
                    this.districtName = '';
                    this.content = '';
                    return;
                } 
                this.$Message.error(mesage);
            },
            //  删除站区
            beforeDeleteDistrict: function () {
                this.$Modal.confirm({
                    content: '<p>确定删除该站区吗？</p>',
                    onOk: () => {
                        this.deleteDistrict(this.item.id);
                    }
                });
            },
            deleteDistrict: async function(id) {
                let response = await deleteDistrict(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.$emit('deleteDistrict', response.data);
                    return;
                }
                this.$Message.error(message);
            },
            //  获取站点
            getStations: async function (id) {
                let response = await getStations(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.stations = response.data;
                    return;
                }
                this.$Message.error(message);
            },
            //  添加站点
            addStation: async function () {
                let name = this.addStationName;
                if(name === ''){
                    this.$Message.warning('站点名称不能为空');
                    return;
                }
                let data = {
                    districtId: this.item.id,
                    stationName: name
                }
                let response = await addStation(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.stations = response.data;
                    this.addStationName = '';
                    return;
                } else {
                    this.$Message.error(message); 
                }
                this.modal.addStation = false;
            },
            //  删除站点
            beforeDeleteStation: function(id){
                this.$Modal.confirm({
                    content: '<p>确定删除该站点吗？</p>',
                    onOk: () => {
                        this.deleteStation(id);
                    }
                });
            },
            deleteStation: async function (id) {
                let response = await deleteStation(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.stations = response.data;
                    return;
                }
                this.$Message.error(message);
            },
            //  编辑站点
            beforeUpdateStation: function(item){
                this.editStationName = item.stationName;
                this.currentStation = item.id;
                this.editStation = true;
            },
            updateStation: async function (id) {
                let name = this.editStationName;
                if(name === ''){
                    this.$Message.warning('站点名称不能为空');
                    return;
                }
                let data = {
                    districtId: this.item.id,
                    stationName: name
                }
                
                let response = await updateStation(id, data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.stations = response.data;
                    this.editStationName = '';
                } else {
                    this.$Message.error(message);
                }
                this.editStation = false;
            },
            // 取消设置
            cancel: function () {
                this.addStationName = '';
                this.editStationName = '';
                this.lineNum = '';
                this.districtName = '';
                this.content = '';
                $('.activeSpan').removeClass('activeSpan');
                this.currentId ='';
            }
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>