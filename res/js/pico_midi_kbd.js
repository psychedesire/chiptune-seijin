class PicoMIDIKBD {

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
	is_already_on(_pckey){
		if(!this.on_pckeys || !this.on_pckeys.length){ return false; }
		return this.on_pckeys.some((_key) => { return (_key === _pckey); });
	};

	//
	create_midi_data(_device, _u1, _u2, _u3){
		const msg = [_u1, _u2, _u3];
		const tmp = new Uint8Array(msg.length);
		tmp.set(msg);
		return {
			currentTarget: _device,
			srcElement   : _device,
			data         : tmp,
			receivedTime : window.performance.now(),
			timeStamp    : Math.floor(new Date().getTime() / 1000),
			type         : "midimessage"
		};
	};

	//
	send_data(_u1, _u2, _u3){
		_u1   += "" + this.ch.toString(16);
		_u2 = parseInt(_u2, 16);
		_u3 = _u3;
		const msg = this.create_midi_data(this, _u1, _u2, _u3);
		if(typeof(this.onmidimessage) === "function"){ this.onmidimessage(msg); }
		const data = {
			ch   : this.ch,
			cc7  : this.cc7,
			cc10 : this.cc10,
			notes: this.on_notes
		};
		this.fire("send", data);
	};

	// get cc change by pc kbd (will user avatar moving.)
	set_midi_cc(_data){
		if(_data.cc === 7) {
			this.cc7  += _data.val;
			this.cc7   = (this.cc7 < this.cc_min) ? this.cc_min : this.cc7;
			this.cc7   = (this.cc7 > this.cc_max) ? this.cc_max : this.cc7;
			this.send_data("0xB", (7).toString(16), this.cc7);
			return;
		}
		if(_data.cc === 10){
			this.cc10 += _data.val;
			this.cc10  = (this.cc10 < this.cc_min) ? this.cc_min : this.cc10;
			this.cc10  = (this.cc10 > this.cc_max) ? this.cc_max : this.cc10;
			this.send_data("0xB", (10).toString(16), this.cc10);
		}
	};

	// get note off by pc kbd
	set_note_off(_pckey){
		const data = this.negotiate.filter((_row) => { return (_row["pc"] === _pckey); });
		if(!data || !data.length){ return; }
		if(!this.is_already_on(_pckey)){ return; }
		const midi_note = data[0].note;
		this.on_pckeys = this.on_pckeys.filter((_key) => { return (_key  !== _pckey); });
		this.on_notes  = this.on_notes.filter((_note) => { return (_note !== midi_note); });
		this.send_data("0x8", midi_note, this.velocity);
	};

	// get note on by pc kbd
	set_note_on(_pckey){
		const data = this.negotiate.filter((_row) => { return (_row["pc"] === _pckey); });
		if(!data || !data.length){ return; }
		if(this.is_already_on(_pckey)){ return; }
		const midi_note = data[0].note;
		this.on_pckeys.push(_pckey);
		this.on_notes.push(midi_note);
		this.send_data("0x9", midi_note, this.velocity);
	};

	// send all note off
	punic(){
		this.on_pckeys.forEach((_pckey) => { this.send_note_off(_pckey); });
	};

	//
	constructor(_midi_ch){
		this.ch            = _midi_ch;
		this.name          = "pdPicoVKBD";
		this.id            = this.name;
		this.manifacturer  = this.name;
		this.onmidimessage = null;
		this.onstatechange = null;
		this.state         = "connected";
		this.type          = "input";
		this.version       = "";
		this.virtual       = true;
		this.events        = {};
		this.cc7           = 64; //  volume...min:14 max:114,
		this.cc10          = 64; // panning...min:14 max:114,
		this.cc_min        = 14;
		this.cc_max        = 114;
		this.on_pckeys     = [];
		this.on_notes      = [];
		this.base_note     = 0;
		this.velocity      = 64;
		this.negotiate     = [
			{ pc:  90, note: "60" }, // Zkey to C5
			{ pc:  83, note: "61" }, // Skey to C#5
			{ pc:  88, note: "62" }, // Xkey to D5
			{ pc:  68, note: "63" }, // Dkey to D#5
			{ pc:  67, note: "64" }, // Ckey to E5
			{ pc:  86, note: "65" }, // Vkey to F5
			{ pc:  71, note: "66" }, // Gkey to F#5
			{ pc:  66, note: "67" }, // Bkey to G5
			{ pc:  72, note: "68" }, // Hkey to G#5
			{ pc:  78, note: "69" }, // Nkey to A5
			{ pc:  74, note: "6a" }, // Jkey to A#5
			{ pc:  77, note: "6b" }, // Mkey to B5
			{ pc: 188, note: "6c" }, // <key to C6
		]
	};
};