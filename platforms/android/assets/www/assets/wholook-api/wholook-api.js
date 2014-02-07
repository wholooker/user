
var _WHOLOOK_STORAGE_PREFIX_ = 'wholook_storage_';

Array.prototype.remove = function(x) {
	for (i in this) {
		if (this[i].toString() == x.toString()) {
			this.splice(i, 1);
		}
	}
};

Array.prototype.findByField = function(field,key) {
	for ( var i=0 ; i<this.length ; i++) {
		if ( this[i][field] == key ) return this[i];
	}
	
	return null;
};

Array.prototype.findByEvalField = function(field,key) {
	for ( var i=0 ; i<this.length ; i++) {
		if ( eval('this[i].'+field) == key ) return this[i];
	}
	
	return null;
};

////////////////////// ajax ////////////////////////////


var keyURL = 'http://dev.wholook.net/api/handshake/';
//var keyURL = 'localhost:8000/api/handshake/';
var wtls_passphrase=null;

function get_aes_key() {
	var chrs="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}[]-=;:,.<>/?";
	key = "";
	
	for ( i=0 ; i < 32 ; i++) {
		idx = Math.floor(Math.random() * chrs.length) ;
		key += chrs[idx]; 
	}
	
	return key;
}


function wholookTLSHandshake(done,error) {
	
	$.ajaxSetup({
	    beforeSend: function(xhr, settings) {
	    	csrftoken = $.cookie('csrftoken');
	        xhr.setRequestHeader("X-CSRFToken", csrftoken);
	    }
	});
	//*/
	$.getJSON(keyURL+"1/", function(json) {
		
		var rsa = new RSAKey();
		rsa.setPublic(json.n,json.e);
		
		//
		wtls_passphrase = get_aes_key();
	 	var sfdata = rsa.encrypt(wtls_passphrase);

		$.ajax({
			url: keyURL+'2/',
			type: 'POST',
			data: {'passphrase':sfdata },
			success: done,
			error: error
		});

		
	});
}

function wholookIsHandshaked() {
	return wtls_passphrase != null;
}

function wholookSecuredPost(url, args) {
	
	$.ajaxSetup({
	    beforeSend: function(xhr, settings) {
	    	csrftoken = $.cookie('csrftoken');
	        xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        
	    }
	});
	
	if ( wtls_passphrase == null ) {
		args['error']('not handshaked');
		
		return false;
	}
	
	json = JSON.stringify(args['data']);
 	var sfdata = CryptoJS.AES.encrypt(json, wtls_passphrase).toString();
 	
	$.ajax({
		url: url,
		type: 'POST',
		dataType: "json",
		data: {'__sfdata':sfdata },
		success: args['done'],
		error: args['error']
	});
	
	return true;
}


function wholookPost(url, args) {
	
	$.ajaxSetup({
	    beforeSend: function(xhr, settings) {
	    	csrftoken = $.cookie('csrftoken');
	        xhr.setRequestHeader("X-CSRFToken", csrftoken);
	    }
	});
	
	$.ajax({
		url: url,
		type: 'POST',
		dataType: "json",
		data: args['data'],
		success: args['done'],
		error: args['error']
	});
	
}


function wholookUpdateData(url,  data, args) {
	
}


/////////////// data models /////////////////////////

var __wholook_model_default_options = {
	url:null,
	data:[],
	name: null,
	model:null,
	key:'id',	
	
	storage: {
		model: null,
		timestamp_url: null,
		force_update: false,
	},
	
	onLoading:null,
	onLoaded:null,
};

function WholookModel(options) {
	this.options = $.extend({},__wholook_model_default_options, options);
	this.data = [];
	
	this.loadingStatus = false;
}

WholookModel.prototype.changeLoadingStatus = function(status, callback) {
	var model = this;
	
	if ( status == model.loadingStatus ) return;
	model.loadingStatus = status;
	
	if ( status ) {
		// loading start
		if ( model.options.onLoading != null ) 
			model.options.onLoading();
	} else {
		// loading complete
		if ( model.options.onLoaded != null ) 
			model.options.onLoaded(model.data);
			
		if ( typeof callback !== "undefined" ) 
			callback(model.data);	
	}
};

