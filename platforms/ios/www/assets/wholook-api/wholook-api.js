

////////////////////////////////////////////////////////
/////////////// prototype extention ////////////////////
////////////////////////////////////////////////////////

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

if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}

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

////////////////////////////////////////////////////////
////////////////////// ajax ////////////////////////////
////////////////////////////////////////////////////////


var keyURL = 'http://dev.wholook.net/api/handshake/';
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


function wholookTLSHandshake(success,error) {
	
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
			success: success,
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
		success: args['success'],
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
		success: args['success'],
		error: args['error']
	});
	
}


////////////////////////////////////////////////////////////
////////////////////// data models /////////////////////////
////////////////////////////////////////////////////////////

var __WHOLOOK_STORAGE_PREFIX_ = 'wholook_storage_';
var __WHOLOOK_MODEL_DEFAULT_OPTIONS = {
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
		id: null,
		timestamp_url: '/api/timestamp/',
	},
	
};

function WholookModel(options,data) {
	if ( typeof options === "object")
 		this.options = $.extend(true,{},__WHOLOOK_MODEL_DEFAULT_OPTIONS, options);
 	else 
 		this.options = $.extend(true,{},__WHOLOOK_MODEL_DEFAULT_OPTIONS,__WHOLOOK_BUILTIN_MODEL[options]);

	this.data = data || [];
	this.loadingStatus = ( typeof data !== 'undefined' );
}

// internal
WholookModel.prototype._changeLoadingStatus = function(status) {
	var model = this;
	
	if ( status == model.loadingStatus ) return;
	model.loadingStatus = status;

};

WholookModel.prototype._getStorageKey = function() {
	return __WHOLOOK_STORAGE_PREFIX_+ this.options.storage.model + ':' + (this.options.storage.id || '');
}


WholookModel.prototype.load = function(from, success, error) {

	if ( typeof from === 'function' ) {
		error = success;
		success = from;
		from = 'auto';
	}

	var from = from || "auto";

	this._changeLoadingStatus(true);
	
	var model = this;
	var storage_model = model.options.storage.model;
	var storage_key = this._getStorageKey();
		
	// check local data availability
	if ( from === "auto" && 
		storage_model &&
		localStorage[storage_key] ) {
		
		var local = localStorage[storage_key];
		local = JSON.parse(local);
	 	
	 	if ( model.options.storage.timestamp_url == null ) {
			model.loadFromServer(success, error);
			return;
		}
		 		
		wholookPost(model.options.storage.timestamp_url,{
				data:$.extend({},model.options.data,{model:storage_model}),
				success:function(json) {
					var timestamp = json.timestamp;
					console.log('timestamp for '+ storage_key +' is '+timestamp+' local:'+local.timestamp);
					
					if ( local.timestamp >= timestamp ) {
						console.log("Load model "+storage_model+" from Local Storage");	

						model.loadFromStorage(success, error);
					} else {	
						console.log("Load model "+storage_model+" from Server");	

						model.loadFromServer(success, error);
					}
				},
				error:function(error) {
					console.log('에러!');
					model.loadFromServer(success, error);
				}
			});
			
	} else {
		if ( from === "server" )	
			model.loadFromServer(success, error);
		else if ( from === "storage") 
			model.loadFromStorage(success, error);
		else 
			model.loadFromServer(success, error);
	}
};
 
WholookModel.prototype.loadFromStorage = function(success, error) {
	var model = this;
	var storage_key = model._getStorageKey();

	model._changeLoadingStatus(true);
	
	if ( localStorage[storage_key] ) {
		var local = localStorage[storage_key];
		local = JSON.parse(local);
		model.data = local.data;
		model._changeLoadingStatus(false);

		if ( success ) 
			success(local.data);
		
	} else {
		model._changeLoadingStatus(false);

		if ( error ) 
			error('local data empty');	

		return false;
	}

	return true;
};

WholookModel.prototype.loadFromServer = function(success, error) {
	var model = this;
	model._changeLoadingStatus(true);
		
	wholookPost(model.options.url,{
			data:model.options.data,
			success:function(json) {	
				var timestamp = parseInt(new Date().getTime() / 1000);
				
				if ( json instanceof Array )
				{
					model.data = json;	
				}
				else {
					model.data = json.data || [];
					timestamp = json.timestamp;
					console.log('update '+model.options.storage.model+' timestamp : '+timestamp);
				}
				
				// save to local
				if ( model.options.storage.model ) {
					localStorage[model._getStorageKey()] = JSON.stringify({
						timestamp: timestamp,
						data: model.data,
					});
				}
				
				model._changeLoadingStatus(false);
				if ( success ) 
					success(json.data);
			},
			error:function(err) {
				model._changeLoadingStatus(false);
				if ( error ) 
					error(err);
			}
	});
};


