# -*- coding: utf-8 -*-

"""The dropbox  Controller API."""
from windsre.lib.base import BaseController
from tg import TGController, tmpl_context
from tg.render import render
from tg.i18n import ugettext as _, ungettext
import os, glob

__all__ = ['DropboxController']


class DropboxController(BaseController):
    """
    Dropbox  class for the controllers in the application.

    """
    def __init__(self):
	    self._patternList = ["JPG","jpeg", "png", "jpg", "bmp"]
        
	
    def download(self,link, destDir):
	    photos_array = []
        
            if not os.path.exists(destDir):
                os.system("mkdir %s" % destDir)
                command = 'wget -q "%s?dl=1" -O %s/photos.zip'  % (link, destDir)
            
                os.system("echo '%s' >> /tmp/download.log" % command)
                os.system("%s >> /tmp/download.log" % (command))
                os.system("cd %s; unzip photos.zip" % (destDir))
            
            for pattern in self._patternList:
                for photo in glob.glob("%s/*.%s" % (destDir, pattern)):
                    photos_array.append("http://4windsre.com/photos/%s/%s" %(os.path.basename(destDir),os.path.basename(photo)))
                    
            
	    return photos_array
