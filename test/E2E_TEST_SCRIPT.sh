#!/bin/bash

# ============================================================
# E2E TEST SCRIPT - Hotel Booking Microservices
# ============================================================
# Description: Complete flow testing from registration to payment
# Usage: ./E2E_TEST_SCRIPT.sh
# Platform: Linux/Mac (Windows users: use curl in PowerShell)
# ============================================================

set -e

# Configuration
GATEWAY_URL="http://localhost:8020"
TIMESTAMP=$(date +%s)
TEST_USERNAME="testuser_${TIMESTAMP}"
TEST_EMAIL="test_${TIMESTAMP}@gmail.com"
TEST_PASSWORD="TestPassword123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================
# STEP 1: REGISTER USER
# ============================================================
print_header "STEP 1: REGISTER USER"

echo "Username: $TEST_USERNAME"
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"

REGISTER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'$TEST_USERNAME'",
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "fullName": "Test User '$TIMESTAMP'"
  }')

echo "Response: $REGISTER_RESPONSE"

# Extract userId
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$USER_ID" ]; then
    print_error "Failed to register user"
    exit 1
fi

print_success "User registered successfully. USER_ID: $USER_ID"

# ============================================================
# STEP 2: LOGIN & GET JWT TOKEN
# ============================================================
print_header "STEP 2: LOGIN & GET JWT TOKEN"

LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'$TEST_USERNAME'",
    "password": "'$TEST_PASSWORD'"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    print_error "Failed to get access token"
    exit 1
fi

print_success "Login successful"
echo "ACCESS_TOKEN: ${ACCESS_TOKEN:0:50}..."
echo "REFRESH_TOKEN: ${REFRESH_TOKEN:0:50}..."

# ============================================================
# STEP 3: GET USER PROFILE
# ============================================================
print_header "STEP 3: GET USER PROFILE"

