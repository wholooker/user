
var server_url = 'http://dev.wholook.net';
var _WHOLOOK_USER_GUEST_ID_ = __WHOLOOK_STORAGE_PREFIX_ + "guest_id";



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		//navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationonError);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	//*
    	document.addEventListener("offline", onOffline, false);
		document.addEventListener("online", onOnline, false);
		document.addEventListener("backbutton", onBackKeyDown, false);

        app.receivedEvent('deviceready');
		
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        startGUI();
    }
};
		
// UserApp 에서 사용될 wholookModel define

var	invitelist = new WholookModel({
	url: server_url + '/api/guest/invite/',
	//data: 요청시 같이 전달될 데이터
	name: '초대매장리스트',
	model: 'invite',
	key: 'id',
	//namd_key: 
	storage: {
		model: 'user_invite.shoplist',
	},
	//save_url:
	//delete_url:
	//onLoading : function(){},
	//onLoaded: function(){},
});

var	msglist = new WholookModel({
	url: server_url + '/api/msg/',
	//data: 요청시 같이 전달될 데이터
	name: '메세지리스트',
	model: 'msglist',
	key: 'id',
	//namd_key: 
	storage: {
		model: 'user_msg.list',
	},
	//save_url:
	//delete_url:
	//onLoading : function(){},
	//onLoaded: function(){},
});
var loader = null;
function loadModelData(progress, complete) {
	loader = new WholookLoader({
		models:[invitelist,msglist],
		onProgress: progress,
		onComplete: complete,
	});
	loader.load();
}

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

/// 사용자 정의 함수 

function getNetworkState(){
	
	return Network_State;
}



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
	
	var temp = (device.platform).substr(0,1).toUpperCase();
	console.log( "======platform========" + device.platform + "====="+ temp );
	//return temp;
	return 'A';
}

// 오프라인시 셋팅
function onOffline() {
	console.log( "==onOffline");
	Network_State = false;
}

function onOnline() {
	console.log( "==onOnline");
	Network_State = true;
}

function onBackEnd( buttonIndex )
{
	if( buttonIndex == 1 ) appClose();	
}
// 기기상 백버튼 클릭시
function onBackKeyDown() {
	
	
	if( $("#back_url").attr( "visibility") == "visible" )
	{
		click_back_btn();	
	}else
	{
		//*
		navigator.notification.confirm(
            '앱을 종료 하시겠습니까?', // message
             onBackEnd,            // callback to invoke with index of button pressed
            'Game Over',           // title
            ['예','아니오']         // buttonLabels
        );	
        //*/
	}
	
}

function onPause() {
	//alert("onPause");
}

function onResume() {
	//alert("onResume");
}

function onMenuKeyDown() {
	//alert("onMenuKeyDown");	
}

function getLocationSuccess( position ){
	var message = 'Latitude: '           + position.coords.latitude              + '\n' +
                'Longitude: '          + position.coords.longitude             + '\n' +
                'Altitude: '           + position.coords.altitude              + '\n' +
                'Accuracy: '           + position.coords.accuracy              + '\n' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '\n' +
                'Heading: '            + position.coords.heading               + '\n' +
                'Speed: '              + position.coords.speed                 + '\n' +
                'Timestamp: '          + position.timestamp                    + '\n';	
                
    console.log( message );

}

function getLocationonError( err ){
	console.log(' getLocationonError code: '    + err.code    + '\n' +
  'message: ' + err.message + '\n');
}

function checkConnection() {
	
	// 테스트시 제대로 동작하지 않음 Unknown connection 으로 읽어 오는 경우가 허다함
	// 완변하게 테스트 후 컨넥션 종류에 따라 필요시 처리 처음에는 온|오프 라인만 체크
	
	// cordova 2.3 after Connetion after navigator.connection
	//var networkState = navigator.network.connection.type;
	var networkState = navigator.connection.type;
			
    var states = {};
   
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
	
	
	console.log( "Network State=======" + states[networkState] );
	/*
    if( states[networkState] != 'No network connection' )
    {
    	Network_State = true;	
    }else
    {
    	Network_State = false;	
    }
    */
   
   	Network_State = navigator.onLine;
}
	          	
//el = 결과값 보여줄 element		
function scan( el ) {
	
    cordova.plugins.barcodeScanner.scan(function(result) {
    	
    	el.val( result.text);
    	
    }, function(error) {
        alert("Scanning failed: " + error);
    });
}

function encode(type, data) {
    cordova.plugins.barcodeScanner.encode(type, data, function(result) {
    s
        alert("encode success: " + result);
    }, function(error) {
        alert("encoding failed: " + error);
    });
}
	    
