// global photo spacing
var spacer = 4;

function maxHeightForRow(start, end, widthTotal, maxHeight, maxWidth, widthArray)
{
  // console.log("start="+start+" end="+end+" widthTotal="+widthTotal+" maxHeight="+maxHeight+" maxWidth="+maxWidth);
  var dec = false;
  var totalWidth, pWidth, pHeight, scaledW;
  var newHeight = maxHeight;
  if (widthTotal > maxWidth) {
    dec = true;
  }

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
      // console.log("totalWidth ="+totalWidth+", maxWidth="+maxWidth);
    }
    if ((totalWidth <= maxWidth && dec) || (totalWidth >= maxWidth && !dec)) {
      return newHeight;
    }

  }
  return maxHeight;
}

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
  // console.log(currentPhotos.length+", "+winWidth);

  if (winWidth > 1200) {
      maxHeight = 225;
  }
  else if (winWidth < 800) {
      maxHeight = 125;
  }

  currentPhotos.forEach(function(value, index) {
    console.log(value.name);
    var ratio = maxHeight / value.size.h;
    var scaledW = value.size.w * ratio;
    widthArray.push({'w': scaledW, 'h': maxHeight});
    totalWidth += scaledW + spacer;
 
    if (totalWidth-winWidth-wTweak > (.7*scaledW)  && totalWidth > winWidth-wTweak) {
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
        console.log("idx: "+index+", "+scaledW+", "+totalWidth);        
    }
      
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
        // console.log(displayPhotos);
        $('.grid').append(displayPhotos);
        rowStart = rowEnd+1;
    }
  });
}
