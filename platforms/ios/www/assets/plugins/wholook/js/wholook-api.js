
var _WHOLOOK_STORAGE_PREFIX_ = 'wholook_storage_';

Array.prototype.remove = function(x) {
	for (i in this) {
		if (this[i].toString() == x.toString()) {
			this.splice(i, 1);
		}
	}
};

Array.prototype.removeByIdx = function(idx) {
	this.splice(idx, 1);
};

Array.prototype.values = function(field) {
	var values = [];
	
	for ( var i=0 ; i<this.length ; i++) {
		values.push(this[i][field]);
	}
	
	return values;
};

Array.prototype.findByField = function(field,val) {
	return this.getByField(field,val);
};

Array.prototype.getByField = function(field,val) {
	for ( var i=0 ; i<this.length ; i++) {
		if ( this[i][field] == val ) return this[i];
	}
	
	return null;
};

Array.prototype.getIndexByField = function(field,val) {
	for ( var i=0 ; i<this.length ; i++) {
		if ( this[i][field] == val ) return i;
	}
	
	return -1;
};

Array.prototype.findByEvalField = function(field,val) {
	for ( var i=0 ; i<this.length ; i++) {
		if ( eval('this[i].'+field) == val ) return this[i];
	}
	
	return null;
};

Array.prototype.filteredArray = function(filter) {
	var result = this;
	
	
	$.each(filter, function(field, val) {
		var filtered = [];
		
		try {
		
		$.each(result, function(idx, obj) { 
			if ( eval('obj.'+field) === val ) {
				filtered.push(obj);
			}
		});
		
		} catch(e) {
			return true;
		}
		
		result = filtered;
	});
	
	return result;
};

Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

Date.prototype.format = function() {
    var day = this.getDate();
    var month = this.getMonth() + 1;
    var year = this.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = year + "-" + month + "-" + day;

    return date;
};


////////////////////// ajax ////////////////////////////


var keyURL = '/api/handshake/';
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
	save_url:null,
	delete_url:null,
	
	data:{},
	name: null,
	model:null,
	key:'id',	
	name_key:'name',
	
	storage: {
		model: null,
		timestamp_url: '/api/timestamp/',
		force_update: false,
	},
	
	onLoading:null,
	onLoaded:null,
};

function WholookModel(options,data) {
	this.options = $.extend(true,{},__wholook_model_default_options, options);
	this.data = data || [];
	
	this.loadingStatus = ( typeof data !== 'undefined' );
}

