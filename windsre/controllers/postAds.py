# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url
import requests
import urllib2
import xlrd
import os
import datetime 
import xml.etree.ElementTree as ET
import cPickle as pickle
import plotly.plotly as py
from plotly.graph_objs import *
from windsre.controllers.project import ProjectController


#from DNS.Type import NULL





__all__ = ['PostAdsController']


class PostAdsController(BaseController):
    """
    The PostAds Controller for the corral Application
    """
    def __init__(self,project=None):
        self.project = project
        
        
    def readProject(self):
        projectObj = ProjectController()
        flag_for_change = projectObj.readExcelInput(self.project)
        projectObj.createDataFile(self.project, flag_for_change)
        
        return_dict = projectObj.readAddressesDict(self.project)
        
        return return_dict
    
    
class selectProps(forms.CheckBox):
    #class child(forms.TableForm):
    value = True
    name = "property"
        
                
  
class postForm(forms.SubmitButton):
        #class child(forms.TableForm):
        type = "submit"
        value = "Post Ads"          
                
        
            
                
            
        
    
    
        
    
    
    