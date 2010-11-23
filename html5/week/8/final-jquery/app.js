var canvas = null;
var ctx = null;

window.addEventListener("load", function() {
	canvas = document.getElementById('myCanvas');
	ctx = canvas.getContext('2d');
	
	addEventListeners();
	
	sizeCanvas();
	drawCanvas();
}, false);

function addEventListeners() {
	// Orientation Detection
	var supportsOrientationChange = "onorientationchange" in window;
	var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	window.addEventListener(orientationEvent, function() {
		sizeCanvas();
		drawCanvas();
	}, false);
}

function sizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function degreesToRadians(d) {
	return d * (Math.PI / 180);
}

function drawCanvas() {
	// Solid
	ctx.save();
	ctx.fillStyle = '#ff0000';
	ctx.fillRect(10, 		// X
				 10, 		// Y
				 100,		// Width
				 100		// Height
				);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 5;
	ctx.strokeRect(10, 10, 100, 100);
	ctx.restore();
	
	// Alpha
	ctx.save();
	ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
	ctx.fillRect(60, 60, 100, 100);
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 5;
	ctx.lineJoin = 'round';
	ctx.strokeRect(60.5, 60.5, 100, 100);
	ctx.restore();
	
	// Gradient
	ctx.save();
	var lingrad = ctx.createLinearGradient(110, 110, 110, 210);  
	lingrad.addColorStop(0, 'white');  
	lingrad.addColorStop(1, 'rgba(0, 0, 255, 0)');
	ctx.fillStyle = lingrad;
	ctx.fillRect(110,110,100,100);
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
	ctx.lineWidth = 5;
	ctx.strokeRect(110.5, 110.5, 100, 100);
	ctx.restore();
	
	// Pattern
	ctx.save();
	var img = document.getElementById('patternImage');
	var pattern = ctx.createPattern(img, 'repeat');  
	ctx.fillStyle = pattern;  
	ctx.fillRect(160, 160, 100, 100);
	ctx.restore();
	
	// Clear Rect
	ctx.clearRect(210,210,100,100);
	
	// Vertical Line
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(10, 320);
	ctx.lineTo(10, 420);
	ctx.stroke();
	ctx.restore();
	
	// L Shape
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(50, 320);
	ctx.lineTo(50, 420);
	ctx.lineTo(100, 420);
	ctx.stroke();
	ctx.restore();
	
	// Triangle Shape
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(150, 320);
	ctx.lineTo(150, 420);
	ctx.lineTo(200, 420);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
	
	// Arc
	ctx.save();
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.arc(60, 500, 50, 0, degreesToRadians(180), false);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	
	// Circle
	ctx.save();
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.arc(190, 500, 50, 0, degreesToRadians(360), false);
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	// Bezier Quadratic Curve
	var qcX = 10;
	var qcY = 590;
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(qcX, qcY);
	ctx.quadraticCurveTo(qcX+20,	// Control Point X
						 qcY+20,	// Control Point Y
						 qcX+0,		// End Point X
						 qcY+100	// End Point Y
						);
	ctx.stroke();
	ctx.restore();
	
	// Bezier Quadratic Curve with Control Point drawn
	var qc2X = 110;
	var qc2Y = 590;
	var qc2cpX = qc2X+20;
	var qc2cpY = qc2Y+20;
	var qc2endX = qc2X+0;
	var qc2endY = qc2Y+100;
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(qc2X, qc2Y);
	ctx.quadraticCurveTo(qc2cpX,	// Control Point X
						 qc2cpY,	// Control Point Y
						 qc2endX,	// End Point X
						 qc2endY	// End Point Y
						);
	ctx.stroke();
	ctx.restore();
	
	drawQCP(qc2X, qc2Y, qc2endX, qc2endY, qc2cpX, qc2cpY);
	
	// Bezier Cubic Curve
	var ccX = 10;
	var ccY = 750;
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(ccX, ccY);  
	ctx.bezierCurveTo(ccX+40,		// 1st Control Point X
					  ccY-40,		// 1st Control Point Y
					  ccX+100-40,	// 2nd Control Point X
					  ccY+40,		// 2nd Control Point Y
					  ccX+100,		// End Point X
					  ccY+0		// End Point Y
					);
	ctx.stroke();
	ctx.restore();
	
	// Bezier Cubic Curve with Control Points Drawn
	var cc2X = 160;
	var cc2Y = 750;
	var cc2cp1X = cc2X+40;
	var cc2cp1Y = cc2Y-40;
	var cc2cp2X = cc2X+100-40;
	var cc2cp2Y = cc2Y+40;
	var cc2endX = cc2X+100;
	var cc2endY = cc2Y+0;
	ctx.save();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(cc2X, cc2Y);  
	ctx.bezierCurveTo(cc2cp1X,	// 1st Control Point X
					  cc2cp1Y,	// 1st Control Point Y
					  cc2cp2X,	// 2nd Control Point X
					  cc2cp2Y,	// 2nd Control Point Y
					  cc2endX,	// End Point X
					  cc2endY	// End Point Y
					);
	ctx.stroke();
	ctx.restore();
	
	drawCP(cc2X, cc2Y, cc2cp1X, cc2cp1Y);
	drawCP(cc2endX, cc2endY, cc2cp2X, cc2cp2Y);
}

function drawCP(x, y, cpX, cpY) {
	ctx.save();
	
	// Draw CP
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(cpX, cpY, 3, 0, degreesToRadians(360), false);
	ctx.closePath();
	ctx.fill();
	
	// Draw line
	ctx.moveTo(x, y);
	ctx.lineTo(cpX, cpY);
	ctx.strokeStyle = 'red';
	ctx.stroke();
	
	ctx.restore();
}

function drawQCP(sx, sy, ex, ey, cpX, cpY) {
	ctx.save();
	
	// Draw CP
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(cpX, cpY, 3, 0, degreesToRadians(360), false);
	ctx.closePath();
	ctx.fill();
	
	// Draw line
	ctx.moveTo(sx, sy);
	ctx.lineTo(cpX, cpY);
	ctx.strokeStyle = 'red';
	ctx.stroke();
	
	// Draw line
	ctx.moveTo(ex, ey);
	ctx.lineTo(cpX, cpY);
	ctx.strokeStyle = 'red';
	ctx.stroke();
	
	ctx.restore();
}