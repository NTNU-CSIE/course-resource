var VSHADER_SOURCE = `
        uniform vec4 u_Position;
        void main(){
            gl_Position = u_Position;
            gl_PointSize = 10.0;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        uniform vec4 u_FragColor;
        void main(){
            gl_FragColor = u_FragColor;
        }
    `;

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
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
 
    gl.useProgram(renderProgram);

    renderProgram.u_Position = gl.getUniformLocation(renderProgram, 'u_Position');
    renderProgram.u_FragColor = gl.getUniformLocation(renderProgram, 'u_FragColor');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0; i < 10; i++){
        gl.uniform4f(renderProgram.u_Position, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0, 1.0);
        gl.uniform4f(renderProgram.u_FragColor, Math.random(), Math.random(), Math.random(), 1.0);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
