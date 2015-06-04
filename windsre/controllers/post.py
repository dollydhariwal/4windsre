# -*- coding: utf-8 -*-


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
from windsre.lib.dropbox import DropboxController


#from DNS.Type import NULL





__all__ = ['PostController']


class PostController(BaseController):
    """
    The Plot Controller for the corral Application
    """
    def __init__(self):
        self.xml_location = ProjectController()._getXMLLocation()
        self.output_xml_location = ProjectController()._getOutputXMLLocation()
        self.output_location = ProjectController()._getOutputLocation()
        self.photos_location = ProjectController()._getPhotosLocation()
        
    
    def checkStatus(self,project,addressKeys):
        propertyStatus = {'posted':[], 'not-posted': []}
               
        for key in addressKeys:
            address_dict = {}
            address_file = '%s/%s/address%s.pkl' % (self.output_location, project.replace(".xlsx",""), key)
            output = open(address_file, 'rb')
            address_dict = pickle.load(output)
            output.close()
            dont_include = 0
                   
                    
            for column in address_dict.keys():
                value = address_dict[column]
                               
                if column == "Property Address":
                    os.system("sed -i 's/XX_STREET_ADDRESS_XX/%s/' %s" % (formalvalue, xmlFile))
                    if value == None:
                        dont_include = 1
                    address = value
                    
                if column == "Turnkey/Sales Price":
                    os.system("sed -i 's/XX_PRICE_XX/%s/' %s" % (formalvalue, xmlFile))
                    if value == None or value == "" :
                        dont_include = 1
                if column == "City":
                    os.system("sed -i 's/XX_CITY_XX/%s/' %s" % (formalvalue, xmlFile))
                    if value == None:
                        dont_include = 1
                    city = value
                if column == "Zip":
                    os.system("sed -i 's/XX_ZIP_XX/%s/' %s" % (formalvalue, xmlFile))
                    if value == None:
                        dont_include = 1
                    zip = value
                
              
            finalAddress = "%s %s %s" % (address,city, zip)
            propertyId = ProjectController().getPropertyId(address="%s %s" %(address, city), zipcode=zip)
            if (dont_include == 0) and(propertyId != "None"):
                propertyStatus['posted'].append({finalAddress:propertyId})
                os.system("cat %s >> %s" %(xmlFile,projectXMLFile))
            else:
                propertyStatus['not-posted'].append({finalAddress:propertyId})
                
                       
        return propertyStatus       
            
            
    
    
        
        
           
    
        
          
                
            
        
    
    
        
    
    
    