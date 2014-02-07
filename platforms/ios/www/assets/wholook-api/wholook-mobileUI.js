
var apiUrl = "http://dev.wholook.net";

function showModalMessage(jsonData) {
	
	var target = ("#.status_custom");
	
	getTemplateContents('common','modalLoading',jsonData)
	.done(function( data ){
		target.html(data);
	})
	.fail(function(){
	  	console.log('error'); 
	})
	.always(function(){
	    $("#loading").show();
	});
    
}

function showModalMessage(jsonData, viewFunc) {
	
	var target = ("#.status_custom");
	
	getTemplateContents('common','modalConfirm',jsonData)
	.done(function( data ){
		
		target.html(data);
		
        $("#btnModalConfirm").click(function(){
           $("#loading").hide();
        });
        
	})
	.fail(function(){
	  	console.log('error'); 
	})
	.always(function(){
	    $("#loading").show();
	});
                                    
                                    
}
//가입 모듈
function user_register(){
	firstStepCount+=1;
	console.log( "가입자 정보 화면 시작");
	if( firstStepCount == 3 )
	{
		console.log( "당신은 의로운 자가 아닙니다.그래서 강제 종료 됩니다.");
		
		appClose();
	}
	console.log( " user_register ");
	template = Handlebars.templates['identification']; //-- handlebar precompile 테스트 
    $("#content").html(template);
    
    // 인증번호 발송 
    $("#frmID > #btnSubmit").click(function(){ 
    	

        if($("#phoneno").val() == "") {
            alert("핸드폰번호를 입력해주십시오.");
            $("#phoneno").focus();
            return; 
        }
        
        if($("#name").val() == "") {
            alert("성함을 입력해주십시오.");
            $("#phoneno").focus();
            return; 
        }
        
        
        userVo.phone = $("#phoneno").val();
        userVo.guestName = $("#name").val();
        
        console.log( "==============user_name = " + userVo.guestName );
        
        var sendData = null;
        
        sendData = {
            'phone': userVo.phone
        };
        
        
        
        template = Handlebars.templates['modalLoading'];
        temlpate_data = {loading_text:'인증번호를 SMS로 전송중입니다.'};
        
        $(".status_custom").html(template(temlpate_data));
        $("#loading").show();
        
        wholookPost( server_url + "/api/guest/smskey/",{
        	data: sendData,
        	done: function( json ){
        		if (json.result == 0){
        			
        			//$("#loading").hide();
        			messageObj = {
        				title: "인증번호가 발송되었습니다.",
        				text: "SMS로 전달된 인증번호를 입력해 주십시요."
        			};
        			template = Handlebars.templates['modalConfirm'];
                    $(".status_custom").html(template(messageObj)); 
                    
        			$("#btnModalConfirm").click(function(){
                       
                      	var sendData =null;
		
						sendData = { 
							'phone' : userVo.phone,
							'name' : userVo.guestName,
		 					'usim': getUsim()
		                };
			            
			            console.log(  	sendData.phone + "  || " +
		                				sendData.name + "  || " +
		                				sendData.usim
		                );
    
		                wholookSecuredPost( server_url + '/api/guest/id/' ,{
				       		data:sendData,
		       				done:function( json )
		       				{
		       					$("#loading").hide();
		                        userVo.guestId = json.id;
		                        if(json.result == 0 ) {
		                        	console.log( " 게스트 아이디 요청 완전 성공");
		                        	user_UpdateLogIn();		
		                        }else if( json.result == 1 ){
		                        	//번호와 이름은 맞는데 유심이 틀릴경우
		                        	
		                        	console.log( " 성공 그러나 유심 틀림 ");
		                        	user_UpdateLogIn();
		                        	// 유심 업데이트 코드 있어야 됨	
		                        }else if( json.result == 2 ){
		                        	//유심과 이름은 맞는데 번호가 틀릴경우
		                        	
		                        	console.log( " 성공 그러나 폰번호가 틀림");
		                        	user_UpdateLogIn();
		                        	//로그인후 폰번호 변경 화면으로 이동
		                        }else if( json.result == 99 )
		                        {
		                        	console.log( " 아 몰라 에러 ");
		                        	alert( "Guest ID 가져오면서 일어날수 없는 에러");
		                        	appClose();
		                        }
		                    
		       				},
		       				error:function( jqXHR, exception ){
		       					$("#loading").hide();
		       					console.log("API Call URL - " + server_url + "/api/guest/id/" );
		       					console.log("guest id 가져오기 에러 내용 - " + jqXHR.responseText );
		       					
		       					alert( "일어나면 안되는 에러  api call error - url: " + server_url + "/api/guest/id/" );
		       					appClose();
		       				}
				       	});
                    });		
        			
        		}else
        		{
        			//빈번한 요청으로 인한 에러 발생
        			$("#loading").hide();
        			messageObj = {
                            title:'SMS인증 요청 에러',
                            text:'한시간 후에나 요청 바랍니다.'
               	    };
                	
                    template = Handlebars.templates['modalConfirm'];
                    $(".status_custom").html(template(messageObj)); 
                            
                    $("#btnModalConfirm").click(function(){
                       	$("#loading").hide();
                      	appClose()();
                    });		
        		}			
        	},
        	error: function( jqXHR, exception)
        	{
        		$("#loading").hide();
        		
        		console.log( " sms 받기 에러 - " + jqXHR.responseText);
        		console.log( " sms 받기 에러 - " + exception );
        		
        		
        		 messageObj = {
                            title:'SMS인증 요청 에러',
                            text:'서버에서 인증번호를 보낼수 없습니다. 휴대폰의 상태를 확인후 다시 시도하십시요.'
           	    };
            	//$("#loading").hide();
                template = Handlebars.templates['modalConfirm'];
                $(".status_custom").html(template(messageObj)); 
                        
                $("#btnModalConfirm").click(function(){
                   $("#loading").hide();
                   appClose();
                });
        	}
        });
       
    });
}

