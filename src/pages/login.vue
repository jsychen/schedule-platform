<template>
    <div id="login">
        <div class="wrapper">
            <img src="../assets/img/slogon.png">
            <div class="login">
                <img src="../assets/img/loginText.png">
                <form action="login" method="post" id="loginForm">
                    <!-- <p class="error" id="result" style="color:red;"></p> -->
                    <Alert id="errorMsg" type="error" style="display:none" v-show="showMsg">{{ errorMsg }}</Alert>
                    <div class="inputBox">
                        <span class="icon-3"></span>
                        <input type="text" v-model.trim="phoneNumber" name="phoneNumber" placeholder="手机号" id="phoneNumber">
                    </div>
                    <div class="inputBox">
                        <span class="icon-2"></span>
                        <input type="password" v-model.trim="userPasswd" name="password" placeholder="登录密码" id="password">
                    </div>
                    <button  class="btn-login" type="button" @click="doLogin">登录</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
    import {login} from "../api/commonAPI";
    import {DISTRICTID, STATIONID, USERNAME, POSITIONID, SCHEDULE_IDENTIFY, ROLEID, DISTRICTID_NAME} from '@/utils/const';
    export default{
        data: function () {
            return {
                phoneNumber: '',
                userPasswd: '',
                errorMsg: '',
                showMsg:false
            };
        },
        methods: {
            doLogin: async function (){
                if(this.phoneNumber == '' || this.userPasswd == ''){
                    this.errorMsg = '账号或者密码不能为空';
                    this.showMsg = true;
                    return;
                }     
                // this.$router.push({ path: "/home" });
                let params = {
                    phoneNumber: this.phoneNumber,
                    password: this.userPasswd
                };
                this.$Loading.start();
                let response = await login(params);
                if (response.meta.code !== 0) {
                    this.$Message.error(response.meta.message);
                }else{
                    let user = response.data.user;
                    let roleId = user.roles[0].id;
                    this.$store.set(DISTRICTID, user.districtId);
                    this.$store.set(STATIONID, user.stationId);
                    this.$store.set(USERNAME, user.userName);
                    this.$store.set(POSITIONID, user.positionId);
                    this.$store.set(SCHEDULE_IDENTIFY, response.data.token);
                    this.$store.set(ROLEID, roleId);
                    this.$store.set(DISTRICTID_NAME, user.districtName);
                    if(roleId === 3){
                        this.$router.push({ path: "/schedulePlan" });
                    } else if(roleId === 4) {
                        this.$router.push({ path: "/scheduleForm" });
                    }else{
                        this.$router.push({ path: "/home" });
                    }
                }
            }
        }
    }
</script>
<style scoped>
    @import '../assets/css/login.css';
    @import '../assets/css/font.css';
</style>