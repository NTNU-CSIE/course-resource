var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main(){
            //gl_Position is key variable in GLSL (pass vertex location to fragment shader)
            gl_Position = a_Position;
        }    
    `;

var FSHADER_SOURCE = `
        void main(){
            //gl_FragColor is key variable in GLSL (assign color of a pixel)
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
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
    ///// Step 1. get the canvas 
    var canvas = document.getElementById('webgl');

    ///// Step 2. get the context for draw
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    ///// Step 3. compile the shader program (vertex and framgment shader)
    let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
 
    ///// Step 4. what program you want to use (you may have multiple shader program later)
    gl.useProgram(renderProgram);

    // var n = initVertexBuffers(gl, renderProgram);
    ///// 5. prepare the vertices for draw (we just draw 2D object here)
    /////    These are vertices of a triangle in 2D
    var vertices = new Float32Array(
        [0, -0.5, -0.5, 0.5, 0.5, 0.5]   
    );

    var n = 3; /// number of vertices

    var vertexBuffer = gl.createBuffer(); ///// create a vertex buffer to store the triangle vertices
    if(!vertexBuffer) {
        console.log('Failed to create the buffer object');
    }

    ///// bind buffer and pass the vertices data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    ///// get the reference of the variable in the shader program
    renderProgram.a_Position = gl.getAttribLocation(renderProgram, 'a_Position');
    if( renderProgram.a_Position < 0 )console.log("renderProgram.a_Position < 0"); //check you get the refernce of the variable

    gl.vertexAttribPointer(renderProgram.a_Position, 2, gl.FLOAT, false, 0, 0); //setting of the vertex buffer
    gl.enableVertexAttribArray(renderProgram.a_Position); //enable the vetex buffer

    ///// 6. clear the scrren by designated background color
    gl.clearColor(0.0, 1.0, 0.0, 1.0); //background color
    gl.clear(gl.COLOR_BUFFER_BIT); // clear

    ///// 7. draw the shape
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
