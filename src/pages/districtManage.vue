<template>
    <div class="container">
        <div class="content-header">
            <button class="btnDefault bgGreen" type="button" @click="addStationArea = true;stationName = ''">新增站区</button>
            <button class="btnDefault">导入</button>
        </div>
        <div class="content-title">
            北京地铁运三分公司
        </div>
        <div class="list">
            <my-district v-for="(item, index) in districts" :key="index" :item="item" @deleteDistrict="dataChange"></my-district>
        </div>
        <!--新增站区弹框-->
        <Modal
            title="新增站区"
            v-model="addStationArea"
            @on-ok="addDistrict"
            :loading="true"
            @on-cancel='cancel'>
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
    </div>
</template>
<script>
    import district from '../components/district.vue'
    import {getDistricts, addDistrict, getStations} from '@/api/commonAPI'
    export default {
        data: function () {
            return {
                addStationArea: false,
                districts: [],
                lineNum: '',
                districtName: '',
                content: ''
            }
        },
        mounted: function () {
            this.getDistricts();
        },
        methods:{
            //  删除战区成功
            dataChange (res) {
                this.districts = res;
            },
            //  获取站区列表
            getDistricts: async function(){
                let response = await getDistricts();
                console.log(response);
                if (response.meta.code !== 0) {
                    this.$Loading.error();
                    this.$Message.error(response.meta.message);
                }else{
                    this.$Loading.finish();
                    this.districts = response.data;
                }
            },
            //  新增站区
            addDistrict: async function(){
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
                let response = await addDistrict(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.districts = response.data;
                    this.addStationArea = false;
                } else {
                    this.$Message.error(mesage);
                }
                this.lineNum = '';
                this.districtName = '';
                this.content = '';
            },
            //  取消
            cancel: function () {
                this.lineNum = '';
                this.districtName = '';
                this.content = '';
            }
        },
        components:{
            myDistrict: district
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>