<template>
    <div class="container">
        <div class="roleboforeadd">
            <div class="container">
                <div class="content-header">
                    <div class="float-left">
                        <a class="btnDefault bgGreen"  @click="roleConfigshow"><span>新增角色</span></a>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="table-container">
                        <Table class="roletable" stripe :columns="columns1" :data="data"></Table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {getRole,} from '@/api/commonAPI';
    export default {
        data:function () {
        return {
            roleId:this.$store.get('role'),
            obj:{},
            columns1: [
                {
                    title: '角色名称',
                    key: 'name',
                    align: 'left',
                },
                {
                    title: '职务描述',
                    key: 'description',
                    align: 'left',
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h('a', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px',
                                    color:"#0000FF"
                                },
                                on: {
                                    click: () => {
                                        this.show(params.index)
                                    }
                                }
                            }, '权限配置')
                        ]);
                    }
                }
            ],
            data: []
        }
    },
        mounted: function () {
            // 获取角色列表
            this.roleList();
        },
        methods:{
            show:function (index) {
                this.$router.push({
                    name:'EditJurisdiction',
                    params:{
                        id:this.data[index].id
                    }

                });
            },
            roleConfigshow:function(){
                this.$router.push("/addJurisdiction");
            },
            // 获取角色列表
            roleList: async function(){
                let id = this.roleId;
                let response = await getRole('/'+id);
                if (response.meta.code !== 0) {
                    this.$Loading.error();
                    this.$Message.error(response.meta.message);
                }else{
                    this.$Loading.finish();
                    this.data = response.data;
                }
            },
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>