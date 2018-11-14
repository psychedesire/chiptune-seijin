class PicoMIDICtrl {

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
	set_event_to_input(_input){
		_input.onmidimessage = (_event) => {
			_event.outputs = this.outputs;
			this.fire("get_midi", _event);
		};
	};

	push_output(_output){
		this.outputs.push(_output);
	};

	//
	push_input(_input){
		this.set_event_to_input(_input);
		this.inputs.push(_input);
	};

	//
	setup(){
		this.access.outputs.forEach((_output) => { this.outputs.push(_output); });
		this.access.inputs.forEach((_input)   => { this.inputs.push(_input); });
		this.inputs.forEach((_input) => {
			this.set_event_to_input(_input);
		});
		const data = {
			inputs : this.inputs,
			outputs: this.outputs
		};
		this.fire("ready", data);
	};

	//
	constructor(_cnf){
		this.inputs  = (_cnf && _cnf.inputs)  ? _cnf.inputs  : [];
		this.outputs = (_cnf && _cnf.outputs) ? _cnf.outputs : [];
		this.sysex   = (_cnf && _cnf.sysex)   ? _cnf.sysex   : null;
		this.access  = null;
		this.events  = {};
		navigator.requestMIDIAccess(this.sysex).then((_access) => {
			this.access = _access;
			this.setup();
		}).catch((_e) => {
		});
	};
};