# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url


__all__ = ['AddressController']


class AddressController(BaseController):
    """
    The Address Controller for the corral Application
    """
    def __init__(self):
        self.api_token = "AIzaSyC3as1MRHycLCHUI13W0Z6nqi2AUivg87Y"
        self.google_url = "https://www.google.com/maps/place/"
    
    def locate(self, **kw):
        
        url = "http://maps.google.com/?q=1289+Elkwood+dr,+Milpitas,+CA&5501+Reseda+Circle,+Fremon,+CA" 
        return redirect(url)
        
    
    
    
class SelectAddressesForm(forms.Form):
    class child(forms.TableForm):
        addresses = forms.TextField()
        
    action = '/locate'
    