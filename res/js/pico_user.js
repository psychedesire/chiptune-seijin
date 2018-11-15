class PicoUser {

	//
	fire(_event, _data){
		if(!this.events[_event] || !this.events[_event].length){ return; }
		this.events[_event].forEach((_callback, _i) => {
			const to = setTimeout(() => { _callback(_data); }, 10);
		});
	};

	//
	listen(_event, _callback){
		if(typeof(_callback) !== "function"){ return; }
		if(!this.events[_event] || !this.events[_event].length){ this.events[_event] = []; }
		this.events[_event].push(_callback);
	};

	//
	set_midi_ch(_ch){
		this.local.ch = _ch;
	};

	//
	vkbd_midi_cc(_data){
		if(!this.local.vkbd){ return; }
		this.local.vkbd.set_midi_cc(_data);
	};

	//
	vkbd_note_off(_pckey){
		if(!this.local.vkbd){ return; }
		this.local.vkbd.set_note_off(_pckey);
	};

	//
	vkbd_note_on(_pckey){
		if(!this.local.vkbd){ return; }
		this.local.vkbd.set_note_on(_pckey);
	};

	//
	set_vkbd(_input){
		this.local.vkbd = _input;
		this.local.vkbd.listen("send", (_data) => {
			this.update_midi(_data);
			//ws.send("update", current.share);
		});
	};

	// update midi info
	update_midi(_data){
		if(!this.is_init){ return; }
		const midi = this.share.midi;
		for(let key in _data){
			midi[key] = _data[key];
		}
	};

	// update 3D position
	update_position(_data){
		if(!this.is_init){ return; }
		const pos = this.share.position;
		for(let key in _data){
			pos[key] += (_data[key] * this.scale);
		}
		if(pos.x < this.min_x){ pos.x = this.min_x; }
		if(pos.x > this.max_x){ pos.x = this.max_x; }
		if(pos.z < this.min_z){ pos.z = this.min_z; }
		if(pos.z > this.max_z){ pos.z = this.max_z; }
		this.local.three.position.fromArray([pos.x, pos.y, pos.z]);
	};

	// updated by other client from websocket msg
	be_updated(_event, _data){
		if(_event === "move"){
			const pos = _data.position;
			this.local.three.position.fromArray([pos.x, pos.y, pos.z]);
		}
		if(_event !== "move"){ this,update_midi(_share); }
		this.fire(_event, this.share);
	};

	//
	create_comment_line(_comment){
		const dom = document.createElement("div");
		dom.classList.add("comment_line");
		dom.innerText = _comment;
		const inner = this.local.comment.childNodes[0];
		inner.appendChild(dom);
		const to = setTimeout(() => {
			inner.removeChild(dom);
		}, 5000);
	};

	// create 3D Avatar
	create_3d_avatar(){
		const pos = this.share.position;
		const ret = new THREE.CSS3DObject(this.local.dom);
		ret.position.fromArray([pos.x, pos.y, pos.z]);
		ret.rotation.fromArray([0, 0, 0]);
		return ret;
	};

	create_2d_box(){
		const ret = document.createElement("div");
		ret.classList.add("comment_box");
		ret.innerHTML = `<div class="comment_inner"></div>`;
		return ret;
	}

	// create 2D Avatar
	create_2d_avatar(){
		const data = this.share;
		const ret  = document.createElement("div");
		ret.classList.add("avatar");
		ret.innerHTML = `
			<figure class="avatar__image">
				<img class="avatar__image_src" src="./images/avatar/seijin.png">
			</figure>
			<div class="avatar__title">
				<figure class="avatar__icon"><img class="avatar__icon_src" src=${data.icon}></figure>
				<span class="avatar__name">${data.name}</span>
			</div>
		`;
		ret.appendChild(this.local.comment);
		return ret;
	};

	clear_self(){
		this.local.comment  = null;
		this.local.dom      = null;
		this.local.three    = null;
		this.local.vkbd     = null;
		this.local.ch       = null;
		this.local          = null;
		this.share.position = null;
		this.share.midi     = null;
		this.share          = null;
	};

	// create share status
	prepare_share_status(_cnf){
		const position = (_cnf.position) ? _cnf.position : {x: this.base_x, y: 0, z: this.base_z};
		const midi     = (_cnf.midi)     ? _cnf.midi     : {cc7: 60, cc10: 64, notes: []};
		//
		this.share = _cnf;
		// 3D(three.js) position
		this.share.position = position;
		// WebAudio Setting
		this.share.audio_shape = "square";
		// WebMIDI Setting
		this.share.midi = midi;
	};

	//
	init(_cnf){
		this.id = _cnf.id;
		this.prepare_share_status(_cnf);
		this.local.comment = this.create_2d_box();
		this.local.dom     = this.create_2d_avatar();
		this.local.three   = this.create_3d_avatar();
		this.is_init       = true;
	};

	//
	constructor(){
		this.events  = {};
		this.scale   = 8;
		this.base_x  = 0;
		this.base_z  = -500;
		this.min_x   = this.base_x + (-50 * this.scale);
		this.max_x   = this.base_x + ( 50 * this.scale);
		this.min_z   = this.base_z + (-50 * this.scale);
		this.max_z   = this.base_z + ( 50 * this.scale);
		this.is_init = false;
		//
		// public status / display / three.js / WebAudio / WebMIDI
		this.share  = {};
		//
		// local status / DOM for three.js / WebMIDI input ...
		this.local      = {};
		this.local.ch   = 0;
		this.local.vkbd = "hogehoge";
	};

};