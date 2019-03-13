//悬浮框显示
function showColorPanel(event) {
    var left = event.pageX<100 ? event.pageX : event.pageX-100;
    $(".colorPanel").css("left", left+"px");
    $(".colorPanel").css("top", event.pageY+20);
    $("#contentInput").text("");
    $(".colorPanel").show();
}
function addWorkflowContent() {
    var first = $(".td-active:first");
    var workflowId = $(first).closest("tr").attr("trWorkflowId");
    if (!workflowId) {
        Alert("没有创建流程");
        return;
    }
    var tr = $(first).closest("tr");
    var start = parseInt($(first).attr("tdValue"));
    var rowNum = $(tr).attr("trType");
    var last = $(tr).find(".td-active:last");
    var end = parseInt($(last).attr("tdValue"));
    $(".td-active").each(function () {
        $(this).removeClass(".td-active");
    });
    $("#addFlow").hide();

    for (var l = start + 10; l <= end; l += 10) {
        $(tr).find("[tdValue=" + l + "]").remove();
    }
    var td = $(tr).find("[tdValue=" + start + "]");
    $(td).attr("colspan", (end - start + 10) / 10);

    $("#contentInput").show().focus();
    $("#colorTable").show();
    $("#submitFlow").show();
}

function updateWorkFlowContent() {
    if ($(".td-active[contentId]").length > 1) {
        Alert('fail', "选中元素太多");
    }
    var content = $(".td-active[contentId]");
    var contentId = $(content).attr("contentId");
    jQuery.ajax({
        async: false,
        type: "get",
        url: "$path/workflowContentDel?contentId=" + contentId,
        data: null,
        dataType: "json",
        error: function () {
            Alert('fail', "网络错误");
        },
        success: function (result) {
            var text=$(content).text();
            $(content).text("");
            $("#contentInput").val(text);
            $("#contentInput").show().focus();
            $("#colorTable").show();
            $("#updateFlow").hide();
            $("#remFlow").hide();
            $("#submitFlow").show();
        }

    });
}

function submitWorkFlowContent() {
    var color = $("[pickup=1]").attr("color-value");
    $("[color-value]").attr("pickup","0").css("border","solid 1px black");
    addOrUpdateWorkflowContent(color);
}
$(document).on("click","[color-value]",function(){
    $("[color-value]").attr("pickup","0").css("border","solid 1px black");
    $(this).attr("pickup","1").css("border","solid 2px black");
});

function deleteWorkflowContent() {
    if ($(".td-active[contentId]").length > 1) {
        Alert('fail', "选中元素太多");
    }
    var content = $(".td-active[contentId]");
    var contentId = $(content).attr("contentId");
    jQuery.ajax({
        async: false,
        type: "get",
        url: "$path/workflowContentDel?contentId=" + contentId,
        data: null,
        dataType: "json",
        error: function () {
            Alert('fail', "网络错误");
        },
        success: function (result) {
            var colspan = $(content).attr("colspan");
            $(content).removeClass("td-active");
            $(content).css("background-color", "#fff");
            $(content).text("");
            $(content).removeAttr("colspan");
            $(content).removeAttr("contentId");
            var tr = $(content).closest("tr");
            var cursor = content;
            var time = parseInt($(content).attr("tdValue"));
            for (var i = 1; i < colspan; i++) {
                var t = time + 10 * i;
                var td = "<td tdType=minutes width=15 tdValue=" + t + "></td>";
                $(cursor).after(td);
                cursor = $(tr).find("[tdValue=" + t + "]");
            }
            $("#colorPanel").hide();
            $("#updateFlow").hide();
            $("#remFlow").hide();
        }

    });

}
export { //很关键
    showColorPanel
    }