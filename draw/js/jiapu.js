$(document).ready(function(){
    function getScrollWidth() {
        var noScroll, scroll, oDiv = document.createElement("DIV");
        oDiv.style.cssText = "position:absolute;top:-1000px;width:100px;height:100px; overflow:hidden;";
        noScroll = document.body.appendChild(oDiv).clientWidth;
        oDiv.style.overflowY = "scroll";
        scroll = oDiv.clientWidth;
        document.body.removeChild(oDiv);
        var w = noScroll-scroll;
        console.warn(w);

        return w;
    }

	// 计算浏览器缩放后html fontsize
    function resizeHtmlFontSize() {
        // 根据浏览器可视区域计算比例
        var browserWidthWithoutScrollBar = document.documentElement.clientWidth;
        var scale = (browserWidthWithoutScrollBar - getScrollWidth()) / 1920; // 1920设计稿宽度
        console.log("!!!!tree!!! jiapu scale:", scale);
        document.getElementsByTagName('html')[0].style.fontSize = scale * 100 + 'px';
    }
    resizeHtmlFontSize();
    window.onresize = function () {
        resizeHtmlFontSize();
    };


	$("#fullbg").click(function(){
		$("#dialog").hide();
		$("#fullbg").hide();
		
	})
	$("#myposition").click(function(){
		reload($("#rootIndividualId").val());
	})
	$("#alive").click(function(){
		if($(this).prop('checked')){
			$("#popup_alive").hide()
		}else{
            var picker = new Pikaday(
                {
                    field: document.getElementById('diedAt'),
                    firstDay: 1,
                    // minDate: new Date('2010-01-01'),
                    maxDate: new Date(),
                    // yearRange: [2000,2020]
                    panelPosition: { left: 0, top: '30px' },
                    containerBox: document.getElementById('popup_alive'),
                });
            picker.setPanelPosition({ left: '-70px', top: '30px' });

			$("#popup_alive").show();
		}
	})
	$("#uploadImg-0").change(function(e){
		var _URL = window.URL || window.webkitURL;
	    var file, img;
	    if ((file = this.files[0])) {
	        img = new Image();
	        img.onload = function() {
	            $('#preview-0').attr('src', this.src);
	            console.log(this.width)
	        };
	        img.src = _URL.createObjectURL(file);
	    }
	})
	$("#popup_save").click(function(){
		var edit_id = $("#edit_id").val();
		if(edit_id>0){
			saveIndividual();
		}else{
			createIndividal();
		}
	})
	$("#popup_cancel").click(function(){
		$('.add-info').removeClass("active");
	})
	$("#popup_close").click(function(){
		$('.add-info').removeClass("active");
	});
})
function saveIndividual(){
	var formData = new FormData();
	var alive,diedAt,tombAddress;
	var familyName = $("#familyName").val();
	var lastName = $("#lastName").val();
	var mobile = $("#mobile").val();
	var bornAt = $("#bornAt").val();
	var node_id = $("#edit_id").val();
	if($('#alive').prop('checked')){
		alive = 'true';diedAt="";tombAddress="";
	}else{
		alive = 'false';
		diedAt = $("#diedAt").val();
		tombAddress = $("#tombAddress").val();
	}
	
	formData.append('familyName', familyName);
	formData.append('lastName', lastName);
	formData.append('mobile', mobile);
	formData.append('alive', alive);
	formData.append('bornAt', bornAt);
	formData.append('diedAt', diedAt);
	formData.append('tombAddress', tombAddress);
	formData.append('nodeId', node_id);
	if($('#uploadImg-0')[0].files.length>0){
		formData.append('file', $('#uploadImg-0')[0].files[0]);
	}
	$.ajax({
	    url: '/jiapu/updateIndividual',
	    type: 'POST',
	    cache: false,
	    data: formData,
	    processData: false,
	    contentType: false
	}).done(function(res) {
		closeAddWindow();
		reload(node_id);
	}).fail(function(res) {});
}
//显示
function showProfile(individualId) {
	$("#node_id").val(individualId);
    $('.profie').animate({ left: '0' }, 400, 'swing', function() {
    	$.post("/jiapu/getIndividualLeft",{"individualId":individualId},function(data){
    		console.log(data);
    		$('#profie_avatar').attr("src",data.avatar);
    		$('#profie_name').html(data.name);
    		$("#profie_bornAt").html(data.bornAt);
    		$("#profie_mobile").html(data.mobile);
    		$("#profie_address").html(data.address);
    		$("#profie_addIndividual").click(function(){
    			showBg(individualId);
    		});
    		$("#profie_editIndividual").click(function(){
    			openEdit(individualId);
    		});
    		$("#profie_delIndividual").attr("onclick","delIndividal()");
    		var statuses = data.statuses;
    		var statusesHTML = "";
    		$("#user_statuses").html("");
    		for (var i = 0; i < statuses.length; i++) {
    	        console.log(statuses[i].year);
    	        statusesHTML = "<div class='year-item'><h2>"+ statuses[i].year +"</h2>";
    	        $.each(statuses[i].yearArray, function(index, obj){
    	        	statusesHTML += "<div class='content-item'>";
    	        	statusesHTML += "<div class='time'>"+ obj.date +"</div>";
    	        	statusesHTML += "<div class='con'>";
    	        	statusesHTML += "<div class='text'>"+ obj.content +"</div>";
    	        	if(obj.imgs.length > 0){
    	        		var imgs = obj.imgs;
    	        		statusesHTML += "<div class='imgs' >";
    	        		for(var j = 0; j<imgs.length; j++){
    	        			statusesHTML += "<img src='"+ imgs[j] +"' />";
    	        		}
    	        		statusesHTML += "</div>";
    	        	}
    	        	
    	        	statusesHTML += "</div>";
    	        	statusesHTML += "</div>";
    	        });
    	        statusesHTML +="</div>";
    	        $("#user_statuses").html($("#user_statuses").html()+statusesHTML);
    	    }
    		
    	})
    });
}
function delIndividal(){
	var individualId =  $("#node_id").val();
    layer.confirm('是否确定删除？', {
        btn: ['确定','取消'], //按钮
        shade: false //不显示遮罩
    }, function(index,layero){
        var parents = structure[individualId].parents;
        var children = structure[individualId].children;
        var spouses = structure[individualId].spouses;
        var gender = structure[individualId].gender;
        if(parents.length>0 && children.length>0){
            layer.msg('抱歉，无法删除此人!', {icon: 2, time: 1000});return;
        }
        if(spouses.length>0 && children.length>0 && gender == "m"){
            layer.msg('抱歉，无法删除此人!', {icon: 2, time: 1000});return;
        }
        if(spouses.length>0 && parents.length>0){
            layer.msg('抱歉，无法删除此人!', {icon: 2, time: 1000});return;
        }
        $.post("/jiapu/delIndividual",{"individualId":individualId},function(data){
            if(data==0){
                hideProfile();
                reload($("#rootIndividualId").val());
                layer.msg('删除成功!', {icon: 1, time: 1000});return;
            }else{
                layer.msg('抱歉，无法删除此人!', {icon: 2, time: 1000});return;
            }
        });

    });
	// if(confirm("确认删除吗？")){
	// 	var parents = structure[individualId].parents;
	// 	var children = structure[individualId].children;
	// 	var spouses = structure[individualId].spouses;
	// 	var gender = structure[individualId].gender;
	// 	if(parents.length>0 && children.length>0){
	// 		alert("抱歉，无法删除此人");return;
	// 	}
	// 	if(spouses.length>0 && children.length>0 && gender == "m"){
	// 		alert("抱歉，无法删除此人");return;
	// 	}
	// 	if(spouses.length>0 && parents.length>0){
	// 		alert("抱歉，无法删除此人");return;
	// 	}
	// 	$.post("/jiapu/delIndividual",{"individualId":individualId},function(data){
	// 		if(data==0){
	// 			hideProfile();
	// 			reload($("#rootIndividualId").val());
	// 		}else{
	// 			alert("抱歉，无法删除此人");
	// 		}
	// 	});
    //
	// }else{
	// 	return;
	// }
}
// 隐藏个人信息
function hideProfile() {
    $('.profie').animate({ left: '-100%' }, 400, 'swing', function() {

    });
}
function openEdit(individualId){
	$("#uploadImg-0").val("");
	$("#personal_option").hide();
	$("#popup_title").html(structure[individualId].name);
	$("#edit_id").val(individualId);
	$.post("/jiapu/getIndividualInfo",{"individualId":individualId},function(data){
		console.log(data.avatar);
		$('#preview-0').attr('src', data.avatar);
		$("#familyName").val(data.familyName);
		$("#lastName").val(data.name);
		$("#mobile").val(data.mobile);
		$("#bornAt").val(data.bornAt);
		$('.add-info').addClass("active");
		if(data.alive=="0"){
			$('#alive').prop('checked',false);
			$("#popup_alive").show();
			$("#tombAddress").val(data.tombAddress);
			$("#diedAt").val(data.diedAt);
		}else{
			$('#alive').prop('checked',true);
			$("#popup_alive").hide();
		}
	})
}
function initForm(){
	$("#familyName").val("");
	$("#lastName").val("");
	$("#mobile").val("");
	$("#bornAt").val("");
	$("#preview-0").attr("src", "/images/upload_img.png");
}
function createIndividal(){
	var formData = new FormData();
	var alive,diedAt,tombAddress;
	var type =$("#type").val();
	var familyName = $("#familyName").val();
	var lastName = $("#lastName").val();
	var mobile = $("#mobile").val();
	var bornAt = $("#bornAt").val();
	var node_id = $("#node_id").val();
	var gender = $("#gender").val();
	if($('#alive').prop('checked')){
		alive = 'true';diedAt="";tombAddress="";
	}else{
		alive = 'false';
		diedAt = $("#diedAt").val();
		tombAddress = $("#tombAddress").val();
	}
	
	formData.append('familyName', familyName);
	formData.append('lastName', lastName);
	formData.append('mobile', mobile);
	formData.append('alive', alive);
	formData.append('gender', gender);
	formData.append('bornAt', bornAt);
	formData.append('diedAt', diedAt);
	formData.append('tombAddress', tombAddress);
	formData.append('nodeId', node_id);
	formData.append('type', type);
	formData.append('file', $('#uploadImg-0')[0].files[0]);
	$.ajax({
	    url: '/jiapu/addIndividual',
	    type: 'POST',
	    cache: false,
	    data: formData,
	    processData: false,
	    contentType: false
	}).done(function(res) {
		closeAddWindow();
		reload(node_id);
	}).fail(function(res) {});
}
function _add(type,o) {
	if($(o).css("cursor")=='not-allowed'){
		return;
	}
	closeBg();
	initForm();
	var gender, name,type;
	if(type==1){ gender = 0;name="儿子";type="child"; }//儿子
	if(type==2){ gender = 1;name="女儿";type="child"; }//女儿
	if(type==3){ gender = 0;name="父亲";type="parent"; }//父亲
	if(type==4){ gender = 1;name="母亲";type="parent"; }//母亲
	if(type==5){ gender = 0;name="兄长";type="brothers_and_sisters"; }//兄长
	if(type==6){ gender = 0;name="弟弟";type="brothers_and_sisters"; }//弟弟
	if(type==7){ gender = 1;name="姐姐";type="brothers_and_sisters"; }//姐姐
	if(type==8){ gender = 1;name="妹妹";type="brothers_and_sisters"; }//妹妹
	if(type==9){ gender = 0;name="配偶";type="spose"; }//配偶
	$("#type").val(type);
    $('.add-info').addClass("active");
    $("#gender").val(gender);
    $("#popup_title").html("添加"+name);
    $('#alive').prop('checked',true);
	$("#popup_alive").hide();
	$("#uploadImg-0").val("");
}

function showBg(id) { 
	$("#personal_option").hide();
	var bh = $("body").height();
	var bw = $("body").width(); 
	$("#fullbg").css({height: "100%", width:"100%", display:"block" });
	$("#dialog").show(); 
	$("#node_id").val(id);
	$("#edit_id").val("0");
	$("#tspan_this").html(structure[id].name)
	var parents = structure[id].parents;
	allowButton();
	if(parents.length>0){
		for(i=0;i<parents.length;i++){
			if(structure[parents[i]].sex=='m'){
				$("#text_father").css("cursor","not-allowed");
				$("#rect_father").css("cursor","not-allowed");
				$("#rect_father").attr("fill","#B3B3B3");
			}else{
				$("#text_mother").css("cursor","not-allowed");
				$("#rect_mother").css("cursor","not-allowed");
				$("#rect_mother").attr("fill","#B3B3B3");
			}
		}
	}else{
		banButton();
	}
	var sposes = structure[id].spouses;
	if(sposes.length>0){
		for(i=0;i<sposes.length;i++){
			$("#g_spose").css("cursor","not-allowed");
	    }
	}
}
function allowButton(){
	$("#text_father").css("cursor","pointer");
	$("#rect_father").css("cursor","pointer");
	$("#rect_father").attr("fill","#A7CBCB");
	$("#text_mother").css("cursor","pointer");
	$("#rect_mother").css("cursor","pointer");
	$("#rect_mother").attr("fill","#E0BBB4");
	$("#g_spose").css("cursor","pointer");
	$("#text_brother1").css("cursor","pointer");
	$("#rect_brother1").css("cursor","pointer");
	$("#rect_brother1").attr("fill","#A7CBCB");
	$("#text_brother2").css("cursor","pointer");
	$("#rect_brother2").css("cursor","pointer");
	$("#rect_brother2").attr("fill","#A7CBCB");
	$("#text_sister1").css("cursor","pointer");
	$("#rect_sister1").css("cursor","pointer");
	$("#rect_sister1").attr("fill","#E0BBB4");
	$("#text_sister2").css("cursor","pointer");
	$("#rect_sister2").css("cursor","pointer");
	$("#rect_sister2").attr("fill","#E0BBB4");
}
function banButton(){
	$("#text_brother1").css("cursor","not-allowed");
	$("#rect_brother1").css("cursor","not-allowed");
	$("#rect_brother1").attr("fill","#B3B3B3");
	$("#text_brother2").css("cursor","not-allowed");
	$("#rect_brother2").css("cursor","not-allowed");
	$("#rect_brother2").attr("fill","#B3B3B3");
	$("#text_sister1").css("cursor","not-allowed");
	$("#rect_sister1").css("cursor","not-allowed");
	$("#rect_sister1").attr("fill","#B3B3B3");
	$("#text_sister2").css("cursor","not-allowed");
	$("#rect_sister2").css("cursor","not-allowed");
	$("#rect_sister2").attr("fill","#B3B3B3");
}
// 关闭灰色 jQuery 遮罩
function closeBg() { 
	$("#fullbg,#dialog").hide(); 
}
// 显示
function _hideProfile() {
    $('.profie').animate({ left: '0' }, 400, 'swing', function() {

    });
}
// 隐藏个人信息
function _hideProfile() {
    $('.profie').animate({ left: '-100%' }, 400, 'swing', function() {

    });
}

function _excute(index) {
    if (index == 0) {
    } else if (index == 1) {
    } else if (index == 2) {
    }
}

// 去世
function _isDead(event) {
    var checked = $(event.target).prop('checked'),
    next = $(event.target).parent('label').next('.option-tab');

    if (checked) {
        next.hide();
    } else {
        next.show();
    } 
}
// 关闭
function closeAddWindow() {
    $('.add-info').removeClass("active");
}