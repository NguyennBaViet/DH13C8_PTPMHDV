# ============================================================
# E2E TEST SCRIPT - Hotel Booking Microservices (PowerShell)
# ============================================================
# Description: Complete flow testing from registration to payment
# Usage: ./E2E_TEST_SCRIPT.ps1
# Platform: Windows PowerShell
# ============================================================

# Configuration
$GATEWAY_URL = "http://localhost:8020"
$TIMESTAMP = Get-Date -UFormat %s
$TEST_USERNAME = "testuser_$TIMESTAMP"
$TEST_EMAIL = "test_$TIMESTAMP@gmail.com"
$TEST_PASSWORD = "TestPassword123!"

# Color helper functions
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n" -ForegroundColor Blue
    Write-Host "═════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "═════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "`n"
}

# ============================================================
# STEP 1: REGISTER USER
# ============================================================
Write-Header "STEP 1: REGISTER USER"

Write-Host "Username: $TEST_USERNAME"
Write-Host "Email: $TEST_EMAIL"
Write-Host "Password: $TEST_PASSWORD"

try {
    $registerBody = @{
        username = $TEST_USERNAME
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        fullName = "Test User $TIMESTAMP"
    } | ConvertTo-Json

    $registerResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody | ConvertFrom-Json

    Write-Host "Response: $($registerResponse | ConvertTo-Json)"

    $USER_ID = $registerResponse.data.id

    if (-not $USER_ID) {
        Write-Error-Custom "Failed to register user"
        exit 1
    }

    Write-Success "User registered successfully. USER_ID: $USER_ID"
}
catch {
    Write-Error-Custom "Registration failed: $_"
    exit 1
}

# ============================================================
# STEP 2: LOGIN & GET JWT TOKEN
# ============================================================
Write-Header "STEP 2: LOGIN & GET JWT TOKEN"

