/*
* Author: austynmahoney (https://github.com/austynmahoney)
* 
* Copyright 2016 Austyn Mahoney
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

Array.prototype.indexOf = Array.prototype.indexOf || function(value, start) {  
  for (var i = 0, length = this.length; i < length; i++) {  
    if (this[i] == value) {  
      return i;  
    }  
  }  
  return -1;  
}

var selectedExportOptions = {'ldpi': true, 'mdpi': true, 'hdpi': true, 'xhdpi': true, 'xxhdpi': true,'xxxhdpi': true};
var options = {source: 100, size: 96};
var selectedSizes = [12,16,24,32,36,48,60,72,94,96,106];
var availableSizes = [12,16,24,32,36,48,60,72,94,96,106];

var androidExportOptions = [
    {
        name: "ldpi",
        scaleFactor: 37.5,
        type: "android"
    },
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
        scaleFactor: 50,
        type: "ios"
    },
    {
        name: "@2x",
        scaleFactor: 100,
        type: "ios"
    },
    {
        name: "@3x",
        scaleFactor: 150,
        type: "ios"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;

if(document && folder) {
    var dialog = new Window("dialog","Select export sizes");
    var osGroup = dialog.add("group");
    
    var progressGroup = dialog.add("group");
    var progressBar = progressGroup.add("progressbar", undefined, 100);
    progressBar.maxvalue = 100;
    progressBar.minvalue = 0;

    var androidCheckboxes = createSelectionPanel("Android", androidExportOptions, osGroup);
    var iosCheckboxes = createSelectionPanel("iOS", iosExportOptions, osGroup);
    var sourceSelector = createSourceSelector("Source", androidExportOptions, osGroup);
    var sizeSelector = createSizePanel("Size", availableSizes, osGroup);
    var sizeSourcePanel = createSizeSourcePanel("Size source", availableSizes, osGroup);

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        var eol = 0;
        for(var k in selectedExportOptions) if(selectedExportOptions.hasOwnProperty(k)) eol++;
        var sum = eol * selectedSizes.length;
        var current = 0;
        for (var key in selectedExportOptions) {
            if (selectedExportOptions.hasOwnProperty(key)) {
                for(var i = 0; i < selectedSizes.length; i++) {
                    current++;
                    progressBar.value = current / sum * 100;
                    dialog.update();
                    
                    var item = selectedExportOptions[key];
                    exportToFile(item.scaleFactor / options.source * 100 * (selectedSizes[i] / options.size), item.name, item.type, "-" + selectedSizes[i]);
                }
            }
        }
        this.parent.parent.close();
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

function exportToFile(scaleFactor, resIdentifier, os, extension) {
    var i, ab, file, options, expFolder;
    if(os === "android")
        expFolder = new Folder(folder.fsName + "/drawable-" + resIdentifier);
    else if(os === "ios")
        expFolder = new Folder(folder.fsName + "/iOS");

	if (!expFolder.exists) {
		expFolder.create();
	}

	for (i = document.artboards.length - 1; i >= 0; i--) {
		document.artboards.setActiveArtboardIndex(i);
		ab = document.artboards[i];
		
	if(ab.name.charAt(0)=="!")
            continue;
        
        if(os === "android")
            file = new File(expFolder.fsName + "/" + ab.name + extension + ".png");
        else if(os === "ios")
            file = new File(expFolder.fsName + "/" + ab.name + resIdentifier + extension + ".png");
            
            options = new ExportOptionsPNG24();
            options.transparency = true;
            options.artBoardClipping = true;
            options.antiAliasing = true;
            options.verticalScale = scaleFactor;
            options.horizontalScale = scaleFactor;

            document.exportFile(file, ExportType.PNG24, options);
	}
};

function createSourceSelector(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    var dropDown = panel.add("DropDownList", undefined, "source");
    for (var i = 0; i < array.length; i++) {
        var select = dropDown.add("item", array[i].name);
        select.item = array[i];
        if(array[i].scaleFactor == options.source)
            select.selected = true;
    }
    dropDown.onChange = function () {
        options.source = this.selection.item.scaleFactor;
    };
}

function createSizePanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    for(var i = 0; i < array.length; i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i]);
        cb.item = array[i];
        if(selectedSizes.indexOf(cb.item) > -1)
            cb.value = true;
        cb.onclick = function () {
            if(this.value) {
                selectedSizes.push(this.item);
            } else {
                selectedSizes.splice(selectedSizes.indexOf(this.item), 1);
            }
        }
    }
}

function createSizeSourcePanel(name, array, parent)
{
    var panel = parent.add("panel", undefined, name);
    var dropDown = panel.add("DropDownList", undefined, "sizesource");
    for (var i = 0; i < array.length; i++) {
        var select = dropDown.add("item", array[i] + "dp");
        select.item = array[i];
        if(array[i] == options.size)
            select.selected = true;
    }
    dropDown.onChange = function () {
        options.size = this.selection.item;
    };
}

function createSelectionPanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
        if(selectedExportOptions[cb.item.name])
        {
            cb.value = true;
            selectedExportOptions[cb.item.name] = cb.item;
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
    }
};
