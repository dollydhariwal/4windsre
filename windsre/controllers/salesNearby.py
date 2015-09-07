# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url
import requests
import urllib2
import xml.etree.ElementTree as ET
from geopy.geocoders import GoogleV3
import os
import xlrd
import cPickle as pickle
import math




__all__ = ['CompController']


class FindSalesController(BaseController):
    """
    Find Sales Controller 
    """
    def __init__(self,privateToken=None):
        """Stores information about the server
        url : the URL of the highrise server
        private_token: the user private token
        email: the user email/login
        password: the user password (associated with email)
        """
        self.input_location = "/home/vjain/4windsre/salesdata"
        self.output_location = "/home/vjain/4windsre/salesresults"
        self.input_address_location = "/home/vjain/4windsre/addressdata"
        self.output_address_location = "/home/vjain/4windsre/addressdb/address.pkl"
        self.r_constant = 0.02526046
        
        
    def listProjects(self):
        projectArray = []
        
        for filename in os.listdir(self.input_location):
            projectArray.append(filename)
        
        return projectArray
    
    
    def populateAddresses(self):
        address_dict = {}
        addict = {}
        
        for filename in os.listdir(self.input_address_location):
            workbook = xlrd.open_workbook("%s/%s" % (self.input_address_location, filename))
            sheet = workbook.sheet_by_index(0)
            
            for row in range(sheet.nrows):
                #try:
                address = ""
                metadata = ""
                if (row != 0):
                    for col in range(sheet.ncols):
                        
                        try:
                            if (col==0 or col==1 or col==2):
                                address = "%s %s" % (address,sheet.cell_value(row,col))
                            elif (col==3):
                                metadata = "Beds %s |" % sheet.cell_value(row,col)
                            elif (col==4):
                                metadata = "%s Baths %s |" %(metadata, sheet.cell_value(row,col))
                            elif (col==5):
                                metadata = "%s Lot Size %s |" %(metadata, sheet.cell_value(row,col))
                            elif (col==6):
                                metadata = "%s sqft %s |" %(metadata, sheet.cell_value(row,col))
                            elif (col==7):
                                metadata = "%s price %s |" %(metadata, sheet.cell_value(row,col))
                        except:
                            pass
                        
                    if address:
                        addict[address] = metadata
                        address_file = '%s' % (self.output_address_location)
                        if os.path.exists(address_file):    
                            file = open(address_file, 'rb')
                            address_dict = pickle.load(file)
                            file.close()
                                
                        address_dict = dict(address_dict, **addict)
                        file = open(address_file, 'wb')
                        pickle.dump(address_dict,file,protocol=2)
                        file.close()       
        
    def getListProximateAddress(self, start_address=None, radius=1):
        self.populateAddresses()
        
        address_file = '%s' % (self.output_address_location)
        file = open(address_file, 'rb')
        address_db = pickle.load(file)
        file.close()
        
        address_dict = {}
        resultDict = {}
                
        if start_address != None:
            start_location = self.findSales(start_address)
            
        projects = self.listProjects()
        for project in projects:   
            workbook = xlrd.open_workbook("%s/%s" % (self.input_location, project))
            sheet = workbook.sheet_by_index(0)
                       
            for row in range(sheet.nrows):
                #try:
                address = ""
                for col in range(sheet.ncols):
                    if (row != 0):
                        address = "%s %s" % (address, sheet.cell_value(row,col))
                location = self.findSales(address)
                        
                address_file = '%s/%d.pkl' % (self.output_location,int(location[address][0]))
                if os.path.exists(address_file):    
                    file = open(address_file, 'rb')
                    address_dict = pickle.load(file)
                    file.close()
                        
                address_dict = dict(address_dict, **location)
                file = open(address_file, 'wb')
                pickle.dump(address_dict,file,protocol=2)
                file.close()
                #except:
                #    pass
                
        if (start_location[start_address][0]!=0 and start_location[start_address][1]!=0):
            radius = float(radius)
            
            latitude = float(start_location[start_address][0])
            longitude = float(start_location[start_address][1])
            lat_min = latitude - (radius * self.r_constant)
            lat_max = latitude + (radius * self.r_constant)
            
            lat = math.asin(math.sin(latitude)/math.cos(self.r_constant))
            delta_lon = math.asin(math.sin((radius * self.r_constant))/math.cos(lat))
            
            long_min = longitude - delta_lon
            long_max = longitude + delta_lon
            
                                 
            if (int(latitude) == int(lat_max)) and (int(lat_min) == int(latitude)): 
                lat_file = '%s/%d.pkl' % (self.output_location,int(latitude))
                file = open(lat_file, 'rb')
                address_dict = pickle.load(file)
                file.close()
               
                for each in address_dict:
                    if address_dict[each][0]>=lat_min and address_dict[each][0]<=lat_max and address_dict[each][1]<=long_max and address_dict[each][1]>=long_min:
                        result= {}
                        try:
                            result[each] = address_db[each]
                        except:
                            result[each] = ""
                            
                        resultDict = dict( resultDict, **result)
                    
            if (int(lat_min) != int(lat_max)):
                try:
                    lat_file = '%s/%d.pkl' % (self.output_location,int(lat_min))
                    file = open(lat_file, 'rb')
                    address_dict = pickle.load(file)
                    file.close()
                
                    for each in address_dict:
                        if address_dict[each][0]>=lat_min and address_dict[each][0]<=lat_max and address_dict[each][1]<=long_max and address_dict[each][1]>=long_min:
                            result= {}
                            try:
                                result[each] = address_db[each]
                            except:
                                result[each] = ""
                                
                            resultDict = dict( resultDict, **result)
                        
                        
                    lat_file = '%s/%d.pkl' % (self.output_location,int(lat_max))
                    file = open(lat_file, 'rb')
                    address_dict = pickle.load(file)
                    file.close()
                
                    for each in address_dict:
                        if address_dict[each][0]<=lat_min and address_dict[each][0]>=lat_max and address_dict[each][1]<=long_max and address_dict[each][1]>=long_min:
                            result= {}
                            try:
                                result[each] = address_db[each]
                            except:
                                result[each] = ""
                                
                            resultDict = dict( resultDict, **result)
                except:
                    pass
                        
            
        else:
            resultDict = []
           
                    
        return resultDict           
                        
         
    
                
    def findSales(self, address=None,radius=None):
        salesDict = {}
        geolocator = GoogleV3()
        try:
            location = geolocator.geocode(address)
            salesDict[address]={}
            salesDict[address]=(location.latitude,location.longitude)
        except:
            salesDict[address]=(0,0)
        
        return salesDict
           
        
       
    def salesNearby(self,**kw):
        return redirect(url(base_url='/salesNearby'), params=kw)
        
    
    
    
class FindSalesAddressForm(forms.Form):
    class child(forms.TableLayout):
        address = forms.TextField()
        radius = forms.TextField()
        submit = forms.SubmitButton(text="Find Sales")
     
       
       
