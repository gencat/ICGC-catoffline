// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
			mbTilesDB: null,
			imageFormat: 'png',
			initialize: function(url, options) {

		        //console.info("MBTiles Init BD MBTiles");

					if (options.imageFormat!=null && options.imageFormat!='') this.imageFormat = options.imageFormat;

						//console.info("options: "+JSON.stringify(options));

					if(ionic.Platform.isIOS()){
						// console.info("ios platform....");
						// console.info("IOS url: "+ url);
						//Si es de tipus added, la BD obre diferent
						if(options.mytype){

							this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url, iosDatabaseLocation: 'Documents'}, function(){
												//this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url}, function(){
												// console.info("------------------------MBTiles DB oberta OK!");
										}, function(){
												// console.info("-------------------------MBTiles DB NO oberta KO!");
										});

						}else{

							this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url, createFromLocation: 1, location: 'default'}, function(){
												//this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url}, function(){
												// console.info("------------------------MBTiles DB oberta OK!");
										}, function(){
												// console.info("-------------------------MBTiles DB NO oberta KO!");
										});
						}

					}else{

						this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url, createFromLocation: options.modeAssets, location: 2, androidDatabaseImplementation: 2}, function(){
												//console.info("------------------------MBTiles DB oberta OK!");
										}, function(){
												//console.info("-------------------------MBTiles DB NO oberta KO!");
										});
					}
					L.Util.setOptions(this, options);

			},
			getTileUrl: function (tilePoint, zoom, tile) {
						//console.info("---------------getTileUrl:"+tilePoint+"-"+zoom+"-"+tile);
		        //var z = this._getOffsetZoom(zoom);
		        this._adjustTilePoint(tilePoint);
		        var z = this._getZoomForUrl();
						var x = tilePoint.x;
						var y = tilePoint.y;
		        //console.info("MBTiles ---------------z/x/y:"+z+"-"+x+"-"+y);
						var base64Prefix = 'data:image/'+this.imageFormat+';base64,';
						//console.debug("MBTiles base64Prefix: "+base64Prefix);

						this.mbTilesDB.executeSql("SELECT tile_data as myTile FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (res) {
				            if(res.rows.length > 0) {
				                //console.log("MBTiles SELECTED -> " + res.rows.item(0).myTile );
				                tile.src = base64Prefix + res.rows.item(0).myTile;
				            }else {
				                console.error("MBTiles No results found");
				            }
						}, function (er) {
							console.error('MBTiles ---------------------error with executeSql, er:'+er);
				      console.error(er);
						});
			},
			_loadTile: function (tile, tilePoint, zoom) {
						tile._layer = this;
						tile.onload = this._tileOnLoad;
						tile.onerror = this._tileOnError;
						this.getTileUrl(tilePoint, this.options.zoom, tile);
			}
});

L.tileLayer.mbtiles = function(url, options) {
	//console.debug("MBTiles prev  options:"+JSON.stringify(options));
	//console.debug("MBTiles prev url:"+url);
	//return new L.TileLayer.Mask(url, options);
	return new L.TileLayer.MBTiles(url, options);
};
