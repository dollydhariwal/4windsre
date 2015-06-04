# -*- coding: utf-8 -*-
"""
Auth* related model.

This is where the models used by the authentication stack are defined.

It's perfectly fine to re-use this definition in the example application,
though.

"""
import os
from datetime import datetime
from hashlib import sha256
__all__ = ['Host','Pool','Site']

from sqlalchemy import Table, ForeignKey, Column
from sqlalchemy.types import Unicode, Integer, DateTime
from sqlalchemy.orm import relation, synonym

from windsre.model import DeclarativeBase, metadata, DBSession


class Contacts(DeclarativeBase):
    """
    Pool definition

    This database contains the pool available

    """

    __tablename__ = 'tg_contacts'
    __table_args__ = {'extend_existing': True}

    contact_id = Column(Integer, autoincrement=True, primary_key=True)
    contact_name = Column(Unicode(255), nullable=False)
    contact_email = Column(Unicode(255), nullable=False)
    contact_counties = Column(Unicode(255),  nullable=False)

    def __repr__(self):
        return None

    def __unicode__(self):
        return None


    @classmethod
    def pool_list(self):
        contact_lists = []
        for each in DBSession.query(Contacts).all():
            contact_lists.append(each)

        return contact_lists


    @classmethod
    def info_by_id(self,id):
        #try:

        row  = DBSession.query(Contacts).filter_by(contact_id=id).all()
        return dict(
                    contact_name = row[0].contact_name
                )