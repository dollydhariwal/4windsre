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


#from DNS.Type import NULL





__all__ = ['ProjectController']


class ProjectController(BaseController):
    """
    The Project Controller for the corral Application
    """
    def __init__(self,privateToken=None):
        """This has the location of input and output locations
        of the projects
        location: location of excel sheet
        """
        self.input_location = "/home/vjain/4windsre/exceldata"
        self.output_location = "/home/vjain/4windsre/excelresults"
        self.image_location = "/home/vjain/4windsre/windsre/public/graphs"
        self.xml_location = "/home/vjain/4windsre/windsre/public/xmltemplates"
        self.output_xml_location = "/home/vjain/4windsre/windsre/corral/public/xmlfiles"
        self.photos_location = "/home/vjain/corral/4windsre/windsre/public/photos"
        self._url = 'http://www.zillow.com/webservice'
        self._privateToken = 'X1-ZWz1azdtprntor_8xo7s'
        py.sign_in('ddhariwal','9nnxcdskrt')
        self.final_dict = {}
        self._connection()
        
        
    def _connection(self):
        password = 'X'
        passmanager = urllib2.HTTPPasswordMgrWithDefaultRealm()
        passmanager.add_password(None, self._url, self._privateToken, password)
        authhandler = urllib2.HTTPBasicAuthHandler(passmanager)
        self.opener = urllib2.build_opener(authhandler)
        urllib2.install_opener(self.opener)
           
    def _getInputLocation(self):
        return self.input_location
    
    def _getOutputLocation(self):
        return self.output_location
    
    def _getImageLocation(self):
        return self.image_location
    
    def _getXMLLocation(self):
        return self.xml_location
    
    def _getOutputXMLLocation(self):
        return self.output_xml_location
    
    def _getPhotosLocation(self):
        return self.photos_location
    
    def listProjects(self):
        projectArray = []
        
        for filename in os.listdir(self.input_location):
            projectArray.append(filename)
        
        return projectArray
    
    
    def getPropertyId(self, address=None, zipcode=None):
        #deep_search_response = self.zillow_data.get_deep_search_results(address, zipcode) 
        #result = GetDeepSearchResults(deep_search_response)
        page = urllib2.urlopen("%s/GetDeepSearchResults.htm?zws-id=%s&address=%s&citystatezip=%s" % (self._url,self._privateToken,address.replace(" ", "+"), zipcode)).read()
        root = ET.fromstring(page)
        property_id = 'None'
        
        for view in root.iter('result'):
            property_id = view.find('zpid').text 
            
        return property_id
    
    def findHits(self, address=None, zipcode=None):
        zpid = self.getPropertyId(address=address, zipcode=zipcode)
        page = urllib2.urlopen("%s/GetUpdatedPropertyDetails.htm?zws-id=%s&zpid=%s" % (self._url,self._privateToken,zpid)).read()
        root = ET.fromstring(page)
        num_hits = 'None'
        
        for view in root.iter('pageViewCount'):
            num_hits = view.find('total').text 
        return num_hits         
             
    def readExcelInput(self, project):
        address_dict = {}
        today_date = datetime.date.today()
        date_array = str(today_date).split("-")
        flag_project_change = 0
        
        workbook = xlrd.open_workbook("%s/%s" % (self.input_location, project))
        sheet = workbook.sheet_by_index(0)
            
        try:
            os.mkdir("%s/%s" %(self.output_location,project.replace(".xlsx","")))
        except:
            pass
            
        for row in range(sheet.nrows):
            flag_for_change = 0
            address_file = '%s/%s/address%s.pkl' % (self.output_location, project.replace(".xlsx",""), row)
                
            if not os.path.exists(address_file):
                address_dict['id']= row
                for col in range(sheet.ncols):
                    if (row != 0):
                        address_dict[sheet.cell_value(0,col)] = sheet.cell_value(row,col)
                               
                if (row != 0):
                    try: 
                        address_dict[date_array[0]] = {date_array[1]:{date_array[2]:self.findHits(address="%s %s %s" % (address_dict['Property Address'], address_dict['City'], address_dict['State'] ), zipcode=address_dict['Zip'])}}
                    except:
                        address_dict[date_array[0]] = {date_array[1]:{date_array[2]: 'unknown'}}
                            
                    output = open(address_file, 'wb')
                    pickle.dump(address_dict, output)
                    output.close()
                    address_dict = {}
                flag_for_change += 1
                flag_project_change += 1
                    
            else:
                output = open(address_file, 'rb')
                address_dict = pickle.load(output)
                output.close()
                    
                            
                if (date_array[0] not in address_dict):
                    address_dict[date_array[0]] = {date_array[1] : {date_array[2] : self.findHits(address="%s %s %s" % (address_dict['Property Address'], address_dict['City'], address_dict['State'] ), zipcode=address_dict['Zip'])}}
                    flag_for_change += 1
                    flag_project_change += 1
                    
                elif (date_array[1] not in address_dict[date_array[0]]):
                    address_dict[date_array[0]][date_array[1]] = { date_array[2]: self.findHits(address="%s %s %s" % (address_dict['Property Address'], address_dict['City'], address_dict['State'] ), zipcode=address_dict['Zip'])}
                    flag_for_change += 1
                    flag_project_change += 1
                            
                elif (date_array[2] not in address_dict[date_array[0]][date_array[1]]):
                    address_dict[date_array[0]][date_array[1]][date_array[2]] = self.findHits(address="%s %s %s" % (address_dict['Property Address'], address_dict['City'], address_dict['State'] ), zipcode=address_dict['Zip'])
                    flag_for_change += 1
                    flag_project_change += 1
    
                    
                if flag_for_change != 0:            
                    output = open(address_file, 'wb')
                    pickle.dump(address_dict, output)
                    output.close()
                      
        return flag_project_change


    
    def createDataFile(self, project, flag_project_change):
        
        pklFilename = open("%s/%s" %(self.output_location,project.replace(".xlsx", ".data")), 'a')
        filename = "%s/%s" % (self.output_location, project.replace(".xlsx", ""))
            
        if flag_project_change !=0:
            self.final_dict[os.path.basename(filename)] = {}
            for address_file in os.listdir(filename):
                pkl_file = open('%s/%s' % (filename,address_file), 'rb')
                #final_dict[filename][address_file] = {'a':1,'b':2}
                self.final_dict[os.path.basename(filename)][address_file] = pickle.load(pkl_file)
                pkl_file.close()
                
            pickle.dump(self.final_dict, pklFilename )
        pklFilename.close()
        
        
        
    
    def readAddressesDict(self, project):
        self.return_dict = {}
        
        
        pklFilename = open("%s/%s" %(self.output_location,project.replace(".xlsx", ".data")), 'rb')
        self.return_dict = pickle.load(pklFilename)
        pklFilename.close()
                
        return self.return_dict   
   
                
        
          
                
            
        
    
    
        
    
    
    