// 로그인&업데이트 모듈
function user_UpdateLogIn(){
	
	
	template = Handlebars.templates['setIdentificationNo'];

    $("#content").html(template);
    $("#certiNum").text('');
   
    $("#frmFillCode #btnSubmit").click(function() {
        
        template = Handlebars.templates['modalLoading'];
        temlpate_data = {loading_text:'인증중입니다...'};
        $(".status_custom").html(template(temlpate_data));
        $("#loading").show();
        
        userVo.smsKey = $("#certiNum").val(); 
        
        smsCount+=1;
        
		var sendData = null;
	
    	sendData = { 
				'guest_id' : userVo.guestId,
				'name' : userVo.guestName, 
				'phone' : userVo.phone, 
				'sms_key' : userVo.smsKey, 
				'device_type' : 'A',
				'push_key' : "pushkey",
				'force' : true
		};
		
		console.log(  	sendData.guest_id + "  || " +
						sendData.name + "  || " +
						sendData.phone + "  || " +
						sendData.sms_key + "  || " +
						sendData.device_type
		);
		
    	wholookSecuredPost( server_url + '/api/guest/update/' ,{
    		data:sendData,
    		done:function( json )
    		{
    			$("#loading").hide();
    			if( json.result == 0 ){
    				// sms 인증후 약관동의 화면
    				
    				console.log( "agreement ");
    				
    				template = Handlebars.templates['agreement'];
    				
    			    $("#content").html(template);
    			    $("#agree1, #agree2").click(function() {
    			    	
    			    	if( $("#agree1").is(":checked") &&  $("#agree2").is(":checked") )
    			    	{
    			    		logIn_after( userVo.guestId );
    			    	}
    			    });
    				
    				
    			}else if( json.result == 1){
    				//없는 guest id	
    				console.log( " guest update 에러 나올수 없는 에러 로직 에러");
    				alert("guest update 에러 나올수 없는 에러 로직 에러");	
    				appClose();
    			}else if( json.result == 2){
    				//잘못된 sms 인증
    				console.log( " 잘못된 sms 인증 ");
    				
    				if( smsCount == 3 )
		        	{
		        		messageObj = {
			                title:"SMS인증 에러 " + smsCount +"번",
			                text:'SMS 인증 3회 실패로 고객정보 부터 시작하십시요.'
		       	    	};	
		       	    	
		       	    	template = Handlebars.templates['modalConfirm'];
		            	$(".status_custom").html(template(messageObj)); 
		            	
		            	$("#btnModalConfirm").click(function(){
			            	//$("#loading").hide();
			            	smsCount = 0;
			               	user_register();
						});		
						
		        	}else
		        	{
		        		messageObj = {
			                title:"SMS인증 에러 " + smsCount +"번",
			                text:'SMS 인증이 올바르지 않습니다. 3회이상 인증절차가 취소됩니다.'
		       	    	};		
		       	    	
		       	    	template = Handlebars.templates['modalConfirm'];
		            	$(".status_custom").html(template(messageObj)); 
		            	
		            	$("#btnModalConfirm").click(function(){
			            	//$("#loading").hide();
			               
			               	user_UpdateLogIn();
						});		
		        	}
    				
    			}else if( json.result == 99){
    				console.log( " SMS인증 아 몰라 그냥 에러 ");
    				alert("guest update 에러 나올수 없는 에러");	
    				appClose();
    			}		
    		},
    		error:function( jqXHR, exception ){
    			//기존 고객일때?
    			console.log( jqXHR.responseText );
    			console.log( " SMS인증 완전 에러 ");
    			appClose();
    		}
    	});
        
    }); 
    
	
}
//로그인 모듈
function user_LogIn( guest ){
	
	sendData = {
		"guest_id" : guest
	};
	
	wholookSecuredPost( server_url + '/api/guest/update/' ,{
		data:sendData,
		done:function( json )
		{
			switch( json.result )
			{
				//로그인 성공
				case 0:
					logIn_after( guest );
				//없는 게스트 아이
				case 1:
					messageObj = {
        				title: "로그인 에러",
        				text: "기존 정보로 로그인 하실수 없습니다. 재인증 후 로그인 하십시요."
        			};
        			template = Handlebars.templates['modalConfirm'];
                    $(".status_custom").html(template(messageObj)); 
                    
        			$("#btnModalConfirm").click(function(){
                       	$("#loading").hide();
                      	removeGuestID();
                      	user_register();
                    });	
				// 아 몰라 처리 해야 됨
				/*
				default:
				    console.log( json.result + " 에러코드 로그인시 아 몰라 에러 기존 게스트 아이디를 날려야 하나?");
				*/
			}
		},
		error:function( jqXHR, exception )
		{
			console.log( "로그인에러 - " + jqXHR.responseText );	
		}
    });
}

