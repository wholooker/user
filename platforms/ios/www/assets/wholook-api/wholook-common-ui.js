/*!
 * wholook-ui v0.8.0 by lim
 * Copyright 2014 wholook, Inc.
 * 
 *
 * 
 */
	
	var back_action = '';
	// 메인 툴바 액션 정의
	function set_back_btn( btnState, action){
		if( btnState )
		{
			$("#back_url").css("visibility","visible");	
		}else
		{
			$("#back_url").css("visibility","hidden");
		}
		back_action = action;
	}
	// 메인 툴바에 백버튼 클릭 이벤트	
	function click_back_btn(){

		if( back_action == null || back_action == '' )
		{
			set_back_btn( false,'');	
		}else
		{
			
			switch ( back_action )
			{
				case 'SHOP_LIST_REG' :
					
					showshoplist_reg(); 
					break;
				//case 'SHOP_INFO' : logIn_after(getLocalGuestID()); break;
			}
		}
	}
	/*  메인 메뉴 움직임    */
	var isVisible = false;
	
	$("#menu_all").bind('click',function(){
		
		if( !isVisible )
		{
			$("#content-container").animate({"left":"-=270px"}, {
		        duration: 100,
		        step: function(left) {
		            if (left == -270) {
		                $("#content-container").stop();
		                isVisible = true;	
		            }
		        }
		    });
			
		}else
		{
			$("#content-container").animate({"left":"+=270px"}, {
		        duration: 100,
		        step: function(left) {
		            if (left == 0) { // stop at ~70
		                $("#content-container").stop();
		            }
		        }
		    });
			isVisible = false;	
		}
	});
    	
	
	
	/* 슬라이드 메뉴 컨트롤*/
	$(function(){
		$(".slide_up_menu").css("display","none");
		
		$(".slide_up_menu div:first-child, .slide_up_menu button:last-child").on("click",function(){	
			menuSlide();	
		});
	});
	
	function menuSlide()
	{				
		$(".slide_up_menu").slideToggle( 500,function(){
	
		}).fadeTo(1, 0.97);
	}
	
	
	/* 리스트 업데이트 컨트롤*/
	
	/**
	 * 
	 * html 코드 샘플 사용 방법 참고 
	 * 클래스 이름 기준으로 작업 CSS 해당 없음 스크립트에서 적용해야됨
	 
	<section class="list_pull_body">
		<div class="list_pull_drag_text">
			업데이트 하시려면 당겼다 놓으세요~
		</div>
		<div class="list_pull_drop_text">
			<span class="loading_img_path"></span>업데이트중...
		</div>
		
    	<div class="short_title">
    		케이스 50% 할인권 케이스 50% 할인권 케이스 50% 할인권 케이스 50% 할인권
    	</div>
    	<div class="short_title">
    		케이스 50% 할인권 케이스 50% 할인권 케이스 50% 할인권 케이스 50% 할인권
    	</div>
    </section>
    
    사용할 파일 내 javascript 내용 첨부
    
    $(function(){
			
		setUpdateTimer(3000);
	
		setLoadingImgPath("../assets/images/spinner.gif");
		
	});
	
	실제 업데이트시 해야될일 정의 함수 user define 
	
	function refresh_ui_list(){
		alert("업데이트중...");
	}
   
    
    
    
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	
	var update_timer = 3000;
	var loading_img_path = "none";
	
	
	function setUpdateTimer( val )
	{
		update_timer = val;
	}
	function setLoadingImgPath( path )
	{
		loading_img_path = path;	
	}
	
	$(function(){
		$(".list_pull_body").attr("draggable", "true");
		list_pull_text_del();

		$(".list_pull_body").bind({ 
			drop: function(ev){
				console.log("drop");
				
				list_pull_text_change('drop');
				
				var delay = Timer( update_timer, "wholook timer");
				
				delay.then( 
					function(){
						// user define function call
						refresh_ui_list();
						
						list_pull_text_del();	
					},
					function(){
						
						list_pull_text_del();	
					}
				);
				
			}, 
			dragover: function(ev){
				console.log( ev.pageY );
				ev.preventDefault();
				list_pull_text_change('dragover');
			},
			dragend: function( ev )
			{
				$(".list_pull_drag_text").css("display", "none");
			}
		});	
	});
	
	function list_pull_text_del(){
		$(".list_pull_drop_text").css("display", "none");
		$(".list_pull_drag_text").css("display", "none");			
	}
				
	function list_pull_text_change( txt ){
					
		if( txt == 'drop')
		{
			$(".list_pull_drop_text").css({
			"width": "100%",
			"height": "100px",
			"color": "#707070",
			"font-weight": "bold",
			"backgroud-color": "#A0A0A0",
			"display": "block",
			"align": "center",
			"text-align": "center"	
			});
			//<span class="loading_gif_path"></span><img src="spinner.gif">
			if( loading_img_path != "none")
			{
				$(".loading_img_path").before(
				"<img class='loading_img_src' src='" + 
				loading_img_path + 
				"' alt='loading..' style='width:35px;hight:35px;'>");	
			}
			
			$(".list_pull_drag_text").css("display","none");
		}
		else
		{
			$(".list_pull_drag_text").css({
			"width": "100%",
			"height": "100px",
			"color": "#707070",
			"font-weight": "bold",
			"backgroud-color": "#A0A0A0",
			"display": "block",
			"align": "center",
			"text-align": "center"	
			});
			
			if( loading_img_path != "none")
				$(".loading_img_src").remove();
				
			$(".list_pull_drop_text").css("display","none");		
		}
			
	}
				
	
	
	
	
	