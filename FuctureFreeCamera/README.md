FuctureFreeCamera is a free first person camera for Three.js, which can be controled in a gamelike manner. Movements with buttons and rotations with short directional mouse drags. This makes it easier and more intuitive to navigate and modify 3D environments in Three.js. Additional effects are included like deceleration of the camera when buttons are released. It is an addition (or an alternative) to already existing camera controls, such as OrbitControls or FirstPersonControls.

'W' - move forward / 
'S' - move back / 
'A' - move left / 
'D' - move right / 
'R' - move up / 
'F' - move down / 

-----------------------------------------------------------------

Demo
http://fucture.org/fucturefreecamera/

-----------------------------------------------------------------

Simple initialization example

		function initThree(){
			// initial variables
			var geometry, renderer, controls, material, mesh;

			// construct the scene & camera
			var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

			camera.position.z = 150;
			camera.position.y = -150;

			var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
			directionalLight.position.set( 0, -1, 1 );
			scene.add( directionalLight );

			renderer = new THREE.WebGLRenderer();
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );
			controls = new THREE.FuctureFreeCamera( camera,  renderer.domElement );

			// some helping geometry
			geometry = new THREE.BoxGeometry( 50, 50, 50);
			material = new THREE.MeshLambertMaterial();
			mesh = new THREE.Mesh( geometry, material );
			mesh.translateZ( 25 );
			scene.add( mesh );

			var planeGeometry = new THREE.PlaneGeometry( 500, 500 );
			var materialGround = new THREE.MeshBasicMaterial( {color: 0x222222} );
			var plane = new THREE.Mesh( planeGeometry, materialGround );
			scene.add( plane );

			render();

			function render() {
				requestAnimationFrame( render );
				controls.update();
				renderer.render( scene, camera );
			}
		}