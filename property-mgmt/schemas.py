"""
Pydantic schemas (request / response models) for the Property Management API.
"""

from datetime import date, datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Enums (mirror SQLAlchemy enums for Pydantic)
# ---------------------------------------------------------------------------
class PlatformEnum(str, Enum):
    booking = "booking"
    airbnb = "airbnb"
    direct = "direct"


class BookingStatusEnum(str, Enum):
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"


class TaskTypeEnum(str, Enum):
    cleaning = "cleaning"
    key_collection = "key_collection"


class TaskStatusEnum(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class DocTypeEnum(str, Enum):
    guest_id = "guest_id"
    marriage_certificate = "marriage_certificate"


# ---------------------------------------------------------------------------
# Property
# ---------------------------------------------------------------------------
class PropertyCreate(BaseModel):
    name: str
    address: str
    city: str
    property_type: str
    bedrooms: int = 1
    max_guests: int = 2
    default_cleaning_fee_mad: float = 0.0


class PropertyOut(PropertyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Task
# ---------------------------------------------------------------------------
class TaskCreate(BaseModel):
    booking_id: Optional[int] = None
    task_type: TaskTypeEnum
    due_date: datetime
    status: TaskStatusEnum = TaskStatusEnum.pending
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    status: Optional[TaskStatusEnum] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: Optional[int]
    task_type: TaskTypeEnum
    due_date: datetime
    status: TaskStatusEnum
    notes: Optional[str]
    created_at: datetime


# ---------------------------------------------------------------------------
# BookingFinancials
# ---------------------------------------------------------------------------
class BookingFinancialsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    gross_amount_mad: float
    commission_mad: float
    payment_fee_mad: float
    cleaning_fee_mad: float
    city_tax_mad: float
    net_owner_payout_mad: float


# ---------------------------------------------------------------------------
# Booking
# ---------------------------------------------------------------------------
class BookingCreate(BaseModel):
    property_id: int
    guest_name: str
    platform: PlatformEnum
    check_in: date
    check_out: date
    accommodation_price_mad: float
    cleaning_fee_mad: float = 0.0
    city_tax_mad: float = 0.0
    city_tax_collected: bool = False


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    guest_name: str
    platform: PlatformEnum
    check_in: date
    check_out: date
    nights: int
    lead_time_days: int
    accommodation_price_mad: float
    cleaning_fee_mad: float
    city_tax_mad: float
    city_tax_collected: bool
    commission_mad: float
    payment_fee_mad: float
    net_revenue_mad: float
    status: BookingStatusEnum
    created_at: datetime
    financials: Optional[BookingFinancialsOut] = None
    tasks: List[TaskOut] = []


# ---------------------------------------------------------------------------
# ComplianceDocument
# ---------------------------------------------------------------------------
class ComplianceDocumentCreate(BaseModel):
    booking_id: int
    doc_type: DocTypeEnum
    file_path: Optional[str] = None


class ComplianceDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    doc_type: DocTypeEnum
    file_path: Optional[str]
    uploaded_at: datetime