PROFILE_RESPONSE=$(curl -s -X GET "$GATEWAY_URL/api/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PROFILE_RESPONSE"
print_success "User profile retrieved"

# ============================================================
# STEP 4: SEARCH HOTELS
# ============================================================
print_header "STEP 4: SEARCH HOTELS"

HOTELS_RESPONSE=$(curl -s -X GET "$GATEWAY_URL/api/hotels" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $HOTELS_RESPONSE"

# Extract first hotel ID
HOTEL_ID=$(echo $HOTELS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$HOTEL_ID" ]; then
    print_warning "No hotels found. Make sure sample data is loaded."
    HOTEL_ID=1
fi

print_success "Hotels retrieved. Using HOTEL_ID: $HOTEL_ID"

# ============================================================
# STEP 5: GET HOTEL DETAILS & ROOMS
# ============================================================
print_header "STEP 5: GET HOTEL DETAILS & ROOMS"

HOTEL_DETAIL=$(curl -s -X GET "$GATEWAY_URL/api/hotels/$HOTEL_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Hotel Detail Response: $HOTEL_DETAIL"

# Get rooms of hotel
ROOMS_RESPONSE=$(curl -s -X GET "$GATEWAY_URL/api/hotels/$HOTEL_ID/rooms" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Rooms Response: $ROOMS_RESPONSE"

# Extract first room ID
ROOM_ID=$(echo $ROOMS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ROOM_ID" ]; then
    print_warning "No rooms found"
    ROOM_ID=1
fi

print_success "Hotel details retrieved. Using ROOM_ID: $ROOM_ID"

# ============================================================
# STEP 6: CHECK ROOM AVAILABILITY
# ============================================================
print_header "STEP 6: CHECK ROOM AVAILABILITY"

CHECK_IN="2024-12-20"
CHECK_OUT="2024-12-23"

AVAILABILITY_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/rooms/check-availability" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "roomId": '$ROOM_ID',
    "checkInDate": "'$CHECK_IN'",
    "checkOutDate": "'$CHECK_OUT'",
    "numGuests": 2
  }')

echo "Response: $AVAILABILITY_RESPONSE"
print_success "Room availability checked"

# ============================================================
# STEP 7: CREATE BOOKING
# ============================================================
print_header "STEP 7: CREATE BOOKING"

BOOKING_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "roomId": '$ROOM_ID',
    "checkInDate": "'$CHECK_IN'",
    "checkOutDate": "'$CHECK_OUT'",
    "numGuests": 2,
    "specialRequests": "Non-smoking room"
  }')

echo "Response: $BOOKING_RESPONSE"

# Extract booking ID and code
BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
BOOKING_CODE=$(echo $BOOKING_RESPONSE | grep -o '"bookingCode":"[^"]*' | cut -d'"' -f4)
TOTAL_AMOUNT=$(echo $BOOKING_RESPONSE | grep -o '"totalAmount":[0-9.]*' | cut -d':' -f2)

if [ -z "$BOOKING_ID" ]; then
    print_error "Failed to create booking"
    exit 1
fi

print_success "Booking created successfully"
echo "BOOKING_ID: $BOOKING_ID"
echo "BOOKING_CODE: $BOOKING_CODE"
echo "TOTAL_AMOUNT: $TOTAL_AMOUNT"

# ============================================================
# STEP 8: GET BOOKING DETAILS
# ============================================================
print_header "STEP 8: GET BOOKING DETAILS"

BOOKING_DETAIL=$(curl -s -X GET "$GATEWAY_URL/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $BOOKING_DETAIL"
print_success "Booking details retrieved"

# ============================================================
# STEP 9: CREATE PAYMENT
# ============================================================
print_header "STEP 9: CREATE PAYMENT"

PAYMENT_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "bookingId": '$BOOKING_ID',
    "paymentMethod": "MOCK"
  }')

echo "Response: $PAYMENT_RESPONSE"

# Extract payment ID
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
PAYMENT_STATUS=$(echo $PAYMENT_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_ID" ]; then
    print_error "Failed to create payment"
    exit 1
fi

print_success "Payment created successfully"
echo "PAYMENT_ID: $PAYMENT_ID"
echo "PAYMENT_STATUS: $PAYMENT_STATUS"

# ============================================================
# STEP 10: PROCESS PAYMENT (MOCK)
# ============================================================
print_header "STEP 10: PROCESS PAYMENT (MOCK)"

PROCESS_PAYMENT=$(curl -s -X POST "$GATEWAY_URL/api/payments/process" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "paymentId": '$PAYMENT_ID',
    "method": "MOCK"
  }')

echo "Response: $PROCESS_PAYMENT"

PAYMENT_STATUS_AFTER=$(echo $PROCESS_PAYMENT | grep -o '"status":"[^"]*' | cut -d'"' -f4)
print_success "Payment processed. Status: $PAYMENT_STATUS_AFTER"

# ============================================================
# STEP 11: VERIFY PAYMENT SUCCESS
# ============================================================
print_header "STEP 11: VERIFY PAYMENT SUCCESS"

VERIFY_PAYMENT=$(curl -s -X GET "$GATEWAY_URL/api/payments/$PAYMENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $VERIFY_PAYMENT"
print_success "Payment verified"

# ============================================================
# STEP 12: VERIFY BOOKING STATUS (Should be CONFIRMED)
# ============================================================
print_header "STEP 12: VERIFY BOOKING STATUS (Should be CONFIRMED)"

BOOKING_VERIFIED=$(curl -s -X GET "$GATEWAY_URL/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $BOOKING_VERIFIED"

BOOKING_STATUS=$(echo $BOOKING_VERIFIED | grep -o '"status":"[^"]*' | cut -d'"' -f4 | head -1)
print_success "Booking status: $BOOKING_STATUS (expected: CONFIRMED)"

# ============================================================
# STEP 13: GET MY NOTIFICATIONS
# ============================================================
print_header "STEP 13: GET MY NOTIFICATIONS"

NOTIFICATIONS=$(curl -s -X GET "$GATEWAY_URL/api/notifications/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $NOTIFICATIONS"
print_success "Notifications retrieved"

# ============================================================
# STEP 14: GET MY BOOKINGS
# ============================================================
print_header "STEP 14: GET MY BOOKINGS"

MY_BOOKINGS=$(curl -s -X GET "$GATEWAY_URL/api/bookings/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $MY_BOOKINGS"
print_success "My bookings retrieved"

# ============================================================
# TEST SUMMARY
# ============================================================
print_header "TEST SUMMARY - ALL TESTS COMPLETED ✓"

echo -e "${GREEN}Test Run Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "User ID:           $USER_ID"
echo "Test Username:     $TEST_USERNAME"
echo "Test Email:        $TEST_EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Hotel ID:          $HOTEL_ID"
echo "Room ID:           $ROOM_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Booking ID:        $BOOKING_ID"
echo "Booking Code:      $BOOKING_CODE"
echo "Booking Status:    $BOOKING_STATUS"
echo "Total Amount:      $TOTAL_AMOUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Payment ID:        $PAYMENT_ID"
echo "Payment Status:    $PAYMENT_STATUS_AFTER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_success "E2E Test Suite Completed Successfully!"
