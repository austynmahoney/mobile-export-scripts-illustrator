var document = app.activeDocument;

if(document) {
    var dialog = new Window("dialog","Select export sizes");
    var osGroup = dialog.add("group");
    var panel = osGroup.add("panel", undefined, name);
    rbCopyItem = panel.add("radiobutton", undefined, "\u00A0" + '1. 複製已選擇的artwork至新的檔案並嵌入artboard');
    rbExportPNG = panel.add("radiobutton", undefined, "\u00A0" + '2. 把artboard輸出成.png圖檔');
    rbBoth = panel.add("radiobutton", undefined, "\u00A0" + '3. 步驟1＋步驟2');
    rbBoth.value = true
    var buttonGroup = dialog.add("group");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    var okButton = buttonGroup.add("button", undefined, "OK");

    okButton.onClick = function() {
        this.parent.parent.close();
        if (rbCopyItem.value || rbBoth.value) {
            if( copyGroupItemsToNewDocument() === false) {
                return
            }
        };
        if (rbExportPNG.value || rbBoth.value) {
            exportPNG()
        };
    }
    cancelButton.onClick = function() {
        this.parent.parent.close();
    }
    
    buttonGroup.selected = true
    dialog.show()
}


function copyGroupItemsToNewDocument() {
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

    var items = app.selection
    if (items.length === 0) {
        alert('至少選擇一個artwork');
        return false;
    };
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
    return true
}

