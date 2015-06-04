# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url
import requests
import urllib2
import xml.etree.ElementTree as ET





__all__ = ['CompController']


class CompController(BaseController):
    """
    The Address Controller for the corral Application
    """
    def __init__(self,privateToken=None):
        """Stores information about the server
        url : the URL of the highrise server
        private_token: the user private token
        email: the user email/login
        password: the user password (associated with email)
        """
        self._url = 'http://www.zillow.com/webservice'
        self._privateToken = 'X1-ZWz1azdtprntor_8xo7s'
        self._connection()
        
        
    def _connection(self):
        password = 'X'
        passmanager = urllib2.HTTPPasswordMgrWithDefaultRealm()
        passmanager.add_password(None, self._url, self._privateToken, password)
        authhandler = urllib2.HTTPBasicAuthHandler(passmanager)
        self.opener = urllib2.build_opener(authhandler)
        urllib2.install_opener(self.opener)

    def getPropertyId(self, address=None, zipcode=None):
        page = urllib2.urlopen("%s/GetDeepSearchResults.htm?zws-id=%s&address=%s&citystatezip=%s" % (self._url,self._privateToken,address.replace(" ", "+"), zipcode)).read()
        root = ET.fromstring(page)
        property_id = 'None'
        
        for view in root.iter('result'):
            property_id = view.find('zpid').text 
            
        return property_id
       
    def findComps(self, address=None, zipcode=None):
        zpid = self.getPropertyId(address=address, zipcode=zipcode)
        page = urllib2.urlopen("%s/GetDeepComps.htm?zws-id=%s&zpid=%s&count=25" % (self._url,self._privateToken,zpid)).read()
        root = ET.fromstring(page)
        propertytDict = {}
        scoreDict = {}
        for comp in root.iter('comp'):
            address = "%s" % ( comp.find('address').find('street').text)
            zip = comp.find('address').find('zipcode').text
            price = comp.find('lastSoldPrice').text
            updated = comp.find('lastSoldDate').text
            propertytDict[comp.find('zpid').text] = "%s %s      price: %s         last-updated: %s | score: %s " % (address, zip,price,updated, comp.get('score') )
            
            try:
                scoreDict[comp.get('score')].append(propertytDict[comp.find('zpid').text])
            except: 
                scoreDict[comp.get('score')] = [propertytDict[comp.find('zpid').text]]
                
        return scoreDict 
    
    def getComps(self,**kw):
        return redirect(url(base_url='/getComps'), params=kw)
        
    
    
    
class CompAddressForm(forms.Form):
    class child(forms.TableLayout):
        address = forms.TextField()
        zipcode = forms.TextField()
        submit = forms.SubmitButton(value="Get Comps")
     
       
       