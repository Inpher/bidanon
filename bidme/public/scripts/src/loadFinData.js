var fs = require( 'fs' );
var dirname = 'client-data/findata/'

// Loop through all the files in the temp directory
fs.readdir( dirname, function( err, files ) {
        if( err ) {
            console.error( "Could not read the directory.", err );
            process.exit( 1 );
        } 

        files.forEach( function( file, index ) {
		getJSON(file, function(json) {
		    console.log(json); 
		});
        } );
} );
