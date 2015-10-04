# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url
import requests
import urllib2
import xml.etree.ElementTree as ET
from geopy.geocoders import Nominatim
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
        self.r_constant = 0.02526046
        
        
    def listProjects(self):
        projectArray = []
        
        for filename in os.listdir(self.input_location):
            projectArray.append(filename)
        
        return projectArray
    
    
     
    def getListProximateAddress(self, start_address=None, radius=1):
        address_dict = {}
        resultDict = {}
 
        if start_address != None:
            start_location = self.findSales(start_address)
            
        projects = self.listProjects()
        for project in projects:
        	workbook = xlrd.open_workbook("%s/%s" % (self.input_location, project))
        	sheet = workbook.sheet_by_index(0)
        	
        	total = 0
        	avgpps = 0.0
        	for row in range(sheet.nrows):
        		metadata = ""
        		address = ""
        		sqft = ""
		        lot = "" 
		        price = ""
		        bedStr = ""
		        bathStr = ""
		        lotStr = ""
		        sqftStr = ""
		        priceStr = ""
		        address_dict = {}
		        total += 1
		        #try:
        		for col in range(sheet.ncols):
        			if (row != 0):
        				if (sheet.cell_value(0,col)=="Address" or sheet.cell_value(0,col)=="City" or sheet.cell_value(0,col)=="State" or sheet.cell_value(0,col)=="Zip"):
        					address = "%s %s" % (address,sheet.cell_value(row,col))
        				elif (sheet.cell_value(0,col)=="Beds"):
        					bedStr = "%s %s |" % (sheet.cell_value(0,col), sheet.cell_value(row,col))
        				elif (sheet.cell_value(0,col)=="Baths"):
        					bathStr = "%s %s |" % (sheet.cell_value(0,col), sheet.cell_value(row,col))
        				elif (sheet.cell_value(0,col)=="LotSize"):
        					lot = (str(sheet.cell_value(row,col)).strip()).replace(",","")
        					lotStr = "%s %s |" % (sheet.cell_value(0,col), sheet.cell_value(row,col))
        				elif (sheet.cell_value(0,col)=="SqFT"):
        					sqft = str(sheet.cell_value(row,col)).strip()
        					sqftStr = "%s %s |" % (sheet.cell_value(0,col), sheet.cell_value(row,col))
        				elif (sheet.cell_value(0,col)=="Price"):
        					price = str(sheet.cell_value(row,col)).strip()
        					priceStr = "%s %s |" % (sheet.cell_value(0,col), sheet.cell_value(row,col))
        					        						
        		#metadata = "%s | Build Ratio %f | price per sqft %f" %(metadata,  (int(sqft)/int(lot)), (int(price)/int(sqft)))
        		location = self.findSales(address)
        		#try:
        		if (sqft and lot and price):
        			try:
        				location[address]['metadata'] = "%s %s %s %s %s Build Ratio %f | price per Sqft %f |" % (bedStr, bathStr, lotStr, sqftStr, priceStr, (float(sqft)/float(lot)), (float(price)/float(sqft)))
        				avgpps += (float(price)/float(sqft))
        			except:
        				pass
        		else:
        			location[address]['metadata'] = "%s %s %s %s %s" % (bedStr, bathStr, lotStr, sqftStr, priceStr)
        		#except:
        		#	pass
        			
        		address_file = '%s/%d.pkl' % (self.output_location,int(location[address]['longlat'][0]))
        		if os.path.exists(address_file):
        			file = open(address_file, 'rb')
        			address_dict = pickle.load(file)					
        			file.close()
        			
        		address_dict = dict(address_dict, **location)
        		file = open(address_file, 'wb')
		        pickle.dump(address_dict,file,protocol=2)
		        file.close()
		        
        	avgpps = avgpps/total	

                
        if (start_location[start_address]['longlat'][0]!=0 and start_location[start_address]['longlat'][1]!=0):
            radius = float(radius)
            
            latitude = float(start_location[start_address]['longlat'][0])
            longitude = float(start_location[start_address]['longlat'][1])
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
                    if address_dict[each]['longlat'][0]>=lat_min and address_dict[each]['longlat'][0]<=lat_max and address_dict[each]['longlat'][1]<=long_max and address_dict[each]['longlat'][1]>=long_min:
                        result= {}
                        try:
                            result[each] = address_dict[each]['metadata']
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
                        if address_dict[each]['longlat'][0]>=lat_min and address_dict[each]['longlat'][0]<=lat_max and address_dict[each]['longlat'][1]<=long_max and address_dict[each]['longlat'][1]>=long_min:
                            result= {}
                            try:
                                result[each] = address_dict[each]['metadata']
                            except:
                                result[each] = ""
                                
                            resultDict = dict( resultDict, **result)
                        
                        
                    lat_file = '%s/%d.pkl' % (self.output_location,int(lat_max))
                    file = open(lat_file, 'rb')
                    address_dict = pickle.load(file)
                    file.close()
                
                    for each in address_dict:
                        if address_dict[each]['longlat'][0]<=lat_min and address_dict[each]['longlat'][0]>=lat_max and address_dict[each]['longlat'][1]<=long_max and address_dict[each]['longlat'][1]>=long_min:
                            result= {}
                            try:
                                result[each] = address_dict[each]['metadata']
                            except:
                                result[each] = ""
                                
                            resultDict = dict( resultDict, **result)
                except:
                    pass
                        
            
     
                    
        return resultDict           
                        
         
    
                
    def findSales(self, address=None,radius=None):
        salesDict = {}
        geolocator = Nominatim()
        try:
	    	salesDict[address]={}
	    	location = geolocator.geocode(address)
	    	salesDict[address]['longlat']=(location.latitude,location.longitude)
        except:
            salesDict[address]['longlat']=(0,0)
        
        return salesDict
           
       
    def getDict(self, addressStr=None, radius=None):
    	returnDict = {}
    	if addressStr:
    		addressArray = addressStr.split('|')
        	for each in addressArray:
        		values = each.split(":")
        		addressValue = values[0]
        		address_dict = {}
        		address_dict = self.getListProximateAddress(start_address = addressValue,radius = radius)
        		returnDict.update({addressValue:address_dict})
        		try:
        			returnDict[addressValue]["metadata"]="Beds %s  Baths %s  SqFt %s  Lot Size %s  Price %s Price/Sqft %f Build ratio %f" % ( values[1], values[2], values[3], values[4], values[5], (int(values[5].strip())/int(values[3].strip())), (float(values[3].strip())/float(values[4].strip())) )
        		except:
        			returnDict[addressValue]["metadata"]="Values provided do not match the given format!!"
            	
		return returnDict 
       
    def salesNearby(self,**kw):
        return redirect(url(base_url='/salesNearby'), params=kw)
        
    
    
    
class FindSalesAddressForm(forms.Form):
    class child(forms.TableLayout):
        address = forms.TextField()
        radius = forms.TextField()
        submit = forms.SubmitButton(text="Find Sales")
     
       
       
