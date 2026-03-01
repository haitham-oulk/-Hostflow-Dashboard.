"""
SQLAlchemy ORM models for the Morocco Property Management system.

Currency: MAD (Moroccan Dirham) — all monetary fields are in MAD.
Uses String columns for enum-like fields (SQLite-compatible).
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from db import Base


# ---------------------------------------------------------------------------
# Enum constants (for validation — stored as strings in SQLite)
# ---------------------------------------------------------------------------
class PlatformEnum(str, enum.Enum):
    booking = "booking"
    airbnb = "airbnb"
    direct = "direct"


class BookingStatusEnum(str, enum.Enum):
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"


class TaskTypeEnum(str, enum.Enum):
    cleaning = "cleaning"
    key_collection = "key_collection"


class TaskStatusEnum(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class DocTypeEnum(str, enum.Enum):
    guest_id = "guest_id"
    marriage_certificate = "marriage_certificate"


# ---------------------------------------------------------------------------
# Property
# ---------------------------------------------------------------------------
class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    property_type = Column(String(50), nullable=False)  # apartment, villa, riad …
    bedrooms = Column(Integer, nullable=False, default=1)
    max_guests = Column(Integer, nullable=False, default=2)
    default_cleaning_fee_mad = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Booking
# ---------------------------------------------------------------------------
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    guest_name = Column(String(255), nullable=False)
    platform = Column(String(20), nullable=False)  # booking | airbnb | direct

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    nights = Column(Integer, nullable=False)              # auto-calculated
    lead_time_days = Column(Integer, nullable=False)      # auto-calculated

    accommodation_price_mad = Column(Float, nullable=False)
    cleaning_fee_mad = Column(Float, nullable=False, default=0.0)
    city_tax_mad = Column(Float, nullable=False, default=0.0)
    city_tax_collected = Column(Boolean, nullable=False, default=False)

    commission_mad = Column(Float, nullable=False, default=0.0)   # auto-calculated
    payment_fee_mad = Column(Float, nullable=False, default=0.0)  # auto-calculated
    net_revenue_mad = Column(Float, nullable=False, default=0.0)  # auto-calculated

    status = Column(String(20), nullable=False, default=BookingStatusEnum.confirmed.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    property = relationship("Property", back_populates="bookings")
    financials = relationship("BookingFinancials", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="booking", cascade="all, delete-orphan")
    compliance_documents = relationship("ComplianceDocument", back_populates="booking", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# BookingFinancials  (summary / audit row per booking)
# ---------------------------------------------------------------------------
class BookingFinancials(Base):
    __tablename__ = "booking_financials"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)

    gross_amount_mad = Column(Float, nullable=False, default=0.0)
    commission_mad = Column(Float, nullable=False, default=0.0)
    payment_fee_mad = Column(Float, nullable=False, default=0.0)
    cleaning_fee_mad = Column(Float, nullable=False, default=0.0)
    city_tax_mad = Column(Float, nullable=False, default=0.0)
    net_owner_payout_mad = Column(Float, nullable=False, default=0.0)

    # relationships
    booking = relationship("Booking", back_populates="financials")


# ---------------------------------------------------------------------------
# Task  (cleaning & key collection)
# ---------------------------------------------------------------------------
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    task_type = Column(String(20), nullable=False)  # cleaning | key_collection
    due_date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default=TaskStatusEnum.pending.value)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    booking = relationship("Booking", back_populates="tasks")


# ---------------------------------------------------------------------------
# ComplianceDocument  (guest ID, marriage certificate)
# ---------------------------------------------------------------------------
class ComplianceDocument(Base):
    __tablename__ = "compliance_documents"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    doc_type = Column(String(30), nullable=False)  # guest_id | marriage_certificate
    file_path = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    booking = relationship("Booking", back_populates="compliance_documents")