function exportPNG() {
    var selectedExportOptions = {};
    var selectedArtboards = {};
    var androidExportOptions = [
        {
            name: "mdpi",
            scaleFactor: 50,
            type: "android"
        },
        {
            name: "hdpi",
            scaleFactor: 75,
            type: "android"
        },
        {
            name: "xhdpi",
            scaleFactor: 100,
            type: "android"
        },
        {
            name: "xxhdpi",
            scaleFactor: 150,
            type: "android"
        },
        {
            name: "xxxhdpi",
            scaleFactor: 200,
            type: "android"
        }
    ];

    var iosExportOptions = [
        {
            name: "",
            scaleFactor: 100.0/2,
            type: "ios"
        },
        {
            name: "@2x",
            // scaleFactor: 100*1.17,
            scaleFactor: 100.0,
            type: "ios"
        },
        {
            name: "@3x",
            // scaleFactor: 150*1.3,
            scaleFactor: 100.0*2,
            type: "ios"
        }
    ];

    var exportFolder;
    if(document) {
        var dialog = new Window("dialog","Select export sizes");
        var osGroup = dialog.add("group");

        var androidCheckboxes = createSelectionPanel("Android", androidExportOptions, osGroup);
        androidCheckboxes[2].check()
        var iosCheckboxes = createSelectionPanel("iOS", iosExportOptions, osGroup);
        iosCheckboxes[1].check()
        iosCheckboxes[2].check()
        iosCheckboxes[0].check()
        var abOptions = [];
        
        for (var i = 0; i < document.artboards.length ; i ++) {
            abOptions.push({ 
                name: document.artboards[i].name,
                index: i,
                type: 'Artboard'
            });
        };
        abOptions.sort(function(a,b){
            return a.name.localeCompare(b.name);
        })
        var abCheckboxes = createArtboardSelectionPanel("artBoard", abOptions, osGroup);


        // var artBoardCheckboxes = createSelectionPanel("artBoards", artboards, osGroup);

        var buttonGroup = dialog.add("group");
        var cancelButton = buttonGroup.add("button", undefined, "Cancel");
        var okButton = buttonGroup.add("button", undefined, "Export");
        
        okButton.onClick = function() {
            exportFolder = Folder.selectDialog("Select export directory");
            for (var key in selectedExportOptions) {
                if (selectedExportOptions.hasOwnProperty(key)) {
                    var item = selectedExportOptions[key];
                    exportToFile(item.scaleFactor, item.name, item.type);
                }
            }
            this.parent.parent.close();
        };
        
        cancelButton.onClick = function () {
            this.parent.parent.close();
        };

        dialog.show();
        okButton.selected = true
    }

    function exportToFile(scaleFactor, resIdentifier, os) {
        if (exportFolder === undefined) {
            return;
        };
        var c = 0;
        for (key in selectedArtboards) {
            c += 1;
        };
        // alert(c);

        var activeArtboards = [];
        for (var key in selectedArtboards) {
            if (selectedArtboards.hasOwnProperty(key)) {
                activeArtboards.push(selectedArtboards[key]);
            }
        }
        // alert(activeArtboards.length);
        if (activeArtboards.length === 0) {
            alert('Please select at least 1 artboard.');
            return;
        };

        var i, ab, file, options, expFolder;
        if(os === "android")
            expFolder = new Folder(exportFolder.fsName + "/drawable-" + resIdentifier);
        else if(os === "ios")
            expFolder = new Folder(exportFolder.fsName + "/iOS");

        if (!expFolder.exists) {
            expFolder.create();
        }

        for (i = activeArtboards.length - 1; i >= 0; i--) {
            document.artboards.setActiveArtboardIndex(activeArtboards[i].index);
            ab = document.artboards[activeArtboards[i].index];
            
            if(os === "android")
                file = new File(expFolder.fsName + "/" + ab.name + ".png");
            else if(os === "ios")
                file = new File(expFolder.fsName + "/" + ab.name + resIdentifier + ".png");
                
                options = new ExportOptionsPNG24();
                options.transparency = true;
                options.artBoardClipping = true;
                options.antiAliasing = true;
                options.verticalScale = scaleFactor;
                options.horizontalScale = scaleFactor;

                document.exportFile(file, ExportType.PNG24, options);
        }
    };

    function createArtboardSelectionPanel(name, artboards, parent) {
        var K = 20; // K checkboxs per panel
        var N = Math.ceil(artboards.length / K); // total N panels
        var panels = []

        for (var i = 0; i < N; i++) {
            var panel = parent.add("panel", undefined, name);
            panel.alignChildren = "left";
            panels.push(panel);
        };
        var checkboxes = [];
        for(var i = 0; i < artboards.length;  i++) {
            panel = panels[Math.floor(i / K)]
            var cb = panel.add("checkbox", undefined, "\u00A0" + artboards[i].name);
            cb.item = artboards[i];
            cb.onClick = function() {
                if(this.value) {
                    selectedArtboards[this.item.name] = this.item;
                } else {
                    delete selectedArtboards[this.item.name];
                }
            };
            checkboxes.push(cb);
        }

        panel = panels[Math.floor(i / K)];
        
        var checkAll = panel.add("checkbox", undefined, "All");
        checkAll.onClick = function() {
            for(var i=0; i < checkboxes.length; i++) {
                var cb = checkboxes[i];
                cb.value = this.value;
                if(cb.value) {
                    selectedArtboards[cb.item.name] = cb.item;
                } else {
                    delete selectedArtboards[cb.item.name];
                }
            }
        };
        checkAll.value=true
        checkAll.onClick()
    }
    function createSelectionPanel(name, options, parent) {
        var panel = parent.add("panel", undefined, name);
        panel.alignChildren = "left";
        checkboxes = []
        for(var i = 0; i < options.length;  i++) {
            var cb = panel.add("checkbox", undefined, "\u00A0" + options[i].name);
            cb.item = options[i];
            
            cb.check = function () {
                this.value = true
                selectedExportOptions[this.item.name] = this.item;
            }
            cb.uncheck = function () {
                this.value = false
                delete selectedExportOptions[this.item.name];    
            }
            
            cb.onClick = function() {
                if(this.value) {
                    selectedExportOptions[this.item.name] = this.item;
                    //alert("added " + this.item.name);
                } else {
                    delete selectedExportOptions[this.item.name];
                    //alert("deleted " + this.item.name);
                }
            };
            checkboxes.push(cb)
        }
        return checkboxes
    };
}


