argv = require('optimist').argv
fs = require 'fs'

inputFilename = argv._[0].replace(/.png$/, "")
outputFilename = argv._[1].replace(/.png$/,"")

iosDir = '../iOS/'
androidDir = './'

fs.rename androidDir+inputFilename+".png",androidDir+outputFilename+".png",(err)->
	console.log err if err?

fs.rename iosDir+inputFilename+".png",iosDir+outputFilename+".png",(err)->
	console.log err if err?

fs.rename iosDir+inputFilename+"@2x.png",iosDir+outputFilename+"@2x.png",(err)->
	console.log err if err?

fs.rename iosDir+inputFilename+"@3x.png",iosDir+outputFilename+"@3x.png",(err)->
	console.log err if err?
