/*
   작성자 : 이종석 
   내용 : 사용할 기본함수 
*/

var server_url = 'http://dev.wholook.net';


//sms 인증시 카운트 다운
var time_worker = null;

// UserApp 에서 사용될 wholookModel define

var invitelist = null;
var msglist = null;
var loader = null;

// 로컬 스토어지에 있는 json data 를 object로 변환
function getLocalToObjlist( storageName )
{
	var jsondata = null;
	jsondata = localStorage.getItem( storageName );
	
	if( jsondata == null || jsondata == '' )return null;
	
	var objlist = null;
	
	objlist = jQuery.parseJSON( jsondata );
	
	return objlist;
	
}
// 특정 오브젝트 찾기

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

//sms 인증시 카운트 다운
function startTimer( timeout , element )
{
	var time_worker = null;
	
	if( typeof( Worker) != "undefined")
	{
		time_worker = new Worker("assets/wholook-api/time_worker.js");
	}else
	{
		console.log( "Web Worker 가 제공되지 않는 브라우져 입니다.");
		return;
	}
	
	time_worker.onmessage = function( event)
	{
		element.text( event.data );
		if( timeout == event.data)
		{
			time_worker.terminate();	
		}
	}
}

$(function(){
	
    $("#preloader").hide(); 
    
    
});

var scriptLoader = {
		
	  load: function(src, callback) {
	
		var script = document.createElement('script'),
	    
		loaded;
	    script.setAttribute('src', src);
	    
	    if (callback) {
	        
	    	script.onreadystatechange = script.onload = function() {
		        
	        	if (!loaded) {
		          callback();
		        }
		        
	            loaded = true;
	        
	    	};
	      
	    }
	    
	    document.getElementsByTagName('head')[0].appendChild(script);
	  }
};


//-- template 불러오는 부분
function getJsonData(jsonPath) {
	
	var d = $.Deferred();
	$.get(jsonPath, function(response) {
		d.resolve(response);
	});
	return d.promise(); 

}

//-- template 호출함수 ( HandleBars :: For Precompile ) 

function getTemplateContents(target ,name, data) {
	/*
	var d = $.Deferred();
	
    scriptLoader.load('assets/templates/' + target + '/' + name + '.tmpl', function() {
        var template = Handlebars.templates[name + '.tmpl'];
        d.resolve(template(data));
    });
	
	return d.promise(); 
	*/
}
/// 사용자 정의 함수 

function getNetworkState(){
	
	return Network_State;
}

var _WHOLOOK_USER_GUEST_ID_ = _WHOLOOK_STORAGE_PREFIX_ + "guest_id";

function setLocalGuestID( guest ){
	if( !window.localStorage )
	{
		alert( "사용 할수 없는 기기 에러");
		appClose();
	}
	localStorage.setItem( _WHOLOOK_USER_GUEST_ID_ , guest );	
}

function getLocalGuestID(){
	if( !window.localStorage )
	{
		alert( "사용 할수 없는 기기 에러");
		appClose();
	}
	return localStorage.getItem( _WHOLOOK_USER_GUEST_ID_ );
}

function removeGuestID(){
	if( !window.localStorage )
	{
		alert( "사용 할수 없는 기기 에러");
		appClose();
	}
	
	localStorage.removeItem( _WHOLOOK_USER_GUEST_ID_ );
}

function appClose(){
	navigator.device.exitApp();
}


function getUsim(){
	
	return '0000-0000-0000-000F';
}



function getDeviceType(){
	
	//'A' or 'I' 만 리턴 해야 됨
	return 'A';
}
