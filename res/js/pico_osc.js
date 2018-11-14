class PicoOSC {

	// midi data (0-127) to frequency
	hex_to_hz(_note){ return parseFloat(2.205 * Math.pow(2, (1 / 12) * (_note - 9))); }

	// midi data (0-127) to float
	hex_to_float(_val){ return parseFloat(_val / 127); };

	// midi data (0-127) to bpm step (0 or 1/127step - 1/1step)
	step_to_sec(_val){
		if(_val === 0)   { return 0; }
		_val = 128 - _val;
		return parseFloat(1000 * (60 / this.bpm ) * (1 / _val) * 4);
	};

	//
	get_vco(_hz){
		const vco = this.ctx.createOscillator();
		vco.start = vco.start || vco.noteOn;
		vco.stop  = vco.stop  || vco.noteOff;
		vco.type  = (typeof(vco.type) === "string") ? this.types[this.wave] : this.wave;
		vco.detune.value    = this.detune;
		vco.frequency.value = _hz;
		return vco;
	};

	//
	set_gain_time(_arry){
		_arry.forEach((_data) => {
			this.gain_node.gain.linearRampToValueAtTime(_data.level, _data.time);
		});
	};

	//
	stop(){
		if(!this.osc){ return; }
		if(this.time_release == 0){ this.osc.stop(); return; }
		const time = parseFloat(this.ctx.currentTime) + this.time_release;
		this.set_gain_time([{level: 0, time: time}]);
		this.osc.stop();
		this.osc = null;
	};

	//
	play(_data){
		if(this.osc){ this.stop(); }
		const hz         = this.hex_to_hz(_data.note);
		const velocity   = this.hex_to_float(_data.velocity);
		const pan_x      = (this.pan_x - 0.5) * 200;
		const pan_z      = (1 - this.volume) * velocity * 100;
		const time_start = parseFloat(this.ctx.currentTime);
		this.osc         = this.get_vco(hz);
		//
		const a = {level: 1, time: (time_start + this.time_attack)};
		const d = {level: this.level_decay             , time: (a.time + this.level_decay)};
		const s = {level: this.level_decay             , time: (d.time + this.time_sustain)};
		const r = {level: 0                            , time: (s.time + this.time_release)};
		//
		this.panner.setPosition(pan_x, 0, pan_z);
		//this.osc.connect(this.gain_node);
		this.osc.connect(this.gain_node);
		this.osc.start                    (time_start);
		this.gain_node.gain.setValueAtTime(0, time_start); // envelop start
		this.set_gain_time([a, d, s, r]);
		this.gain_node.connect(this.panner);
		this.panner.connect(this.ctx.destination);
	};

	// midi data to object
	midi_to_obj(_midi_data){
		return {
			type: _midi_data[0].toString(16).substr(0, 1).toLowerCase(),
			  ch: parseInt(_midi_data[0].toString(16).substr(1, 1)),
			 ctl: parseInt(_midi_data[1]),
			 val: parseInt(_midi_data[2])
		};
	};

	// incoming midi data
	set_midi_data(_midi_data){
		const data = this.midi_to_obj(_midi_data);
		//
		if(data.ch !== this.ch){ return; }
		// note stop
		if(data.type === "8"){ this.stop(); return; }
		// note play
		if(data.type === "9"){ this.play({note: data.ctl, velocity: data.val}); return; }
		// control changes
		if(data.type !== "b"){ return; }
		switch(data.ctl){
			case  0: this.wave         = this.types[data.val]        ; return;
			case  7: this.volume       = this.hex_to_float(data.val) ; return;
			case 10: this.pan_x        = this.hex_to_float(data.val) ; return;
			case 72: this.time_release = this.step_to_sec(data.val)  ; return;
			case 73: this.time_attack  = this.step_to_sec(data.val)  ; return;
			case 75: this.level_decay  = this.hex_to_float(data.val) ; return;
			case 79: this.time_sustain = this.step_to_sec(data.val)  ; return;
			case 94: this.time_detune  = this.hex_to_float(data.val) ; return;
		}
	};

	//
	get_gain(){
		return this.ctx.createGain() || this.ctx.createGainNode();
	};

	//
	constructor(_cnf){
		this.ch            = _cnf.ch;
		this.ctx           = _cnf.ctx;
		this.bpm           = _cnf.bpm;
		this.gain_node     = this.get_gain();
		this.types         = ["square", "triangle", "sawtooth", "sine"];
		this.wave          =  0;
		this.detune        =  0;
		this.volume        =  0.5; // as 3D pan Z position with velocity
		this.time_attack   =  0;
		this.level_decay   =  1;
		this.time_sustain  =  0;
		this.time_release  =  0;
		this.osc           = null;
		this.pan_x         = 0.5;
		this.panner        = this.ctx.createPanner();
		this.panner.panningModel = "HRTF";
	};
};