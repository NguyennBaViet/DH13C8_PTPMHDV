# E2E Test Report - Hotel Booking System

**Test Date**: _______________  
**Tester Name**: _______________  
**Build Version**: 0.0.1-SNAPSHOT  
**Test Environment**: Development  

---

## 📊 Test Summary

| Metric | Value |
|--------|-------|
| Total Test Cases | 14 |
| Passed | ___/14 |
| Failed | ___/14 |
| Skipped | ___/14 |
| Success Rate | __% |
| Duration | ___ minutes |

---

## ✅ Test Results Details

### STEP 1: Register User ✓ / ✗

**Test Case**: Create new user account  
**Expected**: User created with GUEST role  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 2: Login & Get JWT Token ✓ / ✗

**Test Case**: Authenticate user  
**Expected**: JWT token received, valid format  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Token Format Valid**: ☐ YES | ☐ NO  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 3: Get User Profile ✓ / ✗

**Test Case**: Retrieve logged-in user profile  
**Expected**: User info returned with correct data  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 4: Search Hotels ✓ / ✗

**Test Case**: List all hotels  
**Expected**: Hotel list returned with pagination  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Hotels Found**: ___  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 5: Get Hotel Details & Rooms ✓ / ✗

**Test Case**: Retrieve specific hotel and its rooms  
**Expected**: Hotel details and rooms list returned  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Rooms Found**: ___  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 6: Check Room Availability ✓ / ✗

**Test Case**: Check room availability for dates  
**Expected**: Boolean response (true/false)  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Available**: ☐ YES | ☐ NO | ☐ ERROR  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 7: Create Booking ✓ / ✗

**Test Case**: Create new booking  
**Expected**: Booking created with PENDING status  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Booking ID**: ___  
**Booking Code**: ___________  
**Status**: PENDING | OTHER  
**Total Amount**: ___________  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 8: Get Booking Details ✓ / ✗

**Test Case**: Retrieve booking details  
**Expected**: Booking info returned  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Booking Found**: ☐ YES | ☐ NO  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 9: Create Payment ✓ / ✗

**Test Case**: Initiate payment for booking  
**Expected**: Payment created with PENDING status  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Payment ID**: ___  
**Amount**: ___________  
**Status**: PENDING | OTHER  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 10: Process Payment (Mock) ✓ / ✗

**Test Case**: Process mock payment  
**Expected**: Payment status changed to SUCCESS  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Payment Status**: PENDING | SUCCESS | FAILED  
**Transaction ID**: ___________  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 11: Verify Payment Success ✓ / ✗

**Test Case**: Verify payment was processed  
**Expected**: Payment status is SUCCESS  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Payment Status**: SUCCESS | OTHER  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 12: Verify Booking Status Update ✓ / ✗

**Test Case**: Check booking auto-updated after payment  
**Expected**: Booking status changed to CONFIRMED  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Booking Status**: PENDING | CONFIRMED | OTHER  
**Error Message** (if any): _______________________

**Critical Finding**: ☐ If status NOT CONFIRMED, service-to-service communication may have failed  

**Notes**: _______________________________________

---

### STEP 13: Get My Notifications ✓ / ✗

**Test Case**: Retrieve user notifications  
**Expected**: 2+ notifications (PAYMENT_SUCCESS, BOOKING_CONFIRMED)  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Notifications Count**: ___  
**Notification Types**: ___________________  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

### STEP 14: Get My Bookings ✓ / ✗

**Test Case**: List all user bookings  
**Expected**: Booking appears in user's list  

**Status**: ☐ PASS | ☐ FAIL | ☐ SKIP

**Response Status Code**: ___  
**Bookings Found**: ___  
**Error Message** (if any): _______________________

**Notes**: _______________________________________

---

## 🔒 Security Tests

### Authorization Enforcement ✓ / ✗

**Test**: Access protected endpoint without token

```bash
curl http://localhost:8020/api/users/me
```

**Expected**: 401 Unauthorized  
**Result**: ☐ PASS | ☐ FAIL

**Actual Status Code**: ___

---

### Data Isolation ✓ / ✗

**Test**: User A accessing User B's booking

**Expected**: 403 Forbidden or 404 Not Found  
**Result**: ☐ PASS | ☐ FAIL

**Actual Status Code**: ___

---

### Invalid Token Rejection ✓ / ✗

**Test**: Request with invalid token

