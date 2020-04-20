
# Changelog
-----------------------------------------------------------------------------------
Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format: 

- MAJOR version when you make incompatible API changes,
- MINOR version when you add functionality in a backwards-compatible manner, and
- PATCH version when you make backwards-compatible bug fixes.

-----------------------------------------------------------------------------------
### VERSIÓ 2.2.0
- Correcció BUG actualització ruta storagePathBase en Modificar la ruta d'emmgatzamatge
- Correció BUG mostrar coordenades incorrectes del waypoints al mapa
- Corregit problema de publicació a InstaMaps

### VERSIO 2.1.0
- Afegim capa raster de normals al mapa
- Eliminiem zoom flyTo en fer punt al mapa manualment
- Fix bug: afegir waypoint

###  VERSIO 2.0.4
- Fix bug: per Android 4 o inferior (no es poden fer bucles en format 'item of ItemList')
- Fix bug: al iniciar un track en mode VT (no es podia canviar el color)
- Eliminem els links dels popups de ExtraData (donava problemes en obrir els links des de l'app)
- Tornem a ficar les imatges de les icones de posicionament i de extradata com estaven abans de la versió 2.0.0
- En mode VT s'elemina de la icona de posicionament la fletxa (no cal, perquè no gira)
- En mode VT modifiquem l'offset de la icona de posicionament en gravar el track (ara és al centre)
- Afegim overzoom per ORTO: ampliem el zoom de la orto dos nivells més per sobre del maxNativeZoom
- Afegim overzoom per TOPO: Ampliem el zoom del topo un nivell més per sobre del maxNativeZoom
- Es disminueix el gruix de les línies en gravar traces i pujar fitxers, i es dóna transparència, per millorar la seva visibilitat sobre el mapa
- Fix bug:: Quan feies clic a més tard, no tenia en compte si després feies la descàrrega, i tornava a aparéixer el missatge


###  VERSIO 2.0.3
- Controlats errors al descomprimir el zip de MBTILES
- Nous tags google analytics
- Limitem Vector Tiles per versions Android 5 o superior (la resta no WEBGL)


### VERSIÓ 2.0.2
- Canviem nom BD de llocs i elevacions perquè agafi la versió nova
- Elimienm enllaços buits dels punts d'extra data
- Arreglat bug publicar a InstaMaps


### VERSIÓ 2.0.0
- Vector Tiles + Mapbox GL JS
- Millora funcionalitat de gravar traces (punts escapats, etc)
- Actualització check de la ruta de la SD per versions Android 6.0 i superior.

### VERSIÓ 1.0.12
- Fix bug afegir MBTiles externs

### VERSIÓ 1.0.11
- Fix bug modificar la ruta de descarrega

### VERSIÓ 1.0.10
- Fix bug moure tarja SD

### VERSIÓ 1.0.9
- Fix bug debug activat en GPS

### VERSIÓ 1.0.8
- Solucionat bug visualització camp input de login instamaps
- Canvi de plugin de geolocalització per gravar tracks, que soluciona el problema de bloqueig al gravar en segon pla
- Si es mata l'aplicació, els tracks i punts afegits sortiran per defecte activats quan entra al mapa corresponent


### VERSIÓ 1.0.7
- MOdificació del plugin mFileChooser, per controlar actualització Android 6.0.1, on s'ha canviat el nom de muntatge de les SD, cosa que feia que no es trobes el seu path extern
- Modificacions per us a la versio IOS (afegir mbtiles i capes extres)


### VERSIÓ 1.0.6
- Modificació plugin sqliteplugin, per permetre obrir bases de dades en mode lectura, i per tant, poder treballar amb
mbtiles guardats a qualsevol ruta de la tarja SD externa


### VERSIÓ 1.0.5
-	Possibilitat de modificar la ruta de descàrrega dels mapes manualment
-	Nova funcionalitat que permet afegir capes d’informació addicional als mapes, sobre càmpings, albergs, refugis i turisme rural.
-	Nova funcionalitat per afegir altres mapes (en format MBTILES)
-	Possibilitat de moure l’aplicació a la targeta externa del dispositiu
-	Modificades les unitats de distància de les traces de metres a kilòmetres.
-	Millorat el comportament en cas de pèrdua de senyal GPS mentre es grava una traça
- Actualització dels noms dels fulls amb els parcs


### VERSIÓ 1.0.4

- Durant la gravació de les traces es pot anar consultant la distància actual
- Diàleg de confirmació de sortida des de el nav-back-button mentre es grava track
- Diàleg de confirmació de sortida des de hardware back button mentre es grava track
- Al publicar a InstaMaps, el nom per defecte es buida, un cop s'ha fet servir
- Corregit problema al crear un traça d'un sol punt (LineString d'un punt)
- Afegit sistema de logs per activar mode debug en cas que sigui necessari
- Afegida la opció de cancel·lar una descàrrega iniciada, però no finalitzada
- Tallar número de decimals de les coordenades al compartir
- Detectar permisos per versio android 6
- Upgraded Cordova android 5.2



### VERSIÓ 1.0.3

- bug base de dades fixed


### VERSIÓ 1.0.2

- Adaptada aplicació per funcionament en IOS
	*Solucionat bug creació fitxers GPX i KML
	*Modificat plugin google analytics a 1.0.0, sino conflicte amb normativa IDFA Apple
	*Fet servir plugin sql lite versio ext (no el que es fa servir a la versio Android)
	*La forma de descarregar/carregar fitxers és completament al núvol (no es treballa amb la memòria del dispositiu)

- Llistat ordenat per descarregats



### VERSIÓ 1.0.1

- Nova funcionalitat de cerca de llocs i elevacions
- Possibilitat de pujar les fotos al publicar a InstaMaps
- Solucionat el problema en descarregar mapes en 3G