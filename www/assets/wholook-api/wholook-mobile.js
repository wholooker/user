

function _wholookHandShake() {
    
    var d = $.Deferred();
	var passphrase = ''; 
                
    wholookTLSHandshake(function() {
    	console.log("hand shake 성공");	
		passphrase = wtls_passphrase;
		console.log("hand shake 성공1");
        d.resolve(passphrase);
        console.log("hand shake 성공2");
    },function(e){
    	console.log("hand shake 실패");
        d.fail(e);
    });
                
    return d.promise(); 
                
}


function getTemplate(name, data) {
	
	var d = $.Deferred();
    
	$.get('./assets/templates/'+name+'.tmpl', function(response) {
		var template = Handlebars.compile(response);
		d.resolve(template(data));
	});
	
	return d.promise(); 

}


function buildShopImageFlip() {

            $('.sponsorFlip').bind("click",function(){
                    var elem = $(this);
                   
                    if(elem.data('flipped'))
                    {
                        elem.revertFlip();
                        elem.data('flipped',false)
                    }
                    else
                    {
                        elem.flip({
                            direction:'lr',
                            speed: 350,
                            onBefore: function(){
                                elem.html(elem.siblings('.sponsorData').html());
                            }
                        });
                        elem.data('flipped',true);
                    }
           });
                
}




function showAttribute(obj) {
	
  var data = '';
    
  try {
    
    for (var attr in obj) {
      if (typeof(obj[attr]) == 'string' || typeof(obj[attr]) == 'number') {
        data = data + 'Attr Name : ' + attr + ', Value : ' + obj[attr] + ', Type : ' + typeof(obj[attr]) + '<br/>';
      } else {
        data = data + 'Attr Name : ' + attr + ', Type : ' + typeof(obj[attr]) + '<br/>';
      }
    }
   
    
  } catch (e) {
    alert(e.message);
  }
  
  return data;
	    
}
