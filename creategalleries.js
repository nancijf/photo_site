var doc;
var hostName;
var hostPort;

var photoLoc, startLoc, galleries;
var cachedPhotos = {};
var thumbsPerPage = 50;
var scrollDone = false;
var prevYOffset = window.pageYOffset;
var items;
var photoArray;
var currentGal;
var galMenuShown = false;
//var hostName = 'photography.stulevine.com';
//var hostPort = '8080';

//Method used to enlarge thumbnails and view as gallery
var openPhotoSwipe = function(x) {
    var pswpElement = document.querySelectorAll('.pswp')[0];

    // define options (if needed)
    var options = {
        index: x,
        history: true,
        focus: false,
        showAnimationDuration: 0,
        hideAnimationDuration: 0
    };

    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options, currentGal);
    gallery.init();
};

//Randomly choose a photo from the first Gallery in the list for large intro photo
function getFirstPhoto(galName) {
    $('#cssmenu').hide();
    $('.contactinfo').hide();
    $.getJSON('http://'+hostName+':'+hostPort+'/api/'+galName,function(response) {
        var firstP = Math.floor((Math.random() * response.total));
        var newImage = '/m/i/2/Current/'+response.photos[firstP].name;
        $(".topPhoto").css("background", 'center no-repeat url("'+newImage+'")');
        $(".topPhoto").css("width", "100vw");
        $(".topPhoto").height($(window).height());
        $(".topPhoto").css("background-size", 'cover');
        $(".topPhoto").html('<p class="nameloc">Stu Levine Photography</p>');
    });
    loadGalleries(); //Call function to create "Galleries" menu
  }

//Read in list of galleries for menu "Galleries"
//Make ajax call to read JSON file for menu
function loadGalleries() {
    try {
    $.get('gallery.conf')
        .done(function (data) {
            console.log('File load complete');
            doc=jsyaml.load(data);
            console.log(doc);
            hostName = doc.api_host;
            hostPort = doc.api_port;

            $.ajax('http://'+hostName+':'+hostPort+'/api', {
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    galleries = response.galleries;
                    galleries = galleries.sort();
                    var galList="";
	                for (var i=0, gLen=galleries.length; i<gLen; i++) {
	                    galList += '<li><a onclick="javascript:showOrHideMenu(); javascript:getPhotosForGallery(\''+galleries[i]+'\');"><span>'+galleries[i]+'</span></a></li>';
	                }
	                $('#listofgals').html(galList);
                    var galleryPassed = getParameterByName('gallery');
                    if (galleryPassed !== "") {
	                    getPhotosForGallery(galleryPassed);
                    }
                    else {
	                    getPhotosForGallery(galleries[0]);
                    }
                }
            });
        });
    }
    catch (e) {
        console.log(e);
    }
}


function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var kvps = document.location.hash.split('&');
    var params = {};
    kvps.forEach(function(value, index) {
        kvp = value.split('=');
        params[kvp[0]] = kvp[1];
    });
    return params[name] === undefined ? "" : decodeURIComponent(params[name]);
}

//

//Read in data from json file for thumbnails and large images
//Cache data to eliminate repeated server calls
function getPhotosForGallery(name) {
  currentGal = name;
  if ((cachedPhotos[name] === null) || (typeof cachedPhotos[name] === 'undefined')) {
    $.getJSON('http://'+hostName+':'+hostPort+'/api/'+name, function(response) {
      cachedPhotos[name] = response;
      processPhotos(cachedPhotos[name]);
    });
  } else {
    processPhotos(cachedPhotos[name]);
  }

  $('.galnameloc').html('<p>'+name+'</p>');
  $('#cssmenu').show();
}


//Function to format thumbnails for page
//Calls photogrid.js file to calculate width & height of photos
//then formats grid of photos
function processPhotos(currentPhotos) {
  $('.grid').html('');
  photoGrid(currentPhotos.photos);
  items = currentPhotos.items;
  var photoPassedIn = getParameterByName('pid');
  document.location.hash = "";
  if (photoPassedIn != "") {
      openPhotoSwipe(parseInt(photoPassedIn)-1);
  }
}


//Collapse photo when scroll down to reveal first page of photos for gallery
//function didScroll() {
//  $('.nameloc').hide();
//  if (!scrollDone) {
//    var divHeight = $('.topPhoto').height();
//    if (divHeight > 0) {
//      var yHeight = divHeight-window.pageYOffset;
//      if (prevYOffset > window.pageYOffset) {
//          yHeight = divHeight+prevYOffset+window.pageYOffset;
//      }
//      $('.topPhoto').height(yHeight);
//      prevYOffset = window.pageYOffset;
//    }
//    else {
//      scrollDone = true;
//    }
//  }
//}


// Function called when resize window.
// Calls processPhotos again to recalculate width and height for photos to reformat page
function updatePhoto() {
  processPhotos(cachedPhotos[currentGal]);
}

//function to show or hide Gallery menu when click on it
function showOrHideMenu()
{
    if ($('#galleryMenu').css('display') == 'block') {
        galMenuShown = false;
        $('#galleryMenu').css('display', 'none');
        $('#cssmenu ul li').addClass('offcolor');
    }
    else {
        galMenuShown = true;
        $('#galleryMenu').css('display', 'block');
        $('#cssmenu ul li').removeClass('offcolor');
    }
}

// Add more content when scroll to bottom of page
// function yHandler(){
//   var wrap = document.getElementById('wrap');
//   var contentHeight = wrap.offsetHeight;
//   var yOffset = window.pageYOffset;
//   var y = yOffset + window.innerHeight;
//   if (y >= contentHeight) {
//     photoLoc+=thumbsPerPage;
//     startLoc+=thumbsPerPage;
//     processPhotos(cachedPhotos[currentGal]);
//     wrap.innerHTML += '<div class="newData"></div>';
//   }
//   var status = document.getElementById('status');
//   status.innerHTML = contentHeight+" | "+y;
// }

// window.onscroll = yHandler;

