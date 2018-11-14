class PicoKBD {

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
	stop_key_event(_event){
		_event.preventDefault();
		_event.stopPropagation();
	};

	//
	set_key_up(){
		window.addEventListener("keyup", (_e) => {
			const code = _e.keyCode;
			if(!this.is_use_other){
				//
				//
				const pckey = this.notes.filter((_pckey) => { return (_pckey === code); });
				if(pckey && pckey.length){
					this.fire("note_off", pckey[0]);
					this.stop_key_event(_e);
				}
			}
		});
	};

	//
	set_key_down(){
		window.addEventListener("keydown", (_e) => {
			const code = _e.keyCode;
			if(!this.is_use_other){
				const arrow = this.arrows.filter((_data) => { return (_data["code"] === code) ; });
				//
				// if input arrow keys
				if(arrow && arrow.length){
					const pos = {};
					pos[arrow[0].angle] = arrow[0].move;
					this.fire("move", pos);
					const cc = {cc: arrow[0].cc, val: arrow[0].move};
					this.fire("midi_cc", cc);
					this.stop_key_event(_e);
				}
				//
				// if input "zsxdcvgbhnjm," keys
				const pckey = this.notes.filter((_pckey) => { return (_pckey === code); });
				if(pckey && pckey.length){
					this.fire("note_on", pckey[0]);
					this.stop_key_event(_e);
				}
			}
		});
	};

	//
	constructor(){
		this.is_use_other = false;
		this.events = {};
		//
		this.arrows = [
			{code: 37, angle: "x", move: -1, cc:10}, // arrow L
			{code: 39, angle: "x", move:  1, cc:10}, // arrow R
			{code: 38, angle: "z", move: -1, cc: 7}, // arrow U
			{code: 40, angle: "z", move:  1, cc: 7}, // arrow D
		];
		//
		this.notes = [
			90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188
		];
		this.set_key_down();
		this.set_key_up();
	};
};
