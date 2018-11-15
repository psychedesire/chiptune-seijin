class PicoStage {

	pop(_user_local_three){
		this.scene.remove(_user_local_three);
	};

	//
	push(_user_local_three){
		this.scene.add(_user_local_three);
	};

	//
	get_frame(){
		return window.requestAnimationFrame ||
		       window.mozRequestAnimationFrame ||
		       window.webkitRequestAnimationFrame ||
		       window.msRequestAnimationFrame;
	};

	//
	make_stage(){
		// floor
		const floor_dom = document.createElement("div");
		floor_dom.classList.add("stage__floor");
		const floor = new THREE.CSS3DObject(floor_dom);
		floor.position.fromArray([     0, -54.5, -500]);
		floor.rotation.fromArray([ 80.11,     0,    0]);
		this.scene.add(floor);
		// wall left
		const wall_l_dom = document.createElement("div");
		wall_l_dom.classList.add("stage__wall");
		const wall_l = new THREE.CSS3DObject(wall_l_dom);
		wall_l.position.fromArray([-450,      95, -600]);
		wall_l.rotation.fromArray([   0,  -80.11, 0]);
		this.scene.add(wall_l);
		// wall right
		const wall_r_dom = document.createElement("div");
		wall_r_dom.classList.add("stage__wall");
		const wall_r = new THREE.CSS3DObject(wall_r_dom);
		wall_r.position.fromArray([450,      95, -600]);
		wall_r.rotation.fromArray([  0,  -80.11, 0]);
		this.scene.add(wall_r);
		// back
		const back_dom = document.createElement("div");
		back_dom.classList.add("stage__back");
		const back = new THREE.CSS3DObject(back_dom);
		back.position.fromArray([ 0, 90, -1000]);
		back.rotation.fromArray([ 0, 0, 0]);
		this.scene.add(back);
	};

	//
	animate(){
		this.renderer.render(this.scene, this.camera);
		this.frame(() => { this.animate(); });
	};

	//
	constructor(_wrapper){
		const fov     = 50;
		const style   = window.getComputedStyle(_wrapper, "");
		this.wrapper  = _wrapper;
		this.w        = style.width.replace("px", "") - 0;
		this.h        = style.height.replace("px", "") - 0;
		this.camera   = new THREE.PerspectiveCamera(fov, (this.w / this.h), 0.1, 90);
		this.scene    = new THREE.Scene();
		this.renderer = new THREE.CSS3DRenderer();
		this.frame    = this.get_frame().bind(window);
		this.renderer.setSize(this.w, this.h);
		this.wrapper.appendChild(this.renderer.domElement);
		this.make_stage();
		this.animate();
	};
};