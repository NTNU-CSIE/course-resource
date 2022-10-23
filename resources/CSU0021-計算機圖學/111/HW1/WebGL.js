//This tempalte is just for your reference
//You do not have to follow this template 
//You are very welcome to write your program from scratch

//shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = 5.0;
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



var shapeFlag = 'p'; //p: point, h: hori line: v: verti line, t: triangle, q: square, c: circle
var colorFlag = 'r'; //r g b 

var g_points = [];
var g_horiLines = [];
var g_vertiLines = [];
var g_triangles = [];
var g_squares = [];
var g_circles = [];


//var ... of course you may need more variables

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
    //var gl = canvas.getContext('webgl') || canvas.getContext('exprimental-webgl') ;
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
 
    gl.useProgram(renderProgram);

    renderProgram.a_Position = gl.getUniformLocation(renderProgram, 'a_Position');
    renderProgram.a_FragColor = gl.getUniformLocation(renderProgram, 'a_FragColor');

    // compile shader and use program

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // mouse and key event...
    canvas.onmousedown = function(ev){click(ev, gl, renderProgram)};
    document.onkeydown = function(ev){keydown(ev)};
}

function keydown(ev){ //you may want to define more arguments for this function
    //implment keydown event here

    if(ev.key == 'r'){ //an example for user press 'r'... 
        colorFlag = 'r';
    }
    else if(ev.key == 'g'){
        colorFlag = 'g';
    }
    else if(ev.key == 'b'){
        colorFlag = 'b';
    }

    if(ev.key == 'p'){ //an example for user press 'r'... 
        shapeFlag = 'p';
    }
    else if(ev.key == 'h'){
        shapeFlag = 'h';
    }
    else if(ev.key == 'v'){
        shapeFlag = 'v';
    }
    else if(ev.key == 't'){
        shapeFlag = 't';
    }
    else if(ev.key == 's'){
        shapeFlag = 's';
    }
    else if(ev.key == 'c'){
        shapeFlag = 'c';
    }
}

function click(ev, gl, renderProgram){ //you may want to define more arguments for this function
    //mouse click: recall our quiz1 in calss
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - (rect.width / 2))/(rect.width / 2)
    y = (- (y - rect.top - (rect.height / 2)) )/(rect.height / 2)

    //you might want to do something here

    var c = [1.0,1.0,1.0];
    if(colorFlag == 'r'){
        c = [1.0,0.0,0.0] //red
    }else if(colorFlag == 'g'){
        c = [0.0,1.0,0.0] //green
    }else if(colorFlag == 'b'){
        c = [0.0,0.0,1.0] //blue
    }

    if(shapeFlag == 'p'){
        g_points.push([x, y, c[0], c[1] , c[2]]); 
    } else if(shapeFlag == 'h'){
        g_horiLines.push([x, y, c[0], c[1] , c[2]]); 
    } else if(shapeFlag == 'v'){
        g_vertiLines.push([x, y, c[0], c[1] , c[2]]); 
    } else if(shapeFlag == 't'){
        g_triangles.push([x, y, c[0], c[1] , c[2]]); 
    } else if(shapeFlag == 's'){
        g_squares.push([x, y, c[0], c[1] , c[2]]); 
    } else if(shapeFlag == 'c'){
        g_circles.push([x, y, c[0], c[1] , c[2]]); 
    }

    //self-define draw() function
    //I suggest that you can clear the canvas
    //and redraw whole frame(canvas) after any mouse click
    draw(gl, renderProgram);
}


