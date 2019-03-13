<template>
    <div class="container">
        <div class="content-header">
            <button class=" btnDefault bgGreen" type="button" @click="beforeAddPost">新增岗位</button>
            <Modal title="新增岗位"
                v-model="modal.addPost"
                @on-ok="addPost"
                :loading="true">
                <Form :label-width="90">
                    <FormItem label="岗位名称：" required>
                        <Input v-model.trim="addItem.positionName" placeholder=""/>
                    </FormItem>
                    <FormItem label="备班岗：">
                        <Checkbox v-model="addItem.backupPosition"></Checkbox>
                    </FormItem>
                </Form>
            </Modal>
            <Modal title="编辑岗位"
                v-model="modal.editPost"
                @on-ok="updatePost"
                :loading="false">
                <Form :label-width="90">
                    <FormItem label="岗位名称：" required>
                        <Input v-model.trim="editItem.positionName" placeholder=""/>
                    </FormItem>
                    <FormItem label="备班岗：">
                        <Checkbox v-model="editItem.backupPosition"></Checkbox>
                    </FormItem>
                </Form>
            </Modal>
        </div>
        <div class="panel-body">
            <Table border :columns="columns" :data="data"></Table>
        </div>
    </div>
</template>
<script>
import {getAllPost, addPost, updatePost, detelePost} from '@/api/api'
    export default {
        data:function () {
            return {
                modal: {
                    addPost: false,
                    editPost: false
                },
                districtId: this.$store.get('districtId'),
                addItem: {
                    positionName: '',
                    backupPosition: false,
                },
                editItem: {
                    positionName: '',
                    backupPosition: false,
                },
                columns: [
                    {
                        title: '岗位名称',
                        key: 'positionName'
                    },
                    {
                        title: '备班岗位',
                        key: 'backupPosition',
                        render: (h, params) => {
                            let str = params.row.backupPosition ? '是' : '否';
                            return h('div', [
                                h('span', {
                                    style: {
                                        textAlign: 'center'
                                    },
                                }, str)
                            ]);;
                        }
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
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            let obj = params.row;
                                            this.currentId = obj.id;
                                            this.editItem.positionName = obj.positionName;
                                            this.editItem.backupPosition = obj.backupPosition ? true : false;
                                            this.modal.editPost = true;
                                        }
                                    }
                                }, '编辑'),
                                h('a', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            let obj = params.row;
                                            this.beforeDetelePost(obj.id, params.index)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                data: [],
                currentId: null,
            }
        },
        mounted: function () {
            this.getAllPost();
        },
        methods: {
            //  获取所有岗位
            getAllPost: async function () {
                let response = await getAllPost(this.districtId);
                let message = response.meta.message;
                if(response.meta.code !== 0){
                    this.$Message.error(message);
                    return;
                }
                this.data = response.data;
            },
            //  点击删除岗位
            beforeDetelePost: function (id, index) {
                this.$Modal.confirm({
                content: "<p>确定要删除这个岗位吗？</p>",
                loading: true,
                onOk: () => {
                    this.$Modal.remove();
                    this.detelePost(id, index);
                    }
                });
            },
            detelePost: async function (id, index) {
                let response = await detelePost(id);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    // this.data = response.data;
                    this.data.splice(index, 1);
                    return;
                }
                this.$Message.error(message);
            },
            //  点击新增岗位
            beforeAddPost: function () {
                this.addItem.positionName = '';
                this.addItem.backupPosition = false;
                this.modal.addPost = true;
            },
            //  确认新增岗位
            addPost: async function () {
                let name = this.addItem.positionName;
                if(!name){
                    this.$Message.warning('岗位名称不能为空！');
                    return;
                }
                let backupPosition = this.addItem.backupPosition ? 1 : 0;
                let data = {
                    districtId: this.districtId,
                    positionName: name,
                    backupPosition: backupPosition
                }
                let response = await addPost(data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.data = response.data;
                    this.modal.addPost = false;
                    return;
                }
                this.$Message.error(message);
            },
            //  编辑岗位
            updatePost: async function () {
                let obj = this.data[this.currentIndex];
                let name = this.editItem.positionName;
                let backupPosition = this.editItem.backupPosition ? 1 : 0;
                if(!name){
                    this.$Message.warning('岗位名称不能为空！');
                    return;
                }
                let data = {
                    districtId: this.districtId,
                    positionName: name,
                    backupPosition: backupPosition
                }
                let response = await updatePost(this.currentId, data);
                let message = response.meta.message;
                if(response.meta.code === 0){
                    this.$Message.success(message);
                    this.data = response.data;
                    this.modal.editPost = false;
                    return;
                }
                this.$Message.error(message);
            }
        }
    }
</script>
<style scoped>
    @import '../assets/css/index.css';
</style>