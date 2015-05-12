argv = require('optimist').argv
fs = require 'fs'

inputFilename = argv.i.replace(/.png$/, "")
outputFilename = argv.o.replace(/.png$/,"")


fs.readFile inputFilename+".png", (err,data)->
	return if err
	fs.writeFileSync outputFilename+".png",data

fs.readFile inputFilename+"@2x.png", (err,data)->
	return if err
	fs.writeFileSync outputFilename+"@2x.png",data
fs.readFile inputFilename+"@3x.png", (err,data)->
	return if err
	fs.writeFileSync outputFilename+"@3x.png",data