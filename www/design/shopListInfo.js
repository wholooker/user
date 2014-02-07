<script id="shopListInfo" type="text/x-handlebars-template">

<!--
	    <div class="list_pull_drag_text">
			업데이트 하시려면 당겼다 놓으세요~
		</div>
		<div class="list_pull_drop_text">
			<span class="loading_img_path"></span>업데이트중...
		</div>
	-->
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">
					<bold>나의 단골 매장</bold>	
					<div class="pull-right">
						<a href="#">
							매장찾기
							&nbsp;&nbsp;<span class="glyphicon glyphicon-search" style="right: 10px;"></span>
						</a>	
					</div>
				</h4>
			</div>
			<div class="panel-body">
				<ul class="list-group">
				    <li class="list-group-item">후룩텔레콤<span class="badge">VIP</span></li>
			    </ul>
			</div>
		</div>
		<div class="panel-group" id="accordion">
			<div class="panel panel-default">
				<div class="panel-heading">	
													
					<div class="row">
						<h4 class="panel-title">
							
							<div class="col-xs-12">
								
								<a data-toggle="collapse" data-parent="#accordion" href="#message1">
									
									초대매장
									
								</a>
								
								<div class="pull-right">
									<div id="delete1">
										<a href="#">
											<span class="glyphicon glyphicon-chevron-down" style="right: 10px;"></span>
										</a>
									</div>
								</div>
							</div>
							
						</h4>
						
					</div>
					
				</div><!-- 제목-->
				<div id="message1" class="panel-collapse collapse in">

					<div class="panel-body">
						<ul class="list-group">
						    <li class="list-group-item">동경텔레콤</li>
						    <li class="list-group-item">모바일존</li>
						    <li class="list-group-item">카페365</li>
						    <li class="list-group-item">여자커피</li>
						    <li class="list-group-item">더 좋은 피부샵</li>
						</ul>	
					</div>
				</div><!--초대매장 끝-->
			</div><!-- 하나의 글 -->	
			<div class="panel panel-default">
				<div class="panel-heading">
					<div class="row">
						<h4 class="panel-title">
							<div class="col-xs-12">
								<a data-toggle="collapse" data-parent="#accordion" href="#message2">
									추천 매장
								</a>
								<div class="pull-right">
									<div id="delete2">
										<a href="#">
											<span class="glyphicon glyphicon-chevron-down" style="right: 10px;"></span>
										</a>
									</div>
								</div>
							</div>
						</h4>
					</div>
				</div><!-- 제목-->
				<div id="message2" class="panel-collapse collapse">
					
					<div class="panel-body">
						<ul class="list-group">
						    <li class="list-group-item">동경텔레콤<span class="badge">강력추천</span></li>
						    <li class="list-group-item">모바일존</li>
						    <li class="list-group-item">카페365</li>
						    <li class="list-group-item">여자커피<span class="badge">강력추천</span></li>
						    <li class="list-group-item">더 좋은 피부샵</li>
						</ul>
					</div>
					
				</div><!--메세지 내용-->	
			</div>			
		</div>
		
		</script>