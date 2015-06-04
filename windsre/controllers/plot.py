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


#from DNS.Type import NULL





__all__ = ['PlotController']


class PlotController(BaseController):
    """
    The Plot Controller for the corral Application
    """
    def __init__(self):
        self.output_location = ProjectController()._getOutputLocation()
        self.image_location = ProjectController()._getImageLocation()
        py.sign_in('ddhariwal','9nnxcdskrt')
        
           
    def plotGraph(self,project,addressKeys):
        
        address_dict = {}
        today_date = datetime.date.today()
        date_array = str(today_date).split("-")
        self.final_dict = {}
        
        for key in addressKeys:
            address_file = '%s/%s/address%s.pkl' % (self.output_location, project.replace(".xlsx",""), key)
            output = open(address_file, 'rb')
            address_dict = pickle.load(output)
            output.close()
            self.final_dict[key] = address_dict
                    
            x = []
            y = []
                    
                     
            for month in address_dict[date_array[0]].keys():
                for date in sorted(address_dict[date_array[0]][month].keys()):
                    x.append(datetime.datetime(year=int(date_array[0]), month=int(month), day=int(date)))
                    y.append(address_dict[date_array[0]][month][date])
                        
            data = Data([
                        Scatter(
                                x=x,
                                y=y
                        )
                   ])           
                #py.plot(data, filename='%s/%s.png' % (self.image_location, address_file))
                
            try:
                py.image.save_as({'data': data}, '%s/%s-%s.png' % (self.image_location,project.replace(".xlsx",""),os.path.basename(address_file)))
            except:
                pass
        
            address_dict = {}
            
        return self.final_dict
        
          
                
            
        
    
    
        
    
    
    