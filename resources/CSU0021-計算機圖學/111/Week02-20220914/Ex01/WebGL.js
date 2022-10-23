function main(){
    ///// get the canvas 
    var canvas = document.getElementById('webgl');

    ///// get the context for draw
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    ///// clear the scrren by designated background color
    gl.clearColor(0.0, 1.0, 0.0, 1.0); //background color
    gl.clear(gl.COLOR_BUFFER_BIT); // clear
}