WholookModel.prototype.load = function(done,error) {
	
	this.changeLoadingStatus(true);
	
	var model = this;
	
	// check local data availability
	if ( model.options.storage.model != null &&
		localStorage[_WHOLOOK_STORAGE_PREFIX_+model.options.storage.model] != undefined &&
		!model.options.storage.force_update ) {
		
		var local = localStorage[_WHOLOOK_STORAGE_PREFIX_+model.options.storage.model];
		local = JSON.parse(local);
	 	
	 	if ( model.options.storage.timestamp_url == null ) {
			model.loadFromServer(done, error);
			return;
		}
		 		
		wholookPost(model.options.storage.timestamp_url,{
				data:model.options.data,
				done:function(json) {
					var timestamp = json.timestamp;
					console.log(json);
					console.log('timestamp is '+timestamp);
					
					if ( local.timestamp >= timestamp ) {
						model.loadFromStorage(done, error);
					} else {
						model.loadFromServer(done, error);
					}
				},
				error:function(error) {
					console.log('에러!');
					model.loadFromServer(done, error);
				}
			});
			
	} else {
	
		model.loadFromServer(done, error);
	}
};
 
WholookModel.prototype.loadFromStorage = function(done, error) {
	var model = this;

	console.log("Load model "+this.options.model+" from Local Storage");	
	this.changeLoadingStatus(true);
	
	var local = localStorage[_WHOLOOK_STORAGE_PREFIX_+model.options.storage.model];
	local = JSON.parse(local);
	model.data = local.data;
	
	if ( done != undefined )
		model.changeLoadingStatus(false, done);
		
	return;
};

WholookModel.prototype.loadFromServer = function(done, error) {
	var model = this;

	console.log("Load model "+this.options.model+" from Server");	
	this.changeLoadingStatus(true);
		
	wholookPost(model.options.url,{
			data:model.options.data,
			done:function(json) {	
				var timestamp = parseInt(new Date().getTime() / 1000);
				
				if ( json instanceof Array )
				{
					model.data = json;	
				}
				else {
					model.data = json.data;
					timestamp = json.timestamp;
				}
				
				// save to local
				if ( model.options.storage.model != null ) {
					localStorage[_WHOLOOK_STORAGE_PREFIX_+model.options.storage.model] = JSON.stringify({
						timestamp: timestamp,
						data: model.data,
					});
				}
				
				if ( done != undefined )
					model.changeLoadingStatus(false, done);
			}
	});
};


WholookModel.prototype.save = function(data, done, error) {
	
	var model = this;
	var url = model.options.save_url;
	
	if ( typeof url === 'undefined' || url == null ) {
		console.error("save url is not set");
		return;
	}
	
	wholookPost(url,{
		data: data,
		done: function(result) {
			console.log(result);
			if ( result.result == 0 ) {
				data.id = result.id;
			}
			
			model.set(data);
			
			if ( typeof done !== 'undefined' )
				done(data);
		},
		error: function() {
			if ( typeof error !== 'undefined' )
				error();
		}
	});
};

WholookModel.prototype.set = function(object) {
	if ( object.id == -1 ) return;
	
	this.remove(object.id);
	this.data.push(object);
};

WholookModel.prototype.remove = function(id, from_server) {
	
	if ( typeof from_server !== 'undefined' && from_server ) {
		wholookPost(this.options.delete_url,{
			data: {
				id:id,
			}
		});
	}
	
	for (i in this.data) {
		if (this.data[i].id == id) {
			this.data.splice(i, 1);
			return i;
		}
	}
	
	return -1;
};

WholookModel.prototype.get = function(id) {
	return this.getByField(this.options.key, id);
};

WholookModel.prototype.getByField = function(field, id) {
	return this.data.findByField(field, id);
};

WholookModel.prototype.all = function() {
	return this.data;
};

