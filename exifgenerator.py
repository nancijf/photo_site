#!/usr/bin/env python

import os
import sys
import PIL
import pyorient
from PIL import Image
from PIL import ExifTags
from os.path import *

def cleanup():
    dbClient.db_close()
    exit

# GLOBALS
thumbsDir = ".thumbs/"
baseHeight = 500
galleryFolder = "galleries"
home = os.getcwd() + '/'
galleryPath = home + galleryFolder + "/"
galleries = [ f for f in os.listdir(galleryPath) if not isfile(join(galleryPath,f)) and not f.startswith('.') ]

# DB Stuff here
dbName = "photoMetaData"
dbUser = "root"
dbPass = "w1z@rd1!"
dbClient = pyorient.OrientDB("localhost", 2424)
session_id = dbClient.connect(dbUser, dbPass)

if not dbClient.db_exists(dbName):
    sys.exit(1)

dbClient.db_open(dbName, dbUser, dbPass)
#cluster_id = dbClient.command("select class metaData")
cluster_id = dbClient.command("select classes[name='metaData'].defaultClusterId from 0:1");

for gallery in galleries:
    filePath = galleryPath+gallery
    photos = [ f for f in os.listdir(filePath) if isfile(join(filePath,f)) and f.lower().endswith('.jpg') ]
    os.chdir(galleryPath+gallery)
    print "\nIn %s..." % os.getcwd()
    for infile in photos:
        if os.path.exists(infile):
            print "    %s" % infile
            try:
                exifInfo = {}
                img = Image.open(infile)
                info = img._getexif()
                if info is not None:
                    exifInfo = {
                        PIL.ExifTags.TAGS[k]: v
                        for k, v in info.items()
                        if k in PIL.ExifTags.TAGS
                        }
                record = {'@metaData': {"gallery": gallery, "name": infile, "exif": exifInfo}}
                rec_pos = dbClient.record_create(cluster_id[0].classes, record)
                #print "recordPos: %s" % rec_pos
            except:
                print "cannot get exif info for '%s'" % infile
                continue

#allExifData = dbClient.command("select * from metaData");
cleanup()
