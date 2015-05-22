var newRect = function(x, y, width, height) {
    var l = 0;
    var t = 1;
    var r = 2;
    var b = 3;

    var rect = [];

    rect[l] = x;
    rect[t] = -y;
    rect[r] = width + x;
    rect[b] = -(height - rect[t]);

    return rect;
};


function copyGroupItemsToNewDocument() {
    var items = app.selection
    var newDoc = documents.add()
    var newArtboard = newDoc.artboards[0]
    var padding = 20

    newArtboard.artboardRect=newRect(0,0,items[0].width,items[0].height)
    var points = [[0,0]]
    var artb
    for (var i = 1; i < items.length; i++) {
        var newPoint = [points[i-1][0] + items[i-1].width + padding,points[i-1][1]]
        // newArtboard = newDoc.artboards.add(newRect(newPoint[0],newPoint[1],items[i].width,items[i].height));
        points.push(newPoint)
    }

    for (var i = 0; i < items.length ; i++) {
        // newDoc.artboards.setActiveArtboardIndex(i)
        var copyItem = items[i].duplicate(newDoc)
        copyItem.position = points[i]
        left = copyItem.geometricBounds[0]
        top = copyItem.geometricBounds[1]
        right = copyItem.geometricBounds[2]
        bottom = copyItem.geometricBounds[3]
        newArtboard = newDoc.artboards.add([left-0.5,top+0.5,right+0.5,bottom-0.5])
        // items[i].selected = false
        // copyItem.hasSelectedArtwork = true
        // newDoc.fitArtboardToSelectedArt(i)
        // copyItem.hasSelectedArtwork = false
        // copyItem.selected = false

    };
    newDoc.artboards[0].remove()
    newDoc.rearrangeArtboards(DocumentArtboardLayout.GridByRow,5,padding,true);
}

copyGroupItemsToNewDocument()