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

    //mouse event
    canvas.onmousedown = function(ev){click(ev, gl, canvas, renderProgram.u_Position, renderProgram.u_FragColor)}
}

g_points = []; // store all clicked positions
g_colors = []; // store colors of each points
function click(ev, gl, canvas, u_Position, u_FragColor){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    // console.log("x: " + x);
    // console.log("y: " + y);
    // console.log("rect. left, top, width, height: " + rect.left + " "  + rect.top + " " + rect.width + " " + rect.height );

    //Todo-1: convert x and y to canvas space and normal them to (-1, 1) for webgl to use
    x = (x - rect.left - (rect.width / 2))/(rect.width / 2)
    y = (- (y - rect.top - (rect.height / 2)) )/(rect.height / 2)

    //put mouse click position to g_points
    g_points.push([x, y]); 
    //Todo-2: calculate color of the point
    if( x >= 0 && y >= 0){
        g_colors.push([1.0,0.0,0.0, 1.0]) //red
    }else if( x < 0 && y < 0 ){
        g_colors.push([0.0,1.0,0.0, 1.0]) //green
    }else if( x < 0 && y >= 0 ){
        g_colors.push([0.0,0.0,1.0, 1.0]) //blue
    }else{
        g_colors.push([1.0,1.0,1.0, 1.0]) //white
    }

    // Clear canvas by background color before drawing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO-3: draw all points in "g_points" one-by-one
    var len = g_points.length;
    for(var i = 0; i < len; i++){
        var xy = g_points[i];
        var rgba = g_colors[i];

        gl.uniform4f(u_Position, xy[0], xy[1], 0.0, 1.0); //TODO: pass position of a point into shader to draw
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); //TODO: pass color of a point into shader to draw

        gl.drawArrays(gl.POINTS, 0, 1); //draw a point
    }
}