function draw(gl, program){ //you may want to define more arguments for this function
    // redraw whole canvas here    
    // Clear canvas by background color before drawing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Note: you are only allowed to same shapes of this frame by single gl.drawArrays() call
    // Point
    var vertices = [];
    for(i = Math.max(g_points.length-5, 0); i < g_points.length; ++i){
        for(j = 0; j < 5; ++j){
            vertices.push(g_points[i][j]);
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.POINTS, 0, Math.min(g_points.length, 5));

    // H lines

    var vertices = [];
    for(i = Math.max(g_horiLines.length-5, 0); i < g_horiLines.length; ++i){
        vertices.push(1.0);
        for(j = 1; j < 5; ++j){
            vertices.push(g_horiLines[i][j]);
        }
        vertices.push(-1.0);
        for(j = 1; j < 5; ++j){
            vertices.push(g_horiLines[i][j]);
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.LINES, 0, 2*Math.min(g_horiLines.length, 5));

    // V lines

    var vertices = [];
    for(i = Math.max(g_vertiLines.length-5, 0); i < g_vertiLines.length; ++i){
        for(j = 0; j < 5; ++j){
            if(j==1) vertices.push(1.0);
            else vertices.push(g_vertiLines[i][j]);
        }
        for(j = 0; j < 5; ++j){
            if(j==1) vertices.push(-1.0);
            else vertices.push(g_vertiLines[i][j]);
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.LINES, 0, 2*Math.min(g_vertiLines.length, 5));

    // triangles

    var vertices = [];
    for(i = Math.max(g_triangles.length-5, 0); i < g_triangles.length; ++i){
        vertices.push(g_triangles[i][0]); // x
        vertices.push(g_triangles[i][1]+0.025); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_triangles[i][j]);
        }
        vertices.push(g_triangles[i][0]+0.015); // x
        vertices.push(g_triangles[i][1]-0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_triangles[i][j]);
        }
        vertices.push(g_triangles[i][0]-0.015); // x
        vertices.push(g_triangles[i][1]-0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_triangles[i][j]);
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.TRIANGLES, 0, 3*Math.min(g_triangles.length, 5));

    // squares

    var vertices = [];
    for(i = Math.max(g_squares.length-5, 0); i < g_squares.length; ++i){
        vertices.push(g_squares[i][0]+0.012); // x
        vertices.push(g_squares[i][1]+0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
        vertices.push(g_squares[i][0]+0.012); // x
        vertices.push(g_squares[i][1]-0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
        vertices.push(g_squares[i][0]-0.012); // x
        vertices.push(g_squares[i][1]+0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
        vertices.push(g_squares[i][0]+0.012); // x
        vertices.push(g_squares[i][1]-0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
        vertices.push(g_squares[i][0]-0.012); // x
        vertices.push(g_squares[i][1]+0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
        vertices.push(g_squares[i][0]-0.012); // x
        vertices.push(g_squares[i][1]-0.02); // y
        for(j = 2; j < 5; ++j){
            vertices.push(g_squares[i][j]);
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.TRIANGLES, 0, 6*Math.min(g_squares.length, 5));

    // circles

    var vertices = [];
    for(i = Math.max(g_circles.length-5, 0); i < g_circles.length; ++i){
        var v_x = Array.from({ length: 16 }, (_,i) => Math.cos(i / 16 * 2 * Math.PI));
        var v_y = Array.from({ length: 16 }, (_,i) => Math.sin(i / 16 * 2 * Math.PI));
        let c_size = 1;
        for(c = 0; c < 16; ++c){
            vertices.push(g_circles[i][0]+v_x[c]*c_size/108); // x
            vertices.push(g_circles[i][1]+v_y[c]*c_size/72); // y
            for(j = 2; j < 5; ++j){
                vertices.push(g_circles[i][j]);
            }
            if(c == 15){
                vertices.push(g_circles[i][0]+v_x[0]*c_size/108); // x
                vertices.push(g_circles[i][1]+v_y[0]*c_size/72); // y
            }
            else{
                vertices.push(g_circles[i][0]+v_x[c+1]*c_size/108); // x
                vertices.push(g_circles[i][1]+v_y[c+1]*c_size/72); // y
            }
            for(j = 2; j < 5; ++j){
                vertices.push(g_circles[i][j]);
            }
        }
    };
    vertices = new Float32Array(vertices);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var u_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(u_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    gl.enableVertexAttribArray(u_Position);

    var u_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(u_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
    gl.enableVertexAttribArray(u_Color);

    gl.drawArrays(gl.LINES, 0, 32*Math.min(g_circles.length, 5));

}
