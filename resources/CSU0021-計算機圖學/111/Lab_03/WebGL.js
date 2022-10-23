var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            gl_PointSize = 10.0;
            v_Color = a_Color;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;


function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;
  
    return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, colors){
    var nVertices = vertices.length / 3;

    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, new Float32Array(colors), 3, gl.FLOAT);
    if (!o.vertexBuffer || !o.colorBuffer) 
        console.log("Error: in initVertexBufferForLaterUse(gl, vertices, colors)"); 
    o.numVertices = nVertices;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}
/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

var transformMat = new Matrix4(); //cuon 4x4 matrix

//NOTE: You are NOT allowed to change the vertex information here
var centerPointLoc = [0.0, 0.0, 0.0]; //center white point location
var centerPointColor = [1.0, 1.0, 1.0 ]; //center white point color

//NOTE: You are NOT allowed to change the vertex information here
var rotatingPointLoc = [0.0, 0.0, 0.0]; //rotating red point location
var rotatingPointColor = [1.0, 0.0, 0.0 ]; //rotating red point color

//NOTE: You are NOT allowed to change the vertex information here
var triangleVertices = [0.0, 0.2, 0.0, -0.1, -0.3, 0.0, 0.1, -0.3, 0.0]; //green rotating triangle vertices
var triangleColor = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ]; //green trotating riangle color
   
var pointAngle = 0;  //angle for rotatin red point
var triangleAngle = 0; //angle for ratating green triangle


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    /////compile shader and use it
    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    gl.useProgram(program);

    /////prepare attribute reference of the shader
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_Color = gl.getAttribLocation(program, 'a_Color');
    program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix');
    if(program.a_Position<0 || program.a_Color<0 || program.u_modelMatrix < 0)  
        console.log('Error: f(program.a_Position<0 || program.a_Color<0 || .....');

    /////create vertex buffer of rotating point, center points, rotating triangle for later use
    centerPoint = initVertexBufferForLaterUse(gl, centerPointLoc, centerPointColor);
    rotatingPoint = initVertexBufferForLaterUse(gl, rotatingPointLoc, rotatingPointColor);
    triangle = initVertexBufferForLaterUse(gl, triangleVertices, triangleColor);

    ////For creating animation, in short this code segment will keep calling "draw(gl)" 
    ////btw, this needs "webgl-util.js" in the folder (we include it in index.html)
    var tick = function() {
        draw(gl);
        requestAnimationFrame(tick);
    }
    tick();
    
}

function draw(gl)
{
    ////clear background color by black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    transformMat.rotate(pointAngle, 0, 0, 1);

    ////////////// Begin: draw the rotating green triangle
    transformMat.setIdentity(); //set identity matrix to transformMat
    ///******TODO: you can multiple transformMat.translate() and transformMat.rotate() to make the rotating green triangle
    speed=2
    triangleAngle+=speed;
    transformMat.rotate(triangleAngle/speed, 0, 0, 1);
    transformMat.translate(0, 0.4, 0);
    transformMat.rotate(triangleAngle, 0, 0, 1);
    transformMat.translate(0, -0.2, 0);

    //Note: You are NOT Allowed to change the following code
    initAttributeVariable(gl, program.a_Position, triangle.vertexBuffer);//set triangle  vertex to shader varibale
    initAttributeVariable(gl, program.a_Color, triangle.colorBuffer); //set triangle  color to shader varibale
    gl.uniformMatrix4fv(program.u_modelMatrix, false, transformMat.elements);//pass current transformMat to shader
    gl.drawArrays(gl.TRIANGLES, 0, triangle.numVertices);//draw the triangle 
    ////////////// END: draw the rotating green triangle

    //// Begin: draw the center white point
    transformMat.setIdentity(); //set identity matrix 
    initAttributeVariable(gl, program.a_Position, centerPoint.vertexBuffer); //set center point vertex to shader varibale
    initAttributeVariable(gl, program.a_Color, centerPoint.colorBuffer); //set center point color into shader varibale
    gl.uniformMatrix4fv(program.u_modelMatrix, false, transformMat.elements); //pass current transformMat to shader
    gl.drawArrays(gl.POINTS, 0, centerPoint.numVertices); //draw the center white point
    //// END: draw the center white point

    /////////******Suggestion: read the following code and understand what's going on here (about the transofmation) 
    //// Begin: draw the rotating red point
    pointAngle++; //rotating angle of the red point
    transformMat.setIdentity(); //set identity matrix to transformMat
    transformMat.rotate(pointAngle, 0, 0, 1);
    transformMat.translate(0, 0.4, 0);
    initAttributeVariable(gl, program.a_Position, rotatingPoint.vertexBuffer); //set rotating point vertex to shader varibale
    initAttributeVariable(gl, program.a_Color, rotatingPoint.colorBuffer); //set rotating point color to shader varibale
    gl.uniformMatrix4fv(program.u_modelMatrix, false, transformMat.elements); //pass current transformMat to shader
    gl.drawArrays(gl.POINTS, 0, rotatingPoint.numVertices); //draw the rotating red point
    //// END: draw the rotating red point

}