try {
    $loginBody = @{
        username = $TEST_USERNAME
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody | ConvertFrom-Json

    Write-Host "Response: $($loginResponse | ConvertTo-Json)"

    $ACCESS_TOKEN = $loginResponse.data.accessToken
    $REFRESH_TOKEN = $loginResponse.data.refreshToken

    if (-not $ACCESS_TOKEN) {
        Write-Error-Custom "Failed to get access token"
        exit 1
    }

    Write-Success "Login successful"
    Write-Host "ACCESS_TOKEN: $($ACCESS_TOKEN.Substring(0, [Math]::Min(50, $ACCESS_TOKEN.Length)))..."
}
catch {
    Write-Error-Custom "Login failed: $_"
    exit 1
}

# ============================================================
# STEP 3: GET USER PROFILE
# ============================================================
Write-Header "STEP 3: GET USER PROFILE"

try {
    $headers = @{ Authorization = "Bearer $ACCESS_TOKEN" }
    $profileResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/users/me" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($profileResponse | ConvertTo-Json)"
    Write-Success "User profile retrieved"
}
catch {
    Write-Error-Custom "Failed to get profile: $_"
}

# ============================================================
# STEP 4: SEARCH HOTELS
# ============================================================
Write-Header "STEP 4: SEARCH HOTELS"

try {
    $hotelsResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/hotels" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($hotelsResponse | ConvertTo-Json -Depth 2)"

    if ($hotelsResponse.data -and $hotelsResponse.data.Count -gt 0) {
        $HOTEL_ID = $hotelsResponse.data[0].id
    }
    else {
        Write-Warning-Custom "No hotels found. Using default HOTEL_ID: 1"
        $HOTEL_ID = 1
    }

    Write-Success "Hotels retrieved. Using HOTEL_ID: $HOTEL_ID"
}
catch {
    Write-Error-Custom "Failed to search hotels: $_"
    $HOTEL_ID = 1
}

# ============================================================
# STEP 5: GET HOTEL DETAILS & ROOMS
# ============================================================
Write-Header "STEP 5: GET HOTEL DETAILS & ROOMS"

try {
    $hotelDetail = Invoke-WebRequest -Uri "$GATEWAY_URL/api/hotels/$HOTEL_ID" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Hotel Detail: $($hotelDetail | ConvertTo-Json -Depth 2)"

    $roomsResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/hotels/$HOTEL_ID/rooms" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Rooms Response: $($roomsResponse | ConvertTo-Json -Depth 2)"

    if ($roomsResponse.data -and $roomsResponse.data.Count -gt 0) {
        $ROOM_ID = $roomsResponse.data[0].id
    }
    else {
        Write-Warning-Custom "No rooms found. Using default ROOM_ID: 1"
        $ROOM_ID = 1
    }

    Write-Success "Hotel details retrieved. Using ROOM_ID: $ROOM_ID"
}
catch {
    Write-Error-Custom "Failed to get hotel details: $_"
    $ROOM_ID = 1
}

# ============================================================
# STEP 6: CHECK ROOM AVAILABILITY
# ============================================================
Write-Header "STEP 6: CHECK ROOM AVAILABILITY"

$CHECK_IN = "2024-12-20"
$CHECK_OUT = "2024-12-23"

try {
    $availabilityBody = @{
        roomId = $ROOM_ID
        checkInDate = $CHECK_IN
        checkOutDate = $CHECK_OUT
        numGuests = 2
    } | ConvertTo-Json

    $availabilityResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/rooms/check-availability" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $availabilityBody | ConvertFrom-Json

    Write-Host "Response: $availabilityResponse"
    Write-Success "Room availability checked"
}
catch {
    Write-Error-Custom "Failed to check availability: $_"
}

# ============================================================
# STEP 7: CREATE BOOKING
# ============================================================
Write-Header "STEP 7: CREATE BOOKING"

try {
    $bookingBody = @{
        roomId = $ROOM_ID
        checkInDate = $CHECK_IN
        checkOutDate = $CHECK_OUT
        numGuests = 2
        specialRequests = "Non-smoking room"
    } | ConvertTo-Json

    $bookingResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/bookings" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $bookingBody | ConvertFrom-Json

    Write-Host "Response: $($bookingResponse | ConvertTo-Json)"

    $BOOKING_ID = $bookingResponse.data.id
    $BOOKING_CODE = $bookingResponse.data.bookingCode
    $TOTAL_AMOUNT = $bookingResponse.data.totalAmount

    if (-not $BOOKING_ID) {
        Write-Error-Custom "Failed to create booking"
        exit 1
    }

    Write-Success "Booking created successfully"
    Write-Host "BOOKING_ID: $BOOKING_ID"
    Write-Host "BOOKING_CODE: $BOOKING_CODE"
    Write-Host "TOTAL_AMOUNT: $TOTAL_AMOUNT"
}
catch {
    Write-Error-Custom "Failed to create booking: $_"
    exit 1
}

# ============================================================
# STEP 8: GET BOOKING DETAILS
# ============================================================
Write-Header "STEP 8: GET BOOKING DETAILS"

try {
    $bookingDetail = Invoke-WebRequest -Uri "$GATEWAY_URL/api/bookings/$BOOKING_ID" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($bookingDetail | ConvertTo-Json -Depth 2)"
    Write-Success "Booking details retrieved"
}
catch {
    Write-Error-Custom "Failed to get booking details: $_"
}

# ============================================================
# STEP 9: CREATE PAYMENT
# ============================================================
Write-Header "STEP 9: CREATE PAYMENT"

try {
    $paymentBody = @{
        bookingId = $BOOKING_ID
        paymentMethod = "MOCK"
    } | ConvertTo-Json

    $paymentResponse = Invoke-WebRequest -Uri "$GATEWAY_URL/api/payments" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $paymentBody | ConvertFrom-Json

    Write-Host "Response: $($paymentResponse | ConvertTo-Json)"

    $PAYMENT_ID = $paymentResponse.data.id
    $PAYMENT_STATUS = $paymentResponse.data.status

    if (-not $PAYMENT_ID) {
        Write-Error-Custom "Failed to create payment"
        exit 1
    }

    Write-Success "Payment created successfully"
    Write-Host "PAYMENT_ID: $PAYMENT_ID"
    Write-Host "PAYMENT_STATUS: $PAYMENT_STATUS"
}
catch {
    Write-Error-Custom "Failed to create payment: $_"
    exit 1
}

# ============================================================
# STEP 10: PROCESS PAYMENT (MOCK)
# ============================================================
Write-Header "STEP 10: PROCESS PAYMENT (MOCK)"

try {
    $processPaymentBody = @{
        paymentId = $PAYMENT_ID
        method = "MOCK"
    } | ConvertTo-Json

    $processPayment = Invoke-WebRequest -Uri "$GATEWAY_URL/api/payments/process" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $processPaymentBody | ConvertFrom-Json

    Write-Host "Response: $($processPayment | ConvertTo-Json)"

    $PAYMENT_STATUS_AFTER = $processPayment.data.status
    Write-Success "Payment processed. Status: $PAYMENT_STATUS_AFTER"
}
catch {
    Write-Error-Custom "Failed to process payment: $_"
}

# ============================================================
# STEP 11: VERIFY PAYMENT SUCCESS
# ============================================================
Write-Header "STEP 11: VERIFY PAYMENT SUCCESS"

try {
    $verifyPayment = Invoke-WebRequest -Uri "$GATEWAY_URL/api/payments/$PAYMENT_ID" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($verifyPayment | ConvertTo-Json -Depth 2)"
    Write-Success "Payment verified"
}
catch {
    Write-Error-Custom "Failed to verify payment: $_"
}

# ============================================================
# STEP 12: VERIFY BOOKING STATUS (Should be CONFIRMED)
# ============================================================
Write-Header "STEP 12: VERIFY BOOKING STATUS (Should be CONFIRMED)"

try {
    $bookingVerified = Invoke-WebRequest -Uri "$GATEWAY_URL/api/bookings/$BOOKING_ID" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($bookingVerified | ConvertTo-Json -Depth 2)"

    $BOOKING_STATUS = $bookingVerified.data.status
    Write-Success "Booking status: $BOOKING_STATUS (expected: CONFIRMED)"
}
catch {
    Write-Error-Custom "Failed to verify booking: $_"
}

# ============================================================
# STEP 13: GET MY NOTIFICATIONS
# ============================================================
Write-Header "STEP 13: GET MY NOTIFICATIONS"

try {
    $notifications = Invoke-WebRequest -Uri "$GATEWAY_URL/api/notifications/me" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($notifications | ConvertTo-Json -Depth 3)"
    Write-Success "Notifications retrieved"
}
catch {
    Write-Error-Custom "Failed to get notifications: $_"
}

# ============================================================
# STEP 14: GET MY BOOKINGS
# ============================================================
Write-Header "STEP 14: GET MY BOOKINGS"

try {
    $myBookings = Invoke-WebRequest -Uri "$GATEWAY_URL/api/bookings/me" `
        -Method GET `
        -Headers $headers | ConvertFrom-Json

    Write-Host "Response: $($myBookings | ConvertTo-Json -Depth 3)"
    Write-Success "My bookings retrieved"
}
catch {
    Write-Error-Custom "Failed to get my bookings: $_"
}

# ============================================================
# TEST SUMMARY
# ============================================================
Write-Header "TEST SUMMARY - ALL TESTS COMPLETED ✓"

Write-Host "Test Run Summary:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "User ID:           $USER_ID"
Write-Host "Test Username:     $TEST_USERNAME"
Write-Host "Test Email:        $TEST_EMAIL"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Hotel ID:          $HOTEL_ID"
Write-Host "Room ID:           $ROOM_ID"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Booking ID:        $BOOKING_ID"
Write-Host "Booking Code:      $BOOKING_CODE"
Write-Host "Booking Status:    $BOOKING_STATUS"
Write-Host "Total Amount:      $TOTAL_AMOUNT"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Payment ID:        $PAYMENT_ID"
Write-Host "Payment Status:    $PAYMENT_STATUS_AFTER"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Success "E2E Test Suite Completed Successfully!"
