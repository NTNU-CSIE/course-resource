var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_ModelMatrix;
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_ProjMatrix;
        varying vec4 v_Color;
        void main(){
            gl_Position = u_ProjMatrix*u_ViewMatrix * u_ModelMatrix * a_Position;
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

function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.useProgram(program);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(gl, program);

    var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    var u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(program, 'u_ProjMatrix');
    

    var modelMatrix = new Matrix4();
    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();

    viewMatrix.setLookAt(0, 0, 2, 0, 0, -100, 0, 1, 0);
    projMatrix.setOrtho(-1, 1, -1, 1, -10, 10);


    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
   
    modelMatrix.setTranslate(0.75, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    modelMatrix.setTranslate(-0.75, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}


function initVertexBuffers(gl, program){
    var vertices = new Float32Array(//9 vertices (three triangles)
        [
            0.0, 1.0, -4.0, 0.7, 0.0, 0.0, //x, y, z, r, g, b of the first vertex
            -0.5, -1.0, -4.0, 0.7, 0.0, 0.0,
            0.5, -1.0, -4.0, 0.7, 0.0, 0.0, 

            0.0, 1.0, -2.0, 0.0, 0.7, 0.0, 
            -0.5, -1.0, -2.0, 0.0, 0.7, 0.0, 
            0.5, -1.0, -2.0, 0.0, 0.7, 0.0, 

            0.0, 1.0, 0.0, 0.0, 0.0, 0.7, 
            -0.5, -1.0, 0.0, 0.0, 0.0, 0.7, 
            0.5, -1.0, 0.0, 0.0, 0.0, 0.7, 
        ]   
       );

    var n = 9;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}
