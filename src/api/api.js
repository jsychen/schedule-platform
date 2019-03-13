import fetch from '@/config/fetch';

/************************* 岗位设置 **************************/

/** 获取岗位 */
export const getAllPost = id => fetch('/position?districtId='+ id, {}, 'GET');

/** 新增岗位 */
export const addPost = data => fetch('/position', data, 'POST');

/** 编辑岗位 */
export const updatePost = (id, data) => fetch('/position/' + id, data, 'PUT');

/** 删除岗位 */
export const detelePost = id => fetch('/position/' + id, {}, 'DELETE');


/*************************** 班次设置 *******************************/

/** 获取班制 */
export const getSuites = data => fetch('/duty/suite', data, 'GET');

/** 新增班制 */
export const addSuites = data => fetch('/duty/suite', data, 'POST');

/** 删除班制 */
export const deteleSuites = id => fetch('/duty/suite/' + id, {}, 'DELETE');

/** 编辑班制 */
export const updateSuites = data => fetch('/duty/suite' , data, 'PUT');

/** 获取班次 */
export const getClass = id => fetch('/duty/suite/'+id, {}, 'GET');

/** 新增班次 */
export const addClass = data => fetch('/duty/class', data, 'POST');

/** 删除班次 */
export const deteleClass = id => fetch('/duty/class/' + id, {} ,'DELETE');

/** 编辑班次 */
export const updateClass = data => fetch('/duty/class' , data, 'PUT');

/** 新增时间段 */
export const addPeriod = data => fetch('/duty/period', data, 'POST');

/** 编辑时间段 */
export const updatePeriod = data => fetch('/duty/period' , data, 'PUT');

/** 删除时间段 */
export const detelePeriod = id => fetch('/duty/period/' + id, {}, 'DELETE');

/*************************** 工作流程 *******************************/

/** 获取工作流程 */
export const getWorkFlow = id => fetch('/workflow/'+ id, {}, 'GET');

/** 更新工作流程 */
export const updateWorkFlow = data => fetch('/workflow', data, 'PUT');

/** 新增工作流程内容 */
export const addContent = data => fetch('/workflow/content', data, 'POST');

/** 更新工作流程内容 */
export const updateContent = (id, data) => fetch('/workflow/content/' + id, data, 'PUT');

/** 更新工作流程内容 */
export const deleteContent = id => fetch('/workflow/content/'+ id, {}, 'DELETE');


/********************* 新增排班 **********************/

/** 生成排班计划 */
export const saveSchedule = (suiteId, dateStr) => fetch('/schedule/scheduleinfo?suiteId=' + suiteId +'&&dateStr='+ dateStr, {}, 'POST');

/** 排班模板删除一周 */
export const deleteOneWeek = (suiteId, weekNum) => fetch('/schedule/deleteoneweek?suiteId=' + suiteId +'&&weekNum='+ weekNum, {}, 'DELETE');

/** 排班模板交换任务 */
export const changeTemplate = data => fetch('/schedule/exchangeTemplate', data, 'PUT');

/** 生成模版 */
export const createTemplate = id => fetch('/schedule/createtemplate/' + id, {}, 'POST');

/** 加载排班模版 */
export const loadTemplate = id => fetch('/schedule/templatelist/' + id, {}, 'GET');

/** 排班模板取消人员 */
export const resetSheduleUser = data => fetch('/schedule/removescheduleuser', data, 'PUT');

/** 排班模板设置人员 */ 
export const setSheduleUser = data => fetch('/schedule/setscheduleuser', data, 'PUT');

/** 手动排版设置班次 */
export const setTemplateClass = data => fetch('/schedule/settemplateclass', data, 'PUT');

/** 手动排班删除班次 */
export const deleteTemplateClass = id => fetch('/schedule/template/' + id, {}, 'DELETE');

/**************************** 排班表格 ****************************/
/** 查询排班计划 */
export const getScheduleInfo = data => fetch('/schedule/scheduleinfo', data, 'GET');

/** 请假 */
export const askForLeave = data => fetch('/leave', data, 'POST');

/** 取消离岗 */
export const cancelLeave = data => fetch('/leave', data, 'PUT');

/** 剩余年假 */
export const getAnnualHoliday = userId => fetch('/holiday/annual/' + userId, {}, 'GET');

/** 剩余病假 */ 
export const getSickleft = id => fetch('/holiday/sickleft?scheduleInfoId=' + id, {}, 'GET');

/** 导出个人排班表格 */
export const exportImg = data => fetch('/schedule/scheduleinfo/export/img', data, 'GET');

/** 换班 */
export const changeSchedule = data => fetch('/change/scheduleinfo', data, 'GET');

/** 删除某个站务员 */
export const deleteUser = (suiteId, userId) => fetch('/schedule/delete/' + suiteId +'/' + userId, {}, 'DELETE');
