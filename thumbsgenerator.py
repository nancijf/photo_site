#!/usr/bin/env python

import os
import sys
from PIL import Image
from os.path import *

thumbsDir = ".thumbs/"
baseHeight = 500
galleryFolder = "galleries"
home = os.getcwd() + '/'
galleryPath = home + galleryFolder + "/"
galleries = [ f for f in os.listdir(galleryPath) if not isfile(join(galleryPath,f)) and not f.startswith('.') ]

for gallery in galleries:
    filePath = galleryPath+gallery
    photos = [ f for f in os.listdir(filePath) if isfile(join(filePath,f)) and f.lower().endswith('.jpg') ]
    os.chdir(galleryPath+gallery)
    print "\nIn %s..." % os.getcwd()
    for infile in photos:
        if not os.path.exists(thumbsDir):
            os.makedirs(thumbsDir)

        outfile = thumbsDir + infile.rstrip()
        if os.path.exists(outfile):
            continue

        print "    %s" % outfile
        
        if infile != outfile:
            try:
                im = Image.open(infile)
                ratio = float(baseHeight)/float(im.size[1])
                w = int(float(im.size[0]) * ratio)
                im.thumbnail((w, baseHeight), Image.ANTIALIAS)
                im.save(outfile, "JPEG")
            except IOError:
                print "cannot create thumbnail for '%s'" % infile