WholookModel.prototype.count = function() {
	if ( this.data == null ) return 0;
	return this.data.length;
};

WholookModel.prototype.values = function(field) {
	var result = [];
	
	$.each(this.data, function(idx, obj) {
		result.push(obj[field]);
	});
	
	return result;
};


//////////////////////////////////////////


var __wholook_loader_default_options = {
	models:[],
	onProgress:null,
	onComplete:null
};

function WholookLoader(options) {	
	if ( options instanceof WholookModel ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:[options,]});
	} else if ( options instanceof Array ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:options});
	} else {
		this.options = $.extend({},__wholook_loader_default_options, options);
	}
}

WholookLoader.prototype.model = function(model) {
	return this.options.models.findByEvalField('options.model',model);
};

WholookLoader.prototype.load = function(index) {
	this._loadLoop(0);
};

WholookLoader.prototype._loadLoop = function(index) {

	// progress
	if (index >= this.options.models.length) {

		if ( this.options.onComplete != null )
			this.options.onComplete();
	} else {
		var target = this.options.models[index];
		if ( this.options.onProgress != null )
			this.options.onProgress((100 / this.options.models.length * index), target);

		var loop = this;
		var next_index = index + 1;
		target.load(function(data) {
			console.log('index '+index+' in '+loop.options.models.length+' is loaded');
			loop._loadLoop(next_index);
		});
	}
	
};

///////////////// Predefined Models ///////////////////////////////

var carrier = new WholookModel({
	url: '/biz_phone/api2/data/carrier/',
	model: 'carrier',	
	name: '통신사',
	key: 'code',
	
	storage: {
		model: 'carrier',
		timestamp_url : '/biz_phone/api2/data/carrier/timestamp/',
	}
	
});

var model = new WholookModel({
	url: '/biz_phone/api2/data/model/',
	model: 'model',
	name: '폰모델',
	key: 'id',
	
	storage: {
		model: 'model',
		timestamp_url : '/biz_phone/api2/data/model/timestamp/',
	}
	
});


var plan = new WholookModel({
	url: '/biz_phone/api2/data/plan/',
	model: 'plan',
	name: '요금제',
	key: 'id',
	
	
	storage: {
		model: 'plan',
		timestamp_url : '/biz_phone/api2/data/plan/timestamp/',
	}
	
});

var regtype = new WholookModel({
	url: '/biz_phone/api2/data/regtype/',
	model: 'regtype',
	name: '가입방법',
	key: 'id',
	
	storage: {
		model: 'regtype',
		timestamp_url : '/biz_phone/api2/data/regtype/timestamp/',
	}
	
});

//tag, installment, contract,module,para

var tag = new WholookModel({
	url: '/biz_phone/api2/data/tag/',
	model: 'tag',
	name: '테그',
	key: 'code',
	
	storage: {
		model: 'tag',
		timestamp_url : '/biz_phone/api2/data/tag/timestamp/',
	}
	
});

var installment = new WholookModel({
	url: '/biz_phone/api2/data/installment/',
	model: 'installment',
	name: '할부개월',
	key: 'code',
	
	storage: {
		model: 'installment',
		timestamp_url : '/biz_phone/api2/data/installment/timestamp/',
	}
	
});
var contract = new WholookModel({
	url: '/biz_phone/api2/data/contract/',
	model: 'contract',
	name: '약정개월',
	key: 'code',
	
	storage: {
		model: 'contract',
		timestamp_url : '/biz_phone/api2/data/contract/timestamp/',
	}
	
});
var module = new WholookModel({
	url: '/biz_phone/api2/data/module/',
	model: 'module',
	name: '계산모듈',
	key: 'id',
	
	storage: {
		model: 'module',
		timestamp_url : '/biz_phone/api2/data/module/timestamp/',
	}
	
});
var param = new WholookModel({
	url: '/biz_phone/api2/data/param/',
	model: 'param',
	name: '계산 파라메터',
	key: 'id',
	
	storage: {
		model: 'param',
		timestamp_url : '/biz_phone/api2/data/param/timestamp/',
	}
	
});


