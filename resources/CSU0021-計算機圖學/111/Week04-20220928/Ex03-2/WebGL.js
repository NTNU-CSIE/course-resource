var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
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

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
// function pushMatrix(){
//     matStack.push(new Matrix4(transformMat));
// }
// function popMatrix(){
//     transformMat = matStack.pop();
// }

function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    
    transformMat.setIdentity();
    console.log("setIdensity()");
    console.log(transformMat.elements);

    transformMat.setRotate(45, 0.0, 0.0, 1.0); 
    console.log("setRotate(45, 0.0, 0.0, 1.0)");
    console.log(transformMat.elements);

    transformMat.setIdentity();
    console.log("setIdentity()");
    console.log(transformMat.elements);
    
    transformMat.translate(0.0, 0.5, 0.0); 
    console.log("translate(0.0, 0.5, 0.0)");
    console.log(transformMat.elements);
    transformMat.scale(2, 3, 1.0); 
    console.log("scale(2, 3, 1.0)");
    console.log(transformMat.elements);

    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements); //pass the transformation matrix to shader
    /////Draw a triangle/////
    triangleVertices = [0.0, 0.5, -0.3, -0.5, 0.3, -0.5]; //define the triangle in object space
    var triangleColor = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ]; //red triangle
    buffer0 = initArrayBuffer(gl, new Float32Array(triangleVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(triangleColor), 3, gl.FLOAT, 'a_Color');
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/2);

}
