<template>
    <div class="container">
        <div class="content-header">
            <div class="float-left">
                <a class="btnDefault bgBlue" href="javascript:;" @click="updateRole">提交</a>
                <a class="btnback" @click="callback">返回</a>
            </div>
        </div>
        <div class="panel-body">
            <form id="roleForm2" class="form-container">
                <input type="hidden" id="permissionIds" name="permissionIds"/>
                <input type="hidden" name="roleId" id="roleId" value="">
                <div class="form_line">
                    <label class="requireredstar">角色名称：</label>
                    <input type="text" name="roleName" v-model="addroleName">
                    <span style="color: red" v-show="updateRolespan">角色名称不能为空</span>
                </div>
                <div class="form_line">
                    <label class="float-left">角色描述：</label>
                    <textarea class="roleSchemedescription" name="comment"  v-model="addrolecomment"></textarea>
                </div>
                <div class="clear"></div>
            </form>
            <div class="thead">
                <span>模块名称</span>
                <span>职务</span>
            </div>
            <div class="tbody">
                <!--系统设置部分-->
                <div class="permission" v-for="(item, index) in allPermissions" :key="'level1-'+index">
                    <div class="level1">
                        <label>
                            <input type="checkbox" level="1" @click="ckeckBoxAll">
                            <b>{{item.level1}}</b>
                        </label>
                    </div>
                    <div class="level2">
                        <div v-for="(list,index) in item.permisions" :key="'level2-'+index">
                            <label>
                                <input class="levelTwo" type="checkbox" level="2" @click="checkBoxLevelTwo">
                                <b>{{list.level2}}</b>
                            </label>
                            <div class="level3" v-for="permision in list.permisions" :key="'level3-'+permision.id">
                                <label>
                                    <input class= "level4" type="checkbox" :id="permision.id" @click="checkBoxLevelThree">{{permision.name}}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import {} from '@/api/api';
import {addRoler, getAllPermissions} from '@/api/commonAPI';
    export default {
        data:function () {
            return {
                allPermissions: [],                 //  所有权限
                addroleName:'',
                addrolecomment:'',
                updateRolespan: false,
            }
        },
        created: function () {
            this.getAllPermissions();
        },
        methods:{
            //  获取所有的权限列表
            getAllPermissions: async function () {
                let response = await getAllPermissions();
                if(response.meta.code === 0){
                    let data = response.data;
                    let arr = [];
                    for(let key1 in data){
                        let arr2 = [];
                        for(let key2 in data[key1]){
                            arr2.push({
                                level2: key2,
                                permisions: data[key1][key2]
                            })
                        }
                        arr.push({
                            level1: key1,
                            permisions: arr2
                        });
                    }
                    this.allPermissions = arr;
                }
            },
            // 选中level1
            ckeckBoxAll: function (e) {
                let targetNode = e.target.parentNode.parentNode.parentNode.getElementsByTagName('input');
                if(e.target.checked === true){
                    for(var i=1;i<targetNode.length;i++){
                        targetNode[i].checked = true;
                    }
                }else{
                    for(var i=1;i<targetNode.length;i++){
                        targetNode[i].checked = false;
                    }
                }
            },
            // 选中level2//反选level2
            checkBoxLevelTwo: function (e) {
                let targetNode = e.target.parentNode.parentNode.getElementsByTagName('input');
                let targetNodeArry = [];
                let targetLevelOne = e.target.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('input');
                if(e.target.checked === true){
                    for(var i=1;i<targetNode.length;i++){
                        targetNode[i].checked = true;
                        targetLevelOne[0].checked = true;
                    }
                }else{
                    for(var i=1;i<targetNode.length;i++){
                        targetNode[i].checked = false;
                    }
                    for(var k=1; k<targetLevelOne.length;k++){
                        if(targetLevelOne[i].checked===true){
                        targetNodeArry.push(targetLevelOne[i]);
                        }
                    }
                    if(targetNodeArry.length>0){
                        targetLevelOne[0].checked = true;
                    }else{
                        targetLevelOne[0].checked = false;
                    }
                }
            },
            // level3反选
            checkBoxLevelThree: function (e) {
                let targetNode = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('input');
                let targetNodeLevelTwo = e.target.parentNode.parentNode.parentNode.getElementsByTagName('input');
                let targetNOdeLevel4 = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('level4'); 
                let checkboxLevel1Arry = [];
                let checkboxLevel2Arry = [];
                for(let i = 0; i<targetNOdeLevel4.length; i++){
                    if(targetNOdeLevel4[i].checked){
                        checkboxLevel1Arry.push(targetNOdeLevel4[i]);
                    }
                }
                for(let i =1; i<targetNodeLevelTwo.length; i++){
                     if(targetNodeLevelTwo[i].checked){
                        checkboxLevel2Arry.push(targetNodeLevelTwo[i]);
                    }
                }
                if(e.target.checked === false){
                    if(checkboxLevel2Arry.length>0){
                        targetNode[0].checked=true;
                        targetNodeLevelTwo[0].checked=true;
                    }else if (checkboxLevel2Arry.length==0 && checkboxLevel1Arry.length>0){
                        targetNode[0].checked=true;
                        targetNodeLevelTwo[0].checked=false;
                    }else if (checkboxLevel2Arry.length==0 && checkboxLevel1Arry.length==0){
                        targetNode[0].checked=false;
                        targetNodeLevelTwo[0].checked=false;
                    }
                }else{
                        targetNode[0].checked=true;
                        targetNodeLevelTwo[0].checked=true;
                }
            },
            callback:function(){
                this.$router.push('/role');
            },
            // 新增角色
            updateRole: async function(){
                if(!this.addroleName){
                    this.updateRolespan=true;
                    return false;
                }else{
                    let arr = [];
                    $(".level4").each(function (){
                        if (this.checked === true){
                            arr.push(this.id);
                        }
                    });
                    let data = {
                        name:this.addroleName,
                        description: this.addrolecomment,
                        permissionIds:arr
                    }
                    let response = await addRoler(data);
                     if (response.meta.code !== 0) {
                        this.$Loading.error();
                        this.$Message.error(response.meta.message);
                    }else{
                        this.$Loading.finish();
                        this.$router.push('/role');
                    }
                }
            }
        }
    }

</script>
<style scoped>
    @import '../assets/css/index.css';
</style>