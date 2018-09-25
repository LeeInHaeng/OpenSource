/**
 * @author fucture / http://fucture.org/
*/

/**
 * Some of the methods were taken from FirstPersonControls
 * that was created by mrdoob, alteredq, paulirish
 * for handling events, positioning mouseX and mouseY,
 * also handling domElement
 */

/**
Copyright (c) 2015 fucture

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

THREE.FuctureFreeCamera = function ( camera, domElement ) {

	var ffc = this;

	ffc.freecam = camera;
	ffc.freecam.lookAt ( new THREE.Vector3(0,0,0) );
	ffc.domElement = ( domElement !== undefined ) ? domElement : document;
	ffc.mouseDragOn = false;
	ffc.speed = 0;
	ffc.speedin = 2;
	ffc.mousesens = 20;

	ffc.decelerationMove = 0.9;
	ffc.decelerationRotate = 0.9;

	ffc.lastMovement = "";

	ffc.rotationRightSpeed = 0;
	ffc.rotationLeftSpeed = 0;
	ffc.rotationDownSpeed = 0;
	ffc.rotationUpSpeed = 0;

	ffc.h = 0;
	ffc.v = 0;

	Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
		return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
	};

	if ( ffc.domElement === document ) {
		ffc.viewHalfX = window.innerWidth / 2;
		ffc.viewHalfY = window.innerHeight / 2;
	} else {
		ffc.viewHalfX = ffc.domElement.offsetWidth / 2;
		ffc.viewHalfY = ffc.domElement.offsetHeight / 2;
		ffc.domElement.setAttribute( 'tabindex', -1 );
	}

	ffc.onMouseDown = function ( event ) {
		if ( ffc.domElement !== document ) {
			ffc.domElement.focus();
		}
		event.preventDefault();
		event.stopPropagation();
		if ( ffc.activeLook ) {
			switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
			}
		}
		ffc.mouseDragOn = true;
	};

	ffc.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		if ( ffc.activeLook ) {
			switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
			}
		}
		ffc.mouseDragOn = false;
	};

	ffc.onMouseMove = function ( event ) {

		if ( ffc.domElement === document ) {
			ffc.mouseX = event.pageX - ffc.viewHalfX;
			ffc.mouseY = event.pageY - ffc.viewHalfY;
		} else {
			ffc.mouseX = event.pageX - ffc.domElement.offsetLeft - ffc.viewHalfX;
			ffc.mouseY = event.pageY - ffc.domElement.offsetTop - ffc.viewHalfY;
		}
	};

	ffc.onKeyDown = function ( event ) {
		ffc.speed = ffc.speedin;
		switch( event.keyCode ) {
			case 87: /*W*/ ffc.moveForward = true; ffc.lastMovement = "moveForward"; break;
			case 65: /*A*/ ffc.moveLeft = true; ffc.lastMovement = "moveLeft"; break;
			case 83: /*S*/ ffc.moveBackward = true; ffc.lastMovement = "moveBackward"; break;
			case 68: /*D*/ ffc.moveRight = true; ffc.lastMovement = "moveRight"; break;
			case 82: /*R*/ ffc.moveUp = true; ffc.lastMovement = "moveUp"; break;
			case 70: /*F*/ ffc.moveDown = true; ffc.lastMovement = "moveDown"; break;
			case 81: /*Q*/ ffc.freeze = !ffc.freeze; ffc.lastMovement = "freeze"; break;
		}
	};

	ffc.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 87: /*W*/ ffc.moveForward = false; break;
			case 65: /*A*/ ffc.moveLeft = false; break;
			case 83: /*S*/ ffc.moveBackward = false; break;
			case 68: /*D*/ ffc.moveRight = false; break;
			case 82: /*R*/ ffc.moveUp = false; break;
			case 70: /*F*/ ffc.moveDown = false; break;
		}
	};

	ffc.update = function() {
		makeRotations();
		var vectorZ = ffc.freecam.worldToLocal(new THREE.Vector3(ffc.freecam.position.x, ffc.freecam.position.y, ffc.freecam.position.z + 1));
		ffc.freecam.rotateOnAxis(vectorZ, ffc.rotationLeftSpeed);
		ffc.freecam.rotateOnAxis(vectorZ, -ffc.rotationRightSpeed);
		ffc.freecam.rotateOnAxis(new THREE.Vector3(1,0,0), ffc.rotationUpSpeed);
		ffc.freecam.rotateOnAxis(new THREE.Vector3(1,0,0), -ffc.rotationDownSpeed);
		makeMovements(vectorZ);
	};

	function makeMovements(vectorZ){
		var hasMovement = false;
		if( ffc.moveForward ){
			ffc.freecam.translateZ ( -ffc.speed );
			hasMovement = true;
		} else if( ffc.moveBackward){
			ffc.freecam.translateZ ( ffc.speed );
			hasMovement = true;
		}
		if( ffc.moveLeft ){
			ffc.freecam.translateX( -ffc.speed );
			hasMovement = true;
		} else if( ffc.moveRight){
			ffc.freecam.translateX( ffc.speed );
			hasMovement = true;
		}
		if( ffc.moveUp ){
			ffc.freecam.translateOnAxis(vectorZ, ffc.speed);
			hasMovement = true;
		} else if( ffc.moveDown){
			ffc.freecam.translateOnAxis(vectorZ, -ffc.speed);
			hasMovement = true;
		}
		if(!hasMovement) {
			decelerateMovement(vectorZ);
		}
	}

	function decelerateMovement(vectorZ){
		ffc.speed *= ffc.decelerationMove;
		switch( ffc.lastMovement ) {
			case "moveForward":
				ffc.freecam.translateZ ( -ffc.speed );
				break;
			case "moveLeft":
				ffc.freecam.translateX( -ffc.speed );
				break;
			case "moveBackward":
				ffc.freecam.translateZ ( ffc.speed );
				break;
			case "moveRight":
				ffc.freecam.translateX( ffc.speed );
				break;
			case "moveUp":
				ffc.freecam.translateOnAxis(vectorZ, ffc.speed);
				break;
			case "moveDown":
				ffc.freecam.translateOnAxis(vectorZ, -ffc.speed);
				break;
		}
	}

	function makeRotations(){
		if(ffc.mouseDragOn == true){
			var differX = ffc.previousMouseX - ffc.mouseX;
			if (ffc.previousMouseX - ffc.mouseX < 0)
			{
				ffc.rotationRightSpeed = differX.map(-100, -1, 0.2, 0.005);
				ffc.h -= ffc.rotationRightSpeed;
			}
			if (ffc.previousMouseX - ffc.mouseX > 0)
			{
				ffc.rotationLeftSpeed = differX.map(1, 100, 0.005, 0.2);
				ffc.h += ffc.rotationLeftSpeed;
			}
			var differY = ffc.previousMouseY - ffc.mouseY;
			if (ffc.previousMouseY - ffc.mouseY < 0)
			{
				ffc.rotationDownSpeed = differY.map(-100, -1, 0.2, 0.005);
				ffc.v -= ffc.rotationDownSpeed;
			}
			if (ffc.previousMouseY - ffc.mouseY > 0)
			{
				ffc.rotationUpSpeed = differY.map(1, 100, 0.01, 0.3);
				ffc.v += ffc.rotationUpSpeed;
			}
		}

		if (ffc.rotationRightSpeed > 0.0001)
		{
			ffc.rotationRightSpeed *= ffc.decelerationRotate;
		}
		else
		{
			ffc.rotationRightSpeed = 0;
		}
		if (ffc.rotationLeftSpeed > 0.0001)
		{
			ffc.rotationLeftSpeed *= ffc.decelerationRotate;
		}
		else
		{
			ffc.rotationLeftSpeed = 0;
		}
		if (ffc.rotationDownSpeed > 0.0001)
		{
			ffc.rotationDownSpeed *= ffc.decelerationRotate;
		}
		else
		{
			ffc.rotationDownSpeed = 0;
		}
		if (ffc.rotationUpSpeed > 0.0001)
		{
			ffc.rotationUpSpeed *= ffc.decelerationRotate;
		}
		else
		{
			ffc.rotationUpSpeed = 0;
		}

		ffc.h -= ffc.rotationRightSpeed;
		ffc.h += ffc.rotationLeftSpeed;

		ffc.v -= ffc.rotationDownSpeed;
		ffc.v += ffc.rotationUpSpeed;

		ffc.previousMouseX = ffc.mouseX;
		ffc.previousMouseY = ffc.mouseY;
	}

	ffc.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	ffc.domElement.addEventListener( 'mousemove', bind( ffc, ffc.onMouseMove ), false );
	ffc.domElement.addEventListener( 'mousedown', bind( ffc, ffc.onMouseDown ), false );
	ffc.domElement.addEventListener( 'mouseup', bind( ffc, ffc.onMouseUp ), false );
	ffc.domElement.addEventListener( 'keydown', bind( ffc, ffc.onKeyDown ), false );
	ffc.domElement.addEventListener( 'keyup', bind( ffc, ffc.onKeyUp ), false );

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};