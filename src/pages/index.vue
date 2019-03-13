<template>
  <div>
      <div class="navbar header">
          <Row>
              <i-col span="3">
                <div class="logo">
                    <img class="logoimg" src="../assets/img/logo.png" alt="北京地铁">
                </div>
              </i-col>
              <i-col span="21">
                <p>运三公司新班制辅助管理系统</p>
                  <div class="right">
                      <span class="username">{{userName}}</span>
                      <a class="logout" @click="doLogout">退出</a>
                  </div>
              </i-col>
          </Row>
      </div>
      <div class="left-div">
          <Row>
              <i-col span="3" style="position:fixed;left:0;top:60px;">
                <i-menu class="main-menu">
                    <submenu name="1" v-if="roleId === 1 || roleId === 2">
                        <template slot="title">
                            系统设置
                        </template>
                        <menu-item name="1-2"  v-if='roleId === 1'>
                            <router-link :to="{name: 'districtManage'}" >
                                <span class="icon-18"></span>
                                站区设置
                            </router-link>
                        </menu-item>
                        <menu-item name="1-1" class="active" v-if='roleId === 1 || roleId === 2'>
                            <router-link :to="{name: 'userManage'}" id="indexRouter">
                                <span class="icon-19"></span>
                                人员管理
                            </router-link>
                        </menu-item>
                        <menu-item name="1-4"  v-if='roleId === 1'>
                            <router-link :to="{name: 'annualLeave'}" >
                                <span class="icon-16"></span>
                                年假管理
                            </router-link>
                        </menu-item>
                        <menu-item name="1-3" v-if='roleId === 1'>
                            <router-link :to="{name: 'Role'}" >
                                <span class="icon-17"></span>
                                权限管理
                            </router-link>
                        </menu-item>
                    </submenu>
                    <submenu name="3" v-if="roleId === 2">
                        <template slot="title">
                            排班设置
                        </template>
                        <menu-item name="3-1">
                            <router-link to="./shiftsSetting" >
                                <span class="icon-7"></span>
                                班次设置
                            </router-link>
                        </menu-item>
                        <menu-item name="3-2">
                            <router-link to="./postSetting" >
                                <span class="icon-8"></span>
                                岗位设置
                            </router-link>
                        </menu-item>
                    </submenu>
                    <submenu name="2" v-if="roleId === 2 || roleId === 4">
                        <template slot="title">
                            排班管理
                        </template>
                        <menu-item name="2-1">
                            <router-link :to="{name: 'ScheduleForm'}" >
                                <span class="icon-16"></span>
                                排班表格
                            </router-link>
                        </menu-item>
                        <menu-item name="2-2" v-if="roleId === 2">
                            <router-link :to="{name: 'manualSchedule'}" >
                                <span class="icon-6"></span>
                                手动排班
                            </router-link>
                        </menu-item>
                        <menu-item name="2-4" v-if="roleId === 2">
                            <router-link :to="{name: 'Workflow'}" >
                                <Icon type="code-working" class="iconsize"></Icon>
                                工作流程
                            </router-link>
                        </menu-item>
                        <menu-item name="2-5">
                            <router-link :to="{name: 'schedulePlan'}" >
                                <Icon  type="ios-paper" class="iconsize"></Icon>
                                排班计划
                            </router-link>
                        </menu-item>
                    </submenu>
                    <submenu name="4" v-if="roleId === 1 || roleId === 2">
                        <template slot="title">
                            统计报表
                        </template>
                        <menu-item name="4-1">
                            <router-link :to="{name: 'workHourReport'}" >
                            <span class="icon-15"></span>
                            工时报表
                            </router-link>
                        </menu-item>
                    </submenu>
                    <menu-item name="1-1" v-if="roleId !== 3">
                        <router-link :to="{name: 'operations'}">操作记录</router-link>
                    </menu-item>
                </i-menu>
              </i-col>
              <i-col span="21" style="margin-left:12.5%;">
                <div class="right-div">
                    <router-view></router-view>
                </div>
              </i-col>
          </Row>
      </div>
  </div>
</template>
<script>
import {DISTRICTID, STATIONID, USERNAME, POSITIONID, SCHEDULE_IDENTIFY} from '@/utils/const';
    export default {
        data: function () {
            return {
                userName: this.$store.get('userName'),
                roleId: this.$store.get('roleId'),

            }
        },
        mounted: function() {
            // this.request();
        },
        methods: {
            doLogout: async function () {
                // TODO
                this.$router.replace({name: 'Login'});
                this.$store.remove(DISTRICTID);
                this.$store.remove(STATIONID);
                this.$store.remove(USERNAME);
                this.$store.remove(POSITIONID);
                this.$store.remove(SCHEDULE_IDENTIFY);
            },
            // request: function(){
            //     let roleId = this.roleId;
            //     this.role = roleId === 1 ? 'admin' : roleId === 2 ? 'districtMonitor' : roleId === 3 ? 'ordinary' : 'classMonitor';
            //     console.log(role)
            // }
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>