//로그인 에프터 모듈
// 백버튼에서 왔을 경우 처리
function logIn_after( guest ){
	//wholook data model로 모든 데이터 가져오기
	
	setLocalGuestID( guest );
	
	console.log( "=========================로그인 완료 + 게스트 아이디 심음");

	if( !getNetworkState() )
	{
		// 이미 로컬 스토어지 사용 유무 체크 이후
		/*
		var objlist = null;
		objlist = getLocalToObjlist( _WHOLOOK_STORAGE_PREFIX_ + "user_invite.shoplist" );
		
		if( objlist == null )
		{
			alert( "휴대폰 상태가 오프라인으로 되어있습니다. 설정 변경후 다시 시도하십시요.");
			return;	
		}else
		{
			console.log( objlist.data.length + "개 초대받은 매장 갯수 " );
			console.log( objlist.timestamp + " 데이터 받은 시간 " );
			
			
			$.each(objlist.data, function(idx, shop) {
		
				var alldata = JSON.stringify(shop);		
				console.log( "==========" + alldata +"==========");
				
				console.log( "==========" + idx + "번째 "+ shop.biz.title +"==========");
				
			});	
			
		}
		*/
		console.log("로그인 에프터 오프라인 모드 나중에 후룩 모델에서 참조해서 만들어야 함");
	}else
	{
		
		invitelist = new WholookModel({
			url: server_url + '/api/guest/invite/',
			//data: 요청시 같이 전달될 데이터
			name: '초대매장리스트',
			model: 'invite',
			key: 'id',
			//namd_key: 
			storage: {
				model: 'user_invite.shoplist',
				//timestamp_url: 
				force_update: true
			},
			//save_url:
			//delete_url:
			//onLoading : function(){},
			//onLoaded: function(){},
		});

		msglist = new WholookModel({
			url: server_url + '/api/msg/',
			//data: 요청시 같이 전달될 데이터
			name: '메세지리스트',
			model: 'msglist',
			key: 'id',
			//namd_key: 
			storage: {
				model: 'user_msg.list',
				//timestamp_url: 
				force_update: true
			},
			//save_url:
			//delete_url:
			//onLoading : function(){},
			//onLoaded: function(){},
		});
		
		loader = new WholookLoader({
			models:[invitelist,msglist],
			onProgress: function( percent, model ){
				
				$("#loading").show();
			},
			onComplete: function() {
				$("#loading").hide();
				
				var template = Handlebars.templates['shoplistInfo'];
				var html = template(invitelist);
				
			    $("#content").html(html);  
			    
			}
		});
		loader.load();
		console.log( "==========Template loading========================");
	}
    console.log( "=============loadCustomers" );
    set_back_btn( false,'');
}
// 추후에는 초대매장 리스트에서 검색하는게 아니라 실제 매장리스트에서 검색하는 소스로 바꿔야 됨
// 매장코드가 올바르지 않을 경우 처리 요망
function showShopInfo( biz_id )
{
	var shop = invitelist.data.findByEvalField('biz.id',biz_id);
	if( shop == null )
	{
		alert( "매장 코드가 올바르지 않습니다.");
		return;
	}
	var template = Handlebars.templates['shopInfo'];
	var html = template(shop);
	
	$("#content").html(html);
	
	set_back_btn( true,'LOGIN_AFTER');
	
	
}