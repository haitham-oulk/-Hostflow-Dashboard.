"""
FastAPI application — Morocco Property Management MVP.

Auto-creates tables on startup. All monetary values are in MAD.
Database: SQLite (zero-config, local-first).
"""

from datetime import date, datetime, time
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from db import engine, get_db, Base
import models
import schemas

# ---------------------------------------------------------------------------
# Create all tables on startup
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Morocco Property Management",
    description="Local-first MVP for managing Moroccan rental properties (SQLite)",
    version="0.1.0",
)


# ═══════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _calculate_commission(platform: str, accommodation_price: float) -> tuple[float, float]:
    """
    Return (commission_mad, payment_fee_mad) based on platform rules.

    - Booking.com : 20 % commission + 2 % payment fee  (on accommodation only)
    - Airbnb      : 3 % commission, 0 payment fee
    - Direct      : 0, 0
    """
    if platform == models.PlatformEnum.booking.value:
        commission = round(accommodation_price * 0.20, 2)
        payment_fee = round(accommodation_price * 0.02, 2)
    elif platform == models.PlatformEnum.airbnb.value:
        commission = round(accommodation_price * 0.03, 2)
        payment_fee = 0.0
    else:  # direct
        commission = 0.0
        payment_fee = 0.0
    return commission, payment_fee


def _create_booking_tasks(db: Session, booking: models.Booking) -> None:
    """Auto-create cleaning + key-collection tasks due at checkout 10:00 AM."""
    due_dt = datetime.combine(booking.check_out, time(10, 0))
    for task_type in (models.TaskTypeEnum.cleaning.value, models.TaskTypeEnum.key_collection.value):
        task = models.Task(
            booking_id=booking.id,
            task_type=task_type,
            due_date=due_dt,
            status=models.TaskStatusEnum.pending.value,
        )
        db.add(task)
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# PROPERTIES
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/properties/", response_model=schemas.PropertyOut, status_code=201)
def create_property(payload: schemas.PropertyCreate, db: Session = Depends(get_db)):
    prop = models.Property(**payload.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@app.get("/properties/", response_model=List[schemas.PropertyOut])
def list_properties(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Property).offset(skip).limit(limit).all()


@app.get("/properties/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


# ═══════════════════════════════════════════════════════════════════════════
# BOOKINGS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/bookings/", response_model=schemas.BookingOut, status_code=201)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db)):
    # Verify property exists
    prop = db.query(models.Property).filter(models.Property.id == payload.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # --- Auto-calculate fields ---
    nights = (payload.check_out - payload.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    lead_time_days = (payload.check_in - date.today()).days

    commission, payment_fee = _calculate_commission(
        payload.platform.value, payload.accommodation_price_mad
    )

    net_revenue = round(
        payload.accommodation_price_mad
        - commission
        - payment_fee
        + payload.cleaning_fee_mad
        + payload.city_tax_mad,
        2,
    )

    booking = models.Booking(
        property_id=payload.property_id,
        guest_name=payload.guest_name,
        platform=payload.platform.value,
        check_in=payload.check_in,
        check_out=payload.check_out,
        nights=nights,
        lead_time_days=lead_time_days,
        accommodation_price_mad=payload.accommodation_price_mad,
        cleaning_fee_mad=payload.cleaning_fee_mad,
        city_tax_mad=payload.city_tax_mad,
        city_tax_collected=payload.city_tax_collected,
        commission_mad=commission,
        payment_fee_mad=payment_fee,
        net_revenue_mad=net_revenue,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # --- Auto-create BookingFinancials ---
    gross = payload.accommodation_price_mad + payload.cleaning_fee_mad + payload.city_tax_mad
    net_owner = round(gross - commission - payment_fee, 2)

    financials = models.BookingFinancials(
        booking_id=booking.id,
        gross_amount_mad=round(gross, 2),
        commission_mad=commission,
        payment_fee_mad=payment_fee,
        cleaning_fee_mad=payload.cleaning_fee_mad,
        city_tax_mad=payload.city_tax_mad,
        net_owner_payout_mad=net_owner,
    )
    db.add(financials)
    db.commit()

    # --- Auto-create tasks ---
    _create_booking_tasks(db, booking)

    db.refresh(booking)
    return booking


@app.get("/bookings/", response_model=List[schemas.BookingOut])
def list_bookings(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Booking).offset(skip).limit(limit).all()


@app.get("/bookings/{booking_id}", response_model=schemas.BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


# ═══════════════════════════════════════════════════════════════════════════
# TASKS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/tasks/", response_model=schemas.TaskOut, status_code=201)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks/", response_model=List[schemas.TaskOut])
def list_tasks(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Task).offset(skip).limit(limit).all()


@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


# ═══════════════════════════════════════════════════════════════════════════
# COMPLIANCE DOCUMENTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/compliance-documents/", response_model=schemas.ComplianceDocumentOut, status_code=201)
def create_compliance_document(payload: schemas.ComplianceDocumentCreate, db: Session = Depends(get_db)):
    doc = models.ComplianceDocument(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@app.get("/compliance-documents/", response_model=List[schemas.ComplianceDocumentOut])
def list_compliance_documents(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.ComplianceDocument).offset(skip).limit(limit).all()
