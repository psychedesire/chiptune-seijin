class PicoStage {

	pop(_user_local_three){
		this.scene.remove(_user_local_three);
	};

	//
	push(_user_local_three){
		//this.users.add(_user_private_three);
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
		this.camera   = new THREE.PerspectiveCamera(fov, (this.w / this.h), 0.1, 100);
		this.scene    = new THREE.Scene();
		//this.users    = new THREE.Group();
		this.renderer = new THREE.CSS3DRenderer();
		this.frame    = this.get_frame().bind(window);
		this.renderer.setSize(this.w, this.h);
		//this.scene.add(this.users);
		this.wrapper.appendChild(this.renderer.domElement);
		this.animate();
	};
};