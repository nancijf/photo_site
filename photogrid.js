/*
Used to create each row of photos and create grid for display
Adds width of each photo in row until reaches width greater than the window width
Then calculates the maximum height of all photos in each row to display is even grid
*/


// global photo spacing
var spacer = 4;

//calculate the maximum height to use for all photos in a row and make right edge even
function maxHeightForRow(start, end, widthTotal, maxHeight, maxWidth, widthArray)
{
  var dec = false;
  var totalWidth, pWidth, pHeight, scaledW;
  var newHeight = maxHeight;
  if (widthTotal > maxWidth) {
    dec = true;
  }

/*
main loop through row of photos to calculate the maxHeight for each photo in row
iterates through the row up to 5000 times with small increments to get right edge
as close to window width as possible
*/
  for (var c=0; c<=5000; c++)
  {
    totalWidth = spacer;
    for (var n=start; n<=end; n++) {
      pWidth = widthArray[n].w;
      pHeight = widthArray[n].h;
      if (dec) {
        newHeight -= 0.01;
      } else {
        newHeight += 0.01;
      }

      scaledW = (newHeight/pHeight) * pWidth;
      totalWidth += scaledW + spacer;
    }
    if ((totalWidth <= maxWidth && dec) || (totalWidth >= maxWidth && !dec)) {
      return newHeight;
    }

  }
  return maxHeight;
}

/*
main function to find number of photos per row, call maxHeightPerRow,
then build html code for page
*/
function photoGrid(currentPhotos)
{
  var maxHeight = 160;
  var currentRow = 0;
  var wTweak = 125;
  var totalWidth = spacer;

  var winWidth = window.innerWidth-100;
  var rowStart = 0;
  var rowEnd = 0;
  var widthArray = [];
  var photoLen = currentPhotos.length;

  if (winWidth > 1200) {
      maxHeight = 225;
  }
  else if (winWidth < 800) {
      maxHeight = 125;
  }

// Process through each photo in currentPhotos array
  currentPhotos.forEach(function(value, index) {
    var ratio = maxHeight / value.size.h;
    var scaledW = value.size.w * ratio;
    widthArray.push({'w': scaledW, 'h': maxHeight});
    totalWidth += scaledW + spacer;

/*
Check if last photo is too large for the row and push to next row if it is
and if totalWidth of photos in row is greater than the window width
*/ 
    if (totalWidth-winWidth-wTweak > (0.7*scaledW) && totalWidth > winWidth-wTweak) {
        rowEnd = index-1;
        var returnHeight = maxHeightForRow(rowStart, rowEnd, totalWidth-scaledW-spacer, maxHeight, winWidth, widthArray);
        var displayPhotos = '<div style="padding: 0px; margin: 0px;">';
        currentRow++;
        totalWidth = scaledW + spacer*2;

        for (var i=rowStart; i<=rowEnd; i++) {
            ratio = returnHeight / widthArray[i].h;
            scaledW = widthArray[i].w * ratio;
            displayPhotos += '<a href="" onclick="javascript:openPhotoSwipe('+i+'); return false;"><img id="i'+i+'" src="'+currentPhotos[i].href+'" style="padding-right: '+spacer+'px; margin: 0;" width="'+Math.round(scaledW)+'" height=" '+Math.round(returnHeight)+'" /></a>';
        }

        displayPhotos += '</div>';
        $('.grid').append(displayPhotos);
        rowStart = index;
    }

/*
check if totalWidth of photos in the row is greater than the
width of the window or if reached the last photo
*/
    if (totalWidth > winWidth-wTweak || index == photoLen-1) {
        rowEnd = index;
        var returnHeight = maxHeightForRow(rowStart, rowEnd, totalWidth, maxHeight, winWidth, widthArray);
        var displayPhotos = '<div style="padding: 0px; margin: 0px;">';
        currentRow++;
        totalWidth = spacer;

        for (var i=rowStart; i<=rowEnd; i++) {
            ratio = returnHeight / widthArray[i].h;
            scaledW = widthArray[i].w * ratio;

            displayPhotos += '<a href="" onclick="javascript:openPhotoSwipe('+i+'); return false;"><img id="i'+i+'" src="'+currentPhotos[i].href+'" style="padding-right: '+spacer+'px; margin: 0;" width="'+Math.round(scaledW)+'" height=" '+Math.round(returnHeight)+'" /></a>';
        }

        displayPhotos += '</div>';

// push row of photos to page
        $('.grid').append(displayPhotos);
        rowStart = rowEnd+1;
    }
  });
}