WholookModel.prototype.save = function(data, success, error) {
	
	var model = this;
	var url = model.options.save_url;
	
	if ( url == null ) {
		console.error("save url is not set");
		return -1;
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
		success: function(result) {
			if ( result.result == 0 ) {
				data.id = result.id;
			}
			
			model.set(data);
			
			if ( success )
				success(data);
		},
		error: function() {
			if ( error )
				error();
		}
	});

	return 0;
};

WholookModel.prototype.set = function(object) {
	if ( object.id == -1 ) return;
	
	this.remove(object.id);
	this.data.push(object);
};

WholookModel.prototype.remove = function(id, from_server) {
	var from_server = from_server || false;

	if ( from_server && this.options.delete_url ) {
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

WholookModel.prototype.filteredObjects = function(filter) {
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
	var field = field || this.options.key;
	return this.data.values(field);
};

WholookModel.prototype.names = function(field) {
	var field = field || this.options.name_key;
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

WholookObject.prototype.save = function(success, error) {
	return this._model.save(this,success,error);
};

WholookObject.prototype.delete = function(from_server) {
	return this._model.remove(this.getKey(), from_server);
};

//////////////////////////////////////////

var __wholook_loader_default_options = {
	models:[],
	onProgress:null,
	onComplete:null,
	onError:null,
};

function WholookLoader(args) {
	
	this.loaded = false;
	
	if ( args instanceof WholookModel ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:[args,]});
	} else if ( args instanceof Array ) {
		this.options = $.extend({},__wholook_loader_default_options,{models:args});
	} else {
		this.options = $.extend({},__wholook_loader_default_options, args);
	}
	
	var self = this;
	// string to model instance
	$.each(self.options.models, function(idx,model) {
		if ( model instanceof WholookModel ) {

		} else if ( typeof model === 'string' ) {
			self.options.models[idx] = new WholookModel(__WHOLOOK_BUILTIN_MODEL[model]);
		} else {
			console.error('ignore: '+model);
		}
	});
}

WholookLoader.prototype.model = function(model) {
	return this.options.models.findByEvalField('options.model',model);
};

WholookLoader.prototype.load = function(from) {
	this._loadLoop(0,from||"auto");
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
WholookLoader.prototype._loadLoop = function(index, from) {
	var self = this;
	// progress
	if (index >= self.options.models.length) {
		
		self.loaded=true;
		
		if ( self.options.onComplete ) 
			self.options.onComplete();
	} else {
		var target = self.options.models[index];
		if ( self.options.onProgress )
			self.options.onProgress((100 / self.options.models.length * index), target);

		var next_index = index + 1;

		target.load(from, function(data) {
				self._loadLoop(next_index, from);
			},function(error) {
				if ( self.options.onError )
					self.options.onError(error);
				console.error('[WholookLoader] Loading error : '+error.status);
			});
	}
	
};

////////////////////////////////////////////////////////////
///////////////// Predefined Models ////////////////////////
////////////////////////////////////////////////////////////

var __WHOLOOK_BUILTIN_MODEL = {
	carrier: {
		url: '/biz_phone/api/data/carrier/',
		model: 'carrier',	
		name: '통신사',
		key: 'code',
		
		storage: {
			model: 'biz_phone.carrier',
		}
	},
	model: {
		url: '/biz_phone/api/data/model/',
		model: 'model',
		name: '폰모델',
		key: 'id',
		name_key: 'code',
		
		storage: {
			model: 'biz_phone.model',
		}
	},
	plan: {
		url: '/biz_phone/api/data/plan/',
		model: 'plan',
		name: '요금제',
		key: 'id',
		
		storage: {
			model: 'biz_phone.plan',
		}
	},
	regtype: {
		url: '/biz_phone/api/data/regtype/',
		model: 'regtype',
		name: '가입방법',
		key: 'id',
		
		storage: {
			model: 'biz_phone.regtype',
		}
	},
	tag: {
		url: '/biz_phone/api/data/tag/',
		model: 'tag',
		name: '테그',
		key: 'code',
		
		storage: {
			model: 'biz_phone.tag',
		}
	},
	installment:{
		url: '/biz_phone/api/data/installment/',
		model: 'installment',
		name: '할부개월',
		key: 'code',
		
		storage: {
			model: 'biz_phone.installment',
		}
	},
	contract: {
		url: '/biz_phone/api/data/contract/',
		model: 'contract',
		name: '약정개월',
		key: 'code',
		
		storage: {
			model: 'biz_phone.contract',
		}
	},
	module: {
		url: '/biz_phone/api/data/module/',
		model: 'module',
		name: '계산모듈',
		key: 'id',
		
		storage: {
			model: 'biz_phone.module',
		}
	},
	param: {
		url: '/biz_phone/api/data/param/',
		model: 'param',
		name: '계산 파라메터',
		key: 'id',
		
		storage: {
			model: 'biz_phone.param',
		}
	},
};


