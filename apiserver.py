#!/usr/bin/env python

import time
import datetime
import BaseHTTPServer
import json
import urllib
import os
import pyorient
import PIL
from PIL import Image
from PIL import ExifTags
from operator import itemgetter
from os.path import *
import yaml

stream = open('/usr/local/etc/gallery.conf', 'r')
doc = yaml.load(stream);
stream.close()

API_HOST = doc['listen']
API_PORT = doc['api_port']
home = os.getcwd() + '/'
galleryFolder = "galleries"
galleryPath = home + galleryFolder + "/"
logfile = open(home+"http.log",'a+')

# DB Stuff here
dbName = doc['dbName']
dbUser = doc['dbUser']
dbPass = doc['dbPass']

print "%s, %s, %s" %(dbName, dbUser, dbPass)

#session_id = dbClient.connect(dbUser, dbPass)
#r = dbClient.command("select * from metaData where gallery='"+urllib.unquote(action)+"' and name='"+urllib.unquote(photo)+"'")
#datetime = r[0].exif['DateTime']

dbClient = pyorient.OrientDB("localhost", 2424)

#if not dbClient.db_exists(dbName):
#    sys.exit(1)

dbClient.db_open(dbName, dbUser, dbPass)
cluster_id = dbClient.command("select classes[name='metaData'].defaultClusterId from 0:1")
print "ClusterID: %s" % str(cluster_id)
dbClient.db_close()

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    debug = False

    def log(self, message):
        if self.debug:
            logfile.write(message+'\n')
            logfile.flush()

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_GET(self):
        """Respond to a GET request.
        If not api call then process http protocol mime types.
        ** Webserver **
        """
        self.send_response(200)

        httpPath = self.path[1:]
        paths = httpPath.split('/')
        action = paths[-1]

        """
        api server
        """
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        if action == 'api':
            galleries = [ f for f in os.listdir(galleryPath) if not isfile(join(galleryPath,f)) and not f.startswith('.') ]
            jsonString = json.dumps({"galleries": galleries, "path": action })
        else:
            filePath = galleryPath+urllib.unquote(action)
            photos = [ f for f in os.listdir(filePath) if isfile(join(filePath,f)) and f.lower().endswith('.jpg')]
            photosArray = []
            items = []

            for photo in photos:
                if not photo.lower().endswith('.jpg'):
                    continue

                photoPath = home+galleryFolder+"/"+urllib.unquote(action)+'/'+urllib.unquote(photo)
                thumbPath = home+galleryFolder+"/"+urllib.unquote(action)+"/.thumbs/"+urllib.unquote(photo)

                if not os.path.exists(photoPath):
                    continue

                # Use PIL to get the image and thumbnail sizes
                thumb = Image.open(thumbPath)
                thumbSize = thumb.size
                image = Image.open(photoPath)
                imageSize = image.size
                #2006:03:19 16:41:5
                date = datetime.datetime.today().strftime('%Y:%m:%d %H:%M:%S')
                try:
                    exifInfo = {}
                    info = image._getexif()
                    if info is not None:
                        exifInfo = {
                            PIL.ExifTags.TAGS[k]: v
                            for k, v in info.items()
                            if k in PIL.ExifTags.TAGS and k not in [37500, 37510]
                        }
                        if exifInfo['DateTime'] is not None:
                            date = exifInfo['DateTime']
                        if exifInfo['DateTimeDigitized'] is not None:
                            date = exifInfo['DateTimeDigitized']                            
                except:
                    self.log("no db info for this photo: "+home+galleryFolder+"/"+urllib.unquote(action)+'/'+urllib.unquote(photo))

                try:
                    #print "date: %s" % date
                    photosArray.append({"datetime": date, "href": galleryFolder+"/"+action+'/.thumbs/'+photo, "imgsrc": galleryFolder+"/"+action+'/'+photo, "name": photo, "size": {"w":str(imageSize[0]), "h": str(imageSize[1])}, "thumbSize": {"w": str(thumbSize[0]), "h": str(thumbSize[1])}, "exif": exifInfo})
                    items.append({"datetime": date, "src": galleryFolder+"/"+action+'/'+photo, "w":str(imageSize[0]), "h": str(imageSize[1])})
                except:
                    self.log(home+galleryFolder+"/"+urllib.unquote(action)+'/'+urllib.unquote(photo))
                    continue

            photosArray.sort(key=itemgetter('datetime'), reverse=True)
            items.sort(key=itemgetter('datetime'), reverse=True)
            jsonString = json.dumps({"photos": photosArray, "items": items})

        self.wfile.write(jsonString)

if __name__ == '__main__':
    server_class = BaseHTTPServer.HTTPServer
    httpd = server_class((API_HOST, API_PORT), MyHandler)
    print time.asctime(), "Server Starts - %s:%s" % (API_HOST, API_PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logfile.close()
    print time.asctime(), "Server Stops - %s:%s" % (API_HOST, API_PORT)
