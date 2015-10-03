# -*- coding: utf-8 -*-
"""Main Controller"""

from tg import expose, flash, require, url, lurl, request, redirect, tmpl_context
from tg.i18n import ugettext as _, lazy_ugettext as l_
from tg.exceptions import HTTPFound
from tg import predicates
from windsre import model
from windsre.controllers.secure import SecureController
from windsre.model import DBSession, metadata
from tgext.admin.tgadminconfig import BootstrapTGAdminConfig as TGAdminConfig
from tgext.admin.controller import AdminController

from windsre.lib.base import BaseController
from windsre.controllers.error import ErrorController
from windsre.controllers.locateAddresses import AddressController, SelectAddressesForm
from windsre.controllers.getComps import CompController, CompAddressForm
from windsre.controllers.salesNearby import FindSalesController, FindSalesAddressForm
from windsre.controllers.project import ProjectController
from windsre.controllers.salesProject import postAdForm,trackPropsForm
from windsre.controllers.trackProps import TrackPropsController, trackPropsForm
from windsre.controllers.plot import PlotController
from windsre.controllers.generateLeads import postAdForm,postAdMLSForm, GenerateLeadsController
from windsre.controllers.postAds import PostAdsController, selectProps, postForm
from windsre.controllers.postLeads import postForm,postMLSForm
from windsre.controllers.post import PostController
from windsre.controllers.postAdsMLS import PostMLSController
#from chardet.test import result




__all__ = ['RootController']


