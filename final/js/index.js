//LeafetJs Map
var map = L.map('map').setView([32,55],5)
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=TGy6TVCytBUk4DkgdhXn',{
    attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(map)

// DefaultRouting
    defaultCoordinates=[]  
    default_routers=[]     

function defaultRouting(){
  
    $('.loading-background').fadeIn()

    var defautlMarkerPositionStorage=[
            {lat: 35.66396799826737,lng: 51.463616583263224},   // Tehran
            {lat: 35.81335872633351, lng: 51.0040283203125},    // Karaj
            {lat: 35.54787066533268,lng: 51.22650146484375}     // EslamShahr
    ]  
         
    var j=0
    while( j < defautlMarkerPositionStorage.length-1 ){
        routingControl= L.Routing.control({
            waypoints: [
            defautlMarkerPositionStorage[j],  //startcoord
            defautlMarkerPositionStorage[j+1], //endcoord
            ]
        }).on('routesfound', function(e) {
                $('.loading-background').hide()
                $('.defaultRouting').hide()
                $('.default-options-btn').show()
                $('.defaultStartMove').show()
                $('.defaultContinueMove').hide()
                $('.defaultRestartMove').hide()
           
            // save just one routes for each destination we save rout[0] //do not need more 

            var routes = e.routes;
            defaultCoordinates.push(routes[0].coordinates)
            
        }).addTo(map)
        default_routers.push(routingControl)

        j++ 
  }


}

// customiseRouting //  

    //states :
    var markerPositionStorage=[]
    var markerArray=[]
    var markerSpeed=null    
    customeCoordinates=[]
    custome_routers=[]

    //ajax , customeformHandle : add Marker by form
    $( "#customiseForm" ).on( "submit", function(e) {
        var dataString = $(this).serialize();
        $.ajax({
            type:"POST",
            data: dataString,
        });
        e.preventDefault();
        lat=$('#lat').val()
        lng=$('#lng').val()
        markerSpeed =$('#markerSpeed').val()  
        bindPopup=$('#bindPopup').val()
        var marker=L.marker([lat,lng]).bindPopup(`<p>${bindPopup}</p>`).addTo(map).openPopup()
        markerArray.push(marker)
        var loc = L.latLng(lat,lng)
        markerPositionStorage.push(loc)
        $("#customiseForm").trigger("reset");
    
    }); 

    // customeformHandle : add Marker by click
    map.on('click',addMarker)   

    function addMarker(e){   
    
        var newMarker =L.marker(e.latlng).addTo(map); 
        markerArray.push(newMarker)
        var pos = L.latLng(e.latlng.lat,e.latlng.lng)
        markerPositionStorage.push(pos)

    }

    function customise_btn(){

        // removing Default routs from map
        for( k in  default_routers){  map.removeControl( default_routers[k]);  }
  
         // btn style change onclick
        $('.defaultRouting').hide()
        $('.default-options-btn').hide()
        $('#map').css('cursor','pointer')
        $('#custombtn').addClass('btn-dark')
        $('#defualt').removeClass('btn-dark').addClass('btn-light')
        $('#customiseForm').fadeIn()
        $('.customeRouting').show()
        $('.custome-options-btn').hide()

    }


    function customeRouting(){
    
        //clear default markers
        for( k in  markerArray)   map.removeLayer( markerArray[k]);

        // find routes
        if (markerPositionStorage.length <=1) {
            swal({ title: "", text: 'حداقل دو نقطه در نقشه انتخاب کنید',  buttons: [, 'باش']});
            markerPositionStorage=[]
            }

        else { 
            $('.loading-background').fadeIn()
            var i=0
            while(i<markerPositionStorage.length-1){
            routerControl=L.Routing.control({
                    waypoints: [
                        markerPositionStorage[i],
                        markerPositionStorage[i+1],
                    ]
                }).on('routesfound', function(e) {
                        $('.loading-background').hide()
                        $('.custome-options-btn').show()
                        $('.customeStartMove').show()
                        $('.customeRouting').hide()
                        $('.customeContinueMove').hide()
                        $('.customeStopMove').hide()
                        $('.customeRestartMove').hide()
                    var routes = e.routes;
                    // save just one routes for each destination we save rout[0]
                    customeCoordinates.push(routes[0].coordinates)
                    
                }).addTo(map);
                custome_routers.push(routerControl)
                i++
            }  
        }     
    }  

    function default_btn(){
        $('.defaultRouting').show()

        // removing custome routs & marker from map
        for( k in  custome_routers)  map.removeControl( custome_routers[k]);   
        for( k in  markerArray)   map.removeLayer( markerArray[k]); 
        markerPositionStorage=[]
        
        // btn style change onclick
        $('#map').css('cursor','default')
        $('#defualt').addClass('btn-dark')
        $('#custombtn').removeClass('btn-dark').addClass('btn-light')
        $('#customiseForm').fadeOut()

    }






// The most important and main function in this proje

// ourcoordinates: array with routes[coordinates]
//speed : number
// Selector : string : {'custome' or 'default'}
// i : start coord 
// r :start routes
function startMove(Ourcoordiantes,speed,Selector,i,r){  
 
    var carIcon = L.icon({
        className: "my-custom-pin",
        iconUrl: 'photo/car.png',
        iconSize:     [38, 45], // size of the icon
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    var StartMarker=L.marker([0,0],{ icon : carIcon})

    $(`.${Selector}StartMove`).hide()
    $(`.${Selector}StopMove , .${Selector}RestartMove`).show()   
    
    pauseFlage=false

    var h=setInterval(function(){

        if(pauseFlage === false){

            template=Ourcoordiantes[r]
            StartMarker.setLatLng([template[i].lat,template[i].lng]).addTo(map)
            i++  
        }
        

        // restart
        $(`.${Selector}RestartMove`).on('click',function(){
            $(`.${Selector}RestartMove`).hide()
            $(`.${Selector}ContinueMove`).hide()
            $(`.${Selector}StartMove`).show()
            map.removeLayer(StartMarker);  
            clearInterval(h);     
        })

        //stop
        $(`.${Selector}StopMove`).on('click',function(){
            $(`.${Selector}StopMove`).hide()
            $(`.${Selector}ContinueMove`).show()
            pauseFlage=true
            
        })

        //counitnue
        $(`.${Selector}ContinueMove`).on('click',function(){
            $(`.${Selector}ContinueMove`).hide()
            $(`.${Selector}StopMove`).show()
            pauseFlage=false 
            
        })

    
        if(i > template.length-1){     
            r++  //start next route
            i=0  //select the start coord of new rout     
        }
        
        // Exit setInterval : entehaye masir
        if(r == Ourcoordiantes.length){
            map.removeLayer(StartMarker); 
            $(`.${Selector}StopMove`).hide()
            $(`.${Selector}RestartMove`).hide()
            $(`.${Selector}ContinueMove`).hide()
            $(`.${Selector}StartMove`).show()
            swal({ title: "", text: '  واقعا صبر کردین به انتهای مسیر برسه؟       امیدوارم لذت برده باشید',  buttons: [, ':)']});
            clearInterval(h);      
        }
    
    },speed)

}
       



