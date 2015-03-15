#!/usr/bin/env python

import os
import sys
import PIL
from PIL import Image
from PIL import ExifTags
from os.path import *

infile = sys.argv[1]

for k in PIL.ExifTags.TAGS:
    print "%s: %s" % (k,PIL.ExifTags.TAGS[k]); 

img = Image.open(infile)
info = img._getexif()
if info is not None:
    exifInfo = {
        PIL.ExifTags.TAGS[k]: v
        for k, v in info.items()
        if k in PIL.ExifTags.TAGS
    }

    print "%s" % exifInfo
