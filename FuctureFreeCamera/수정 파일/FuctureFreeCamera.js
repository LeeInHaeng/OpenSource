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

/**
 * @author https://github.com/LeeInHaeng/
 
 * modified context
 
     마우스 클릭으로 카메라 회전 시 ffc.update 함수에서 vectorZ값으로 인해 카메라 회전 이상 발생으로 인해
     vectorZ값 수정

    KeyUp과 KeyDown시 default값을 주어 미끄러지는 움직임 방지

    Q키와 E키에 카메라 위 아래 움직임 구현 
    이때 카메라 움직임 시 translateOnAxis 대신 translateY 사용

    attachEvent와 dettachEvent 구현

 * modified date
 
    2018-09-25
*/

THREE.FuctureFreeCamera = function ( camera, domElement ) {

	var ffc = this;

	ffc.freecam = camera;
	ffc.freecam.lookAt ( new THREE.Vector3(0,0,0) );
	ffc.domElement = ( domElement !== undefined ) ? domElement : document;
	ffc.mouseDragOn = false;
	ffc.speed = 10;
	ffc.speedin = 1;
	ffc.mousesens = 20;

	ffc.decelerationMove = 0.5;
	ffc.decelerationRotate = 0.7;

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
        
        switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
                case 2:
                    ffc.mouseDragOn = true;
                    break;
			}
	};

	ffc.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();

			switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
                case 2:
                    ffc.mouseDragOn = false;
                    break;
			}
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
			case 81: /*Q*/ ffc.moveUp = true; ffc.lastMovement = "moveUp"; break;
			case 69: /*E*/ ffc.moveDown = true; ffc.lastMovement = "moveDown"; break;
            default: ffc.lastMovement="freeze"; break;
		}
	};

	ffc.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 87: /*W*/ ffc.moveForward = false; break;
			case 65: /*A*/ ffc.moveLeft = false; break;
			case 83: /*S*/ ffc.moveBackward = false; break;
			case 68: /*D*/ ffc.moveRight = false; break;
			case 81: /*Q*/ ffc.moveUp = false; break;
			case 69: /*E*/ ffc.moveDown = false; break;
            default: ffc.freeze = !ffc.freeze; break;
		}
	};

	ffc.update = function() {
		makeRotations();
		//var vectorZ = ffc.freecam.worldToLocal(new THREE.Vector3(ffc.freecam.position.x, ffc.freecam.position.y, ffc.freecam.position.z + 1));
        
        var vectorZ = ffc.freecam.worldToLocal(new THREE.Vector3(ffc.freecam.position.x, ffc.freecam.position.y+1, ffc.freecam.position.z));
        
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
			//ffc.freecam.translateOnAxis(vectorZ, ffc.speed);
            ffc.freecam.translateY( ffc.speed );
			hasMovement = true;
		} else if( ffc.moveDown){
			//ffc.freecam.translateOnAxis(vectorZ, -ffc.speed);
            ffc.freecam.translateY( -ffc.speed );
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
                ffc.freecam.translateY( ffc.speed );
				break;
			case "moveDown":
                ffc.freecam.translateY( -ffc.speed );
				break;
		}
	}

	function makeRotations(){
		if(ffc.mouseDragOn == true){
            // 좌우 드래그
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
            
            // 위아래 드래그
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
    
    // 이벤트 추가 & 제거
    ffc.attachEvent = function(){
        window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        window.addEventListener( 'mousemove', ffc.onMouseMove, false );
        window.addEventListener( 'mousedown', ffc.onMouseDown, false );
        window.addEventListener( 'mouseup', ffc.onMouseUp, false );
        window.addEventListener( 'keydown', ffc.onKeyDown, false );
        window.addEventListener( 'keyup', ffc.onKeyUp, false );
        console.log("oi cam event attached");
    }
    
    ffc.dettachEvent = function(){
        window.removeEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        window.removeEventListener( 'mousemove', ffc.onMouseMove , false );
        window.removeEventListener( 'mousedown', ffc.onMouseDown , false );
        window.removeEventListener( 'mouseup', ffc.onMouseUp, false );
        window.removeEventListener( 'keydown', ffc.onKeyDown, false );
        window.removeEventListener( 'keyup', ffc.onKeyUp, false );
        console.log("oi cam event dettached");
    }
    
    ffc.attachEvent();

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};