```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8020/api/users/me
```

**Expected**: 401 Unauthorized  
**Result**: ☐ PASS | ☐ FAIL

**Actual Status Code**: ___

---

## 🔄 Service Integration Tests

### Auth Service Integration ✓ / ✗

- JWT generation: ☐ PASS | ☐ FAIL
- Token validation: ☐ PASS | ☐ FAIL
- Role assignment: ☐ PASS | ☐ FAIL

**Issues**: ________________________________

---

### Hotel-Room Service Integration ✓ / ✗

- Room availability check: ☐ PASS | ☐ FAIL
- Room locking mechanism: ☐ PASS | ☐ FAIL
- Inventory update: ☐ PASS | ☐ FAIL

**Issues**: ________________________________

---

### Booking Service Integration ✓ / ✗

- Booking creation: ☐ PASS | ☐ FAIL
- Status management: ☐ PASS | ☐ FAIL
- Calls to room service: ☐ PASS | ☐ FAIL
- Calls to payment service: ☐ PASS | ☐ FAIL

**Issues**: ________________________________

---

### Payment-Noti Service Integration ✓ / ✗

- Payment processing: ☐ PASS | ☐ FAIL
- Notification sending: ☐ PASS | ☐ FAIL
- Booking callback: ☐ PASS | ☐ FAIL
- Email sent (mock/real): ☐ PASS | ☐ FAIL

**Issues**: ________________________________

---

### API Gateway Integration ✓ / ✗

- Request routing: ☐ PASS | ☐ FAIL
- Service discovery: ☐ PASS | ☐ FAIL
- JWT propagation: ☐ PASS | ☐ FAIL
- Rate limiting: ☐ PASS | ☐ FAIL

**Issues**: ________________________________

---

## 📈 Performance Assessment

| Endpoint | Expected (ms) | Actual (ms) | Status |
|----------|---------------|------------|--------|
| Auth/Login | < 200 | ___ | ☐ PASS ☐ FAIL |
| Hotels List | < 300 | ___ | ☐ PASS ☐ FAIL |
| Create Booking | < 500 | ___ | ☐ PASS ☐ FAIL |
| Process Payment | < 1000 | ___ | ☐ PASS ☐ FAIL |

**Performance Issues**: ____________________________

---

## 🐛 Issues Found

### Critical Issues
1. **Description**: _____________________________
   - **Impact**: High/Medium/Low
   - **Workaround**: _______________________
   - **Status**: ☐ OPEN ☐ FIXED ☐ DEFERRED

2. **Description**: _____________________________
   - **Impact**: High/Medium/Low
   - **Workaround**: _______________________
   - **Status**: ☐ OPEN ☐ FIXED ☐ DEFERRED

### Non-Critical Issues
1. **Description**: _____________________________
   - **Status**: ☐ OPEN ☐ FIXED ☐ DEFERRED

---

## 📝 Test Environment Details

**Services Running**:
- Auth Service (8021): ☐ YES ☐ NO
- User Service (8022): ☐ YES ☐ NO
- Hotel-Room Service (8023): ☐ YES ☐ NO
- Booking Service (8024): ☐ YES ☐ NO
- Payment-Noti Service (8025): ☐ YES ☐ NO
- API Gateway (8020): ☐ YES ☐ NO

**Database**:
- MySQL Status: ☐ RUNNING ☐ DOWN
- Database: khachsan
- Tables: ☐ CREATED ☐ MISSING

**Sample Data**:
- Hotels loaded: ☐ YES ☐ NO
- Rooms loaded: ☐ YES ☐ NO

---

## 🎯 Conclusion

**Overall Result**: ☐ PASS | ☐ FAIL | ☐ CONDITIONAL

**Success Rate**: __% (Passed / Total Cases)

**Ready for Production**: ☐ YES | ☐ NO

**Recommended Actions**:
1. _________________________________
2. _________________________________
3. _________________________________

---

## 👤 Sign-off

**Tester Name**: ________________  
**Tester Signature**: ________________  
**Date**: ________________  

**QA Manager Review**:  
**Name**: ________________  
**Signature**: ________________  
**Date**: ________________  

**Approved for Deployment**: ☐ YES | ☐ NO

---

## 📎 Attachments

- Curl command logs
- Service logs (if errors occurred)
- Screenshots of issues (if applicable)
- Database state before/after tests
