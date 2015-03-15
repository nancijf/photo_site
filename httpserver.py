#!/usr/bin/env python

import time
import BaseHTTPServer
import json
import urllib
import exifread
import os

from os.path import *

#HOST_NAME = 'blackhole.local' # !!!REMEMBER TO CHANGE THIS!!!
API_HOST = 'blackhole.local'
API_PORT = 8080 # Maybe set this to 9000.
home = os.getcwd() + '/'
galleryPath = home + "thumbnails/"
logfile = open(home+"http.log",'a')


class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    debug = True

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
        #firstElement = paths[0]
        ext = ['.css','.html','.js','.jpg','.png']
        fileExt = ""
        if '.' in action:
            y = action.find('.')
            fileExt = action[y:].lower()


        if fileExt in ext:
            if fileExt == '.css':
                self.send_header("Content-type", "text/css")
            elif fileExt == '.js':
                self.send_header("Content-type", "text/javascript")
            elif fileExt == '.html':
                self.send_header("Content-type", "text/html")
            elif fileExt == '.jpg':
                self.send_header("Content-type", "image/jpeg")
            elif fileExt == '.png':
                self.send_header("Content-type", "image/png")

            self.end_headers()
            if os.path.exists(home+urllib.unquote(httpPath)):
                f = open(home+urllib.unquote(httpPath), 'rb')
                self.wfile.write(f.read())
                f.close()
            return

        """
        If fall through to here, check to see if api call. This is our javascript datasource.
        ** api server **
        """
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
                                                  
        self.end_headers()
        if action == 'api':
            galleries = [ f for f in os.listdir(galleryPath) if not isfile(join(galleryPath,f)) ]
            jsonString = json.dumps({"galleries": galleries, "path": action })
        else:
            filePath = galleryPath+urllib.unquote(action)
            photos = [ f for f in os.listdir(filePath) if isfile(join(filePath,f)) ]
            photosArray = []
            items = []

            for photo in photos:
                if not photo.lower().endswith('.jpg'):
                    continue
                photoPath = home+"images/"+urllib.unquote(action)+'/'+urllib.unquote(photo)
                if not os.path.exists(photoPath):
                    continue
                pf = open(photoPath, 'rb')
                tags = exifread.process_file(pf)
                pf.close()
                try:
                    del tags['JPEGThumbnail']
                    width = "%s" % tags['EXIF ExifImageWidth']
                    height = "%s" % tags['EXIF ExifImageLength']
                    photosArray.append({"href":"thumbnails/"+action+'/'+photo, "imgsrc":"images/"+action+'/'+photo, "name":photo, "exif":{"width":width, "height":height}})
                    items.append({"src":"images/"+action+'/'+photo, "w":width, "h":height})
                except:
                    self.log(home+"images/"+urllib.unquote(action)+'/'+urllib.unquote(photo))
                    # photosArray.append({"href":"thumbnails/"+action+'/'+photo, "imgsrc":"images/"+action+'/'+photo, "name":photo})
                    continue

            jsonString = json.dumps({"photos": photosArray, "items":items})

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