// internal
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
	var storage_model = model.options.storage.model;
		
	// check local data availability
	if ( storage_model != null &&
		localStorage[_WHOLOOK_STORAGE_PREFIX_+storage_model] != undefined &&
		!model.options.storage.force_update ) {
		
		var local = localStorage[_WHOLOOK_STORAGE_PREFIX_+storage_model];
		local = JSON.parse(local);
	 	
	 	if ( model.options.storage.timestamp_url == null ) {
			model.loadFromServer(done, error);
			return;
		}
		 		
		wholookPost(model.options.storage.timestamp_url,{
				data:$.extend({},model.options.data,{model:storage_model}),
				done:function(json) {
					var timestamp = json.timestamp;
//					console.log('timestamp is '+timestamp+' local:'+local.timestamp);
					
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
					console.log('update timestamp to now : '+timestamp);

				}
				else {
					model.data = json.data || [];
					timestamp = json.timestamp;
					console.log('update timestamp : '+timestamp);
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
	
	var save_data = {};
	$.each(data, function(key,val) {
		
		if ( typeof val === 'object')
			save_data[key] = JSON.stringify(val);
		else
			save_data[key] = val;
		
	});
	
	wholookPost(url,{
		data: save_data,
		done: function(result) {
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
	
	if ( typeof from_server !== 'undefined' && from_server && typeof this.options.delete_url !== 'undefined' ) {
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
	return this.toWholookObject(this.getByField(this.options.key, id));
};

WholookModel.prototype.filteredObject = function(filter) {
	var data = this.data.filteredArray(filter);
	return this.toWholookObject(data);
};

WholookModel.prototype.filteredModel = function(filter) {
	var data = this.data.filteredArray(filter);
	return new WholookModel(this.options, data);
};

WholookModel.prototype.getByField = function(field, id) {
	return this.toWholookObject(this.data.findByField(field, id));
};

WholookModel.prototype.getByName = function(name) {
	var key = this.options.name_key;
	return this.toWholookObject(this.data.findByField(key, name));
};

WholookModel.prototype.all = function() {
	return this.toWholookObject(this.data);
};

WholookModel.prototype.count = function() {
	if ( this.data == null ) return 0;
	return this.data.length;
};

WholookModel.prototype.values = function(field) {
	if ( typeof field === 'undefined' ) field = this.options.key;
	return this.data.values(field);
};

WholookModel.prototype.names = function(field) {
	if ( typeof field === 'undefined' ) field = this.options.name_key;
	return this.data.values(field);
};

WholookModel.prototype.toWholookObject = function(data) {
	if ( data == null ) return null;
	
	if ( data instanceof Array ) {
		var objs = [];
		var model = this;
		
		$.each(data, function(idx,obj) {
			objs.push(new WholookObject(model, obj));
		});
		
		return objs;
	} else {
		return new WholookObject(this, data);
	}
};

//////////////////////////////////////////

function WholookObject(model,data) {
	$.extend(this,data);
	this._model = model;	
}

WholookObject.prototype.getKey = function(obj) {
	var key = this._model.options.key;
	return this[key];
};
WholookObject.prototype.getName = function(obj) {
	var key = this._model.options.name_key;
	return this[key];
};

//////////////////////////////////////////


var __wholook_loader_default_options = {
	models:[],
	onProgress:null,
	onComplete:null
};

function WholookLoader(options) {
	
	this.loaded = false;
	
	if ( options instanceof WholookModel ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:[options,]});
	} else if ( options instanceof Array ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:options});
	} else {
		this.options = $.extend({},__wholook_loader_default_options, options);
	}
	
	var loader = this;
	// string to model instance
	$.each(this.options.models, function(idx,model) {
		if ( model instanceof WholookModel ) {
//			console.log('load : '+model);

		} else if ( typeof model === 'string' ) {
			loader.options.models[idx] = new WholookModel(builtin_model_options[model]);
//			console.log('replace : '+model);
		} else {
			console.error('ignore: '+model);
		}
	});
}

WholookLoader.prototype.model = function(model) {
	return this.options.models.findByEvalField('options.model',model);
};

WholookLoader.prototype.load = function() {
	this._loadLoop(0);
};

WholookLoader.prototype.isLoaded = function() {
	return this.loaded;
};

WholookLoader.prototype.filter = function(filter) {
	$.each(this.options.models,function(idx,model) {
		 model.data =  model.data.filteredArray(filter);
	});
};

// internal only
WholookLoader.prototype._loadLoop = function(index) {

	// progress
	if (index >= this.options.models.length) {
		
		this.loaded=true;
		
		if ( this.options.onComplete != null ) 
			this.options.onComplete();
	} else {
		var target = this.options.models[index];
		if ( this.options.onProgress != null )
			this.options.onProgress((100 / this.options.models.length * index), target);

		var loop = this;
		var next_index = index + 1;
		target.load(function(data) {
//			console.log('index '+index+' in '+loop.options.models.length+' is loaded');
			loop._loadLoop(next_index);
		});
	}
	
};

///////////////// Predefined Models ///////////////////////////////

var builtin_model_options = {
	carrier: {
		url: '/biz_phone/api2/data/carrier/',
		model: 'carrier',	
		name: '통신사',
		key: 'code',
		
		storage: {
			model: 'biz_phone.carrier',
		}
		
	},
	model: {
		url: '/biz_phone/api2/data/model/',
		model: 'model',
		name: '폰모델',
		key: 'id',
		name_key: 'code',
		
		storage: {
			model: 'biz_phone.model',
		}
		
	},
	plan: {
		url: '/biz_phone/api2/data/plan/',
		model: 'plan',
		name: '요금제',
		key: 'id',
		
		
		storage: {
			model: 'biz_phone.plan',
		}
	},
	regtype: {
		url: '/biz_phone/api2/data/regtype/',
		model: 'regtype',
		name: '가입방법',
		key: 'id',
		
		storage: {
			model: 'biz_phone.regtype',
		}
	},
	
	tag: {
		url: '/biz_phone/api2/data/tag/',
		model: 'tag',
		name: '테그',
		key: 'code',
		
		storage: {
			model: 'biz_phone.tag',
		}
	},

	installment:{
		url: '/biz_phone/api2/data/installment/',
		model: 'installment',
		name: '할부개월',
		key: 'code',
		
		storage: {
			model: 'biz_phone.installment',
		}
		
	},
	
	contract: {
		url: '/biz_phone/api2/data/contract/',
		model: 'contract',
		name: '약정개월',
		key: 'code',
		
		storage: {
			model: 'biz_phone.contract',
		}
		
	},
	module: {
		url: '/biz_phone/api2/data/module/',
		model: 'module',
		name: '계산모듈',
		key: 'id',
		
		storage: {
			model: 'biz_phone.module',
		}
		
	},
	param: {
		url: '/biz_phone/api2/data/param/',
		model: 'param',
		name: '계산 파라메터',
		key: 'id',
		
		storage: {
			model: 'biz_phone.param',
		}
		
	},
};