class RootController(BaseController):
    """
    The root controller for the 4windsre application.

    All the other controllers and WSGI applications should be mounted on this
    controller. For example::

        panel = ControlPanelController()
        another_app = AnotherWSGIApplication()

    Keep in mind that WSGI applications shouldn't be mounted directly: They
    must be wrapped around with :class:`tg.controllers.WSGIAppController`.

    """
    secc = SecureController()
    admin = AdminController(model, DBSession, config_type=TGAdminConfig)

    error = ErrorController()

    def _before(self, *args, **kw):
        tmpl_context.project_name = "windsre"

    @expose('windsre.templates.index')
    def index(self):
        """Handle the front-page."""
        return dict(page='index')


    @expose('windsre.templates.services')
    def services(self):
        """Handle the front-page."""
        return dict(page='services')

    @expose('windsre.templates.about')
    def about(self):
        """Handle the 'about' page."""
        return dict(page='about')

    @expose('windsre.templates.contactus')
    def contactus(self):
        """Handle the 'about' page."""
        return dict(page='contactus')
    
    @expose('windsre.templates.environ')
    def environ(self):
        """This method showcases TG's access to the wsgi environment."""
        return dict(page='environ', environment=request.environ)

    @expose('windsre.templates.data')
    @expose('json')
    def data(self, **kw):
        """This method showcases how you can use the same controller for a data page and a display page"""
        return dict(page='data', params=kw)


    @expose('windsre.templates.index')
    @require(predicates.has_permission('manage', msg=l_('Only for managers')))
    def manage_permission_only(self, **kw):
        """Illustrate how a page for managers only works."""
        return dict(page='managers stuff')

    @expose('windsre.templates.index')
    @require(predicates.is_user('editor', msg=l_('Only for the editor')))
    def editor_user_only(self, **kw):
        """Illustrate how a page exclusive for the editor works."""
        return dict(page='editor stuff')

    @expose('windsre.templates.login')
    def login(self, came_from=lurl('/')):
        """Start the user login."""
        login_counter = request.environ.get('repoze.who.logins', 0)
        if login_counter > 0:
            flash(_('Wrong credentials'), 'warning')
        return dict(page='login', login_counter=str(login_counter),
                    came_from=came_from)

    @expose()
    def post_login(self, came_from=lurl('/')):
        """
        Redirect the user to the initially requested page on successful
        authentication or redirect her back to the login page if login failed.

        """
        if not request.identity:
            login_counter = request.environ.get('repoze.who.logins', 0) + 1
            redirect('/login',
                params=dict(came_from=came_from, __logins=login_counter))
        userid = request.identity['repoze.who.userid']
        flash(_('Welcome back, %s!') % userid)

        # Do not use tg.redirect with tg.url as it will add the mountpoint
        # of the application twice.
        return HTTPFound(location=came_from)

    @expose()
    def post_logout(self, came_from=lurl('/')):
        """
        Redirect the user to the initially requested page on logout and say
        goodbye as well.

        """
        flash(_('We hope to see you soon!'))
        return HTTPFound(location=came_from)
    
    
    @expose('windsre.templates.locateAddresses')
    def locateAddresses(self):
        """Handle the 'localteAddresses' page."""
        return dict(page='locateAddresses')
    
    
    @expose('windsre.templates.salesNearby')
    def salesNearby(self, **kw):
        """Handle the salesNearby-page."""
        if kw:
        	kw['result'] = FindSalesController().getDict(addressStr=kw['address'],radius = kw['radius'])
        
        return dict(page='salesNearby', kw=kw, form=FindSalesAddressForm)
    
    
    @expose('windsre.templates.getComps')
    def getComps(self, **kw):
        """Handle the getComps-page."""
        if kw:
            kw['result'] = CompController().findComps(address=kw['address'],zipcode=kw['zipcode'])

        return dict(page='getComps', kw=kw, form=CompAddressForm)
    
    
    
    @expose('windsre.templates.salesProject')
    #@require(predicates.has_permission('track', msg=l_('Only for Trackers')))
    def salesProject(self, **kw):
        """Handle the sales project-page."""
        if kw:
            return dict(page='postAds', kw=kw )
        else:
            project = ProjectController()
            projectList = project.listProjects()

            return dict(page='salesProject', kw=None, projectList=projectList, postAdform=postAdForm, trackPropsform=trackPropsForm )
        
    @expose('windsre.templates.trackProps')
    def trackProps(self, **kw):
        """Handle the tracking of the props."""

        for key in kw.keys():
            project = key
            kw = TrackPropsController(key).readProject()

        projectName =project.replace(".xlsx", "")
        return dict(page='trackProps', kw=kw, project=project, projectName=projectName, trackPropsForm=trackPropsForm)
    
    @expose('windsre.templates.plot')
    def plot(self, **kw):
        """Handle the plotting of the graph."""
        prop_dict = {}

        plotObj = PlotController()
        print kw
        prop_dict = plotObj.plotGraph(kw['project'], list(kw['property']))

        projectName =  kw['project'].replace(".xlsx", "")
        return dict(page='plot', kw=kw, projectName=projectName, prop_dict=prop_dict)
    
    @expose('windsre.templates.generateLeads')
    def generateLeads(self, **kw):
        """Handle the generate leads -page."""
        if kw:
            return dict(page='postAds', kw=kw )
        else:
            project = ProjectController()
            projectList = project.listProjects()

            return dict(page='generateLeads', kw=None, projectList=projectList, postAdform=postAdForm, postAdMLSform=postAdMLSForm )


    @expose('windsre.templates.postleads')
    def postLeads(self, **kw):
        """Handle the posting of Ads."""
        for key in kw.keys():
            project = key
            kw = PostAdsController(key).readProject()

        return dict(page='postleads', kw=kw, project=project, selectProps=selectProps, postForm=postForm, postMLSForm=postMLSForm)
    
    @expose('windsre.templates.postAdsMLS')
    def postAdsMLS(self, **kw):
        """Handle the posting of Ads."""
        print "I am in adsMLS"
        print kw
        postObj = PostMLSController()
        projectName = kw['project'].replace(".xlsx","")

        if kw.has_key('noMLS'):
            checkStatus = postObj.checkStatus(kw['project'], list(kw['property']))
            return dict(page='post', kw=kw, projectName=projectName, checkStatus=checkStatus, propertyStatus=None)
        else:
            propertyStatus = postObj.createXML(kw['project'], list(kw['property']))
            return dict(page='postAdsMLS', kw=kw, propertyStatus=propertyStatus, projectName=projectName, checkStatus=None)
        
        
    @expose('windsre.templates.post')
    def post(self, **kw):
        """Handle the posting of Ads."""
        return dict(page='post', kw=kw)








    
    
    
    
