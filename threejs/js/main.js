let camera, scene, renderer;
let mesh;

var clock = new THREE.Clock();
var annie;


init();
//render();
animate();

function init() {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 0, 0, 1 );
    camera.lookAt( scene.position );


    //
    // runner texture plane object
    //
    
    const geometry = new THREE.PlaneBufferGeometry();
    const loader =  new THREE.TextureLoader();
    const runnerTexture = loader.load( 'js/img/run.png', function ( texture ) {
    }, undefined, function ( error ) {
	console.error( error );
    } );       
    annie = new TextureAnimator( runnerTexture, 10, 1, 10, 75 ); // texture, #horiz, #vert, #total, duration.

    const material = new THREE.MeshBasicMaterial( {map:runnerTexture} );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );


    render();
    
    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {

    renderer.render( scene, camera );

}

/** Correct UVs to be compatible with `flipY=false` textures. */
function flipY( geometry ) {

    const uv = geometry.attributes.uv;

    for ( let i = 0; i < uv.count; i ++ ) {

	uv.setY( i, 1 - uv.getY( i ) );

    }

    return geometry;

}

function animate() 
{
    requestAnimationFrame( animate );
    render();		
    update();

}

function update()
{
    var delta = clock.getDelta(); 
    
    annie.update(1000 * delta);
	
}


function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
    // note: texture passed by reference, will be updated by the update function.
    
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.x =  1/this.tilesHorizontal;
    texture.repeat.y =  1/this.tilesVertical;

    
    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;
    
    this.update = function( milliSec )
    {
	this.currentDisplayTime += milliSec;
	while (this.currentDisplayTime > this.tileDisplayDuration)
	{
	    this.currentDisplayTime -= this.tileDisplayDuration;
	    this.currentTile++;
	    if (this.currentTile == this.numberOfTiles)
		this.currentTile = 0;
	    var currentColumn = this.currentTile % this.tilesHorizontal;
	    texture.offset.x = currentColumn / this.tilesHorizontal;
	    var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
	    texture.offset.y = currentRow / this.tilesVertical;
	}
    };
}	
