# -*- coding: utf-8 -*-
"""locate address controller."""

from windsre.lib.base import BaseController
import tw2.forms as forms
from tg import redirect, require, flash, url
import requests
import urllib2
import xml.etree.ElementTree as ET





__all__ = ['SalesProjectController']


class SalesProjectController(BaseController):
    """
    The Sales Project Controller for the corral Application
    """
    def __init__(self,privateToken=None):
        pass
    
    
    
class postAdForm(forms.SubmitButton):
    type = "submit"
    value = "Post Ad"
    
        
class trackPropsForm(forms.SubmitButton):
    #class child(forms.TableForm):
    type = "submit"
    value = "Track Properties"
    
    