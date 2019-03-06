/**
 * 公共导航栏
 * @author Joey_Wu
 */
/*var logged;//判断用户登录状态
var userName;//用户姓名
$(document).ready(function(){
    //判断用户状态,如果登录,显示用户名,否则显示登录按钮
	alert(logged+'----'+userName);
	
})
*/
//搜索框事件
$("#common-nav-bar .search input")
    .on('keyup', '', function (event) {
        if (event.keyCode == 13) {
            console.info(event.keyCode)
            var value = $("#common-nav-bar .search input")[0].value;
            var url = " http://www.zupu.cn/search.jspx?q=" + value;
            window.open(url);
        }
    });


// logo 点击事件
function _reload() {
    window.location.reload();
}

// 登录
function _signIn() {
    var url=window.location.origin+"/login"
    window.location.replace(url);
}

// 注册
function _signUp() {
    location.href='/signup'
}

//退出登录
function _logOut(){
    layer.confirm('确认要退出登录吗？', {
        btn: ['确定','取消'], //按钮
        shade: false //不显示遮罩
    }, function(index,layero){
        var cookie = getCookie("user_id");
        console.log(cookie);
        $.post('/loginOut',{},function (data) {
            if(data.code == 0){
                //前端删除cookie
                delCookie("user_id");
                //跳到首页
                var url=window.location.origin;
                window.location.replace(url);
            }else{
                layer.msg('退出异常!', {icon: 2, time: 1000});
            }
        });

    });
	// if(window.confirm('确认要退出登录吗？')){
	// 	var cookie = getCookie("user_id");
	// 	console.log(cookie);
	// 	$.post('/loginOut',{},function (data) {
	// 	  	   if(data.code == 0){
	// 	  		   //前端删除cookie
	// 	  		   delCookie("user_id");
	// 			   //跳到首页
     //               var url=window.location.origin;
	// 			   window.location.replace(url);
	// 	  	   }else{
	// 	  		   alert("退出异常!");
	// 	  	   }
	// 	 });
	// }
}

//根据名称获取到指定的cookie
function getCookie(name){
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg)){
		return unescape(arr[2]);
	}else{
		return null;
	}
}

//根据名称删除指定的cookie
function delCookie(name){
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval=getCookie(name);
	if(cval!=null){
		document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}
}

// 收藏
/*$("#common-nav-bar .collect")
    .on('click', '', function (event) {

        var url = window.location;
        var title = document.title;
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("360se") > -1) {
            alert("由于360浏览器功能限制，请按 Ctrl+D 手动收藏！");
        } else if (ua.indexOf("msie 8") > -1) {
            window.external.AddToFavoritesBar(url, title); //IE8
        } else if (document.all) { //IE类浏览器
            try {
                window.external.addFavorite(url, title);
            } catch (e) {
                alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
            }
        } else if (window.sidebar) { //firfox等浏览器；
            window.sidebar.addPanel(title, url, "");
        } else {
            alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
        }
    });*/

function _collect(){
	var url = window.location;
    var title = document.title;
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("360se") > -1) {
        alert("由于360浏览器功能限制，请按 Ctrl+D 手动收藏！");
    } else if (ua.indexOf("msie 8") > -1) {
        window.external.AddToFavoritesBar(url, title); //IE8
    } else if (document.all) { //IE类浏览器
        try {
            window.external.addFavorite(url, title);
        } catch (e) {
            alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
        }
    } else if (window.sidebar) { //firfox等浏览器；
        window.sidebar.addPanel(title, url, "");
    } else {
        alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
    }
}

