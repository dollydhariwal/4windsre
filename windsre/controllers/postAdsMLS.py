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


class PostMLSController(BaseController):
    """
    The Plot Controller for the corral Application
    """
    def __init__(self):
        self.xml_location = ProjectController()._getXMLLocation()
        self.output_xml_location = ProjectController()._getOutputXMLLocation()
        self.output_location = ProjectController()._getOutputLocation()
        self.photos_location = ProjectController()._getPhotosLocation()
        self.startTag = "<![CDATA["
        self.endTag = "]]>"
        
    
    def createXML(self,project,addressKeys):
        descStr = "Email: info\@4windre.com\nPhone:4045009192\nPlease Call to the above mentioned mobile number only for further details.\n"
        os.system("cp %s/Properties.xml.tl %s/%s/%s.xml" % (self.xml_location,self.output_xml_location,project.replace(".xlsx",""),project.replace(".xlsx","")))
        projectXMLFile = "%s/%s/%s.xml" % (self.output_xml_location,project.replace(".xlsx",""),project.replace(".xlsx",""))
        propertyStatus = {'posted':[], 'not-posted': []}
        
        
        ##os.system("echo '<properties>' >> %s" %(projectXMLFile))
               
        for key in addressKeys:
            address_dict = {}
            address_file = '%s/%s/address%s.pkl' % (self.output_location, project.replace(".xlsx",""), key)
            output = open(address_file, 'rb')
            address_dict = pickle.load(output)
            output.close()
            dont_include = 0
            pictureString = ""
            
            os.system("mkdir %s/%s; cp %s/TFF.xml.tl %s/%s/%s-address%s.xml" % (self.output_xml_location,project.replace(".xlsx",""),self.xml_location, self.output_xml_location,project.replace(".xlsx",""), project.replace(".xlsx",""), key))
            xmlFile = "%s/%s/%s-address%s.xml" %(self.output_xml_location,project.replace(".xlsx",""), project.replace(".xlsx",""), key)
            
            os.system("sed -i 's/XX_STATUS_XX/for sale/' %s" % xmlFile)
            os.system("sed -i 's/XX_DESCRIPTION_XX/%s/' %s" % (descStr, xmlFile))
            
            for column in address_dict.keys():
                value = address_dict[column]
                try:
                    formalvalue = "%s%s%s" %(self.startTag,value.replace("/","\/"),self.endTag)
                except:
                    formalvalue = "%s%s%s" %(self.startTag,value,self.endTag)
                
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
                if column == "County":
                    os.system("sed -i 's/XX_COUNTY_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "State":
                    os.system("sed -i 's/XX_STATE_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Beds":
                    os.system("sed -i 's/XX_BEDROOMS_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Baths":
                    os.system("sed -i 's/XX_BATHS_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Sq. Ft.":
                    os.system("sed -i 's/XX_SQUARE_FEET_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Lot %Acre":
                    os.system("sed -i 's/XX_LOT_SIZE_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Pictures Link":
                    if value:
                        destDir = "%s/%s-%s" % (self.photos_location, project.replace(".xlsx",""), key)
                        photos_array = DropboxController().download(value, destDir)
                        seq_num = 1
                        
                        if photos_array:
                            for photo in photos_array:
                                pictureString = "%s\<picture\>\<picture-url>%s\<\/picture-url\>\<picture-seq-number\>%s\<\/picture-seq-number\><\/picture>" % (pictureString, photo.replace("/","\/"), seq_num)
                                seq_num += 1
                                                       
                        os.system("sed -i 's/XX_PICTURE_XX/%s/' %s" % (pictureString, xmlFile))
                if column == "Year Built":
                    os.system("sed -i 's/XX_YEAR_BUILT_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Annual HOA":
                    os.system("sed -i 's/XX_HOA_FEES_XX/%s/' %s" % (formalvalue, xmlFile))
                if column == "Property Type":
                    if value == "SFR":
                        os.system("sed -i 's/XX_TYPE_XX/single-family home/' %s" % (xmlFile))
              
            
            os.system("sed -i 's/XX_.*_XX//' %s" % (xmlFile))
            
            finalAddress = "%s %s %s" % (address,city, zip)
            propertyId = ProjectController().getPropertyId(address="%s %s" %(address, city), zipcode=zip)
            if (dont_include == 0) and(propertyId != "None"):
                propertyStatus['posted'].append({finalAddress:propertyId})
                os.system("cat %s >> %s" %(xmlFile,projectXMLFile))
            else:
                propertyStatus['not-posted'].append({finalAddress:propertyId})
                
        os.system("echo '</properties>' >> %s" %(projectXMLFile))
                
        return propertyStatus       
            
            
    
    
    
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
                    if value == None:
                        dont_include = 1
                    address = value
                    
                if column == "Turnkey/Sales Price":
                    if value == None or value == "" :
                        dont_include = 1
                if column == "City":
                    if value == None:
                        dont_include = 1
                    city = value
                if column == "Zip":
                    if value == None:
                        dont_include = 1
                    zip = value
                
              
            finalAddress = "%s %s %s" % (address,city, zip)
            propertyId = ProjectController().getPropertyId(address="%s %s" %(address, city), zipcode=zip)
            if (dont_include == 0) and(propertyId != "None"):
                propertyStatus['posted'].append({finalAddress:propertyId})
            else:
                propertyStatus['not-posted'].append({finalAddress:propertyId})
                
                       
        return propertyStatus       
        
        
           
    
        
          
                
            
        
    
    
        
    
    
    