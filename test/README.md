# E2E Testing Suite - Hotel Booking System

## 📋 Overview

This directory contains comprehensive end-to-end testing materials for the hotel booking microservices system.

**Complete Test Flow**: Register → Login → Search Hotels → Book Room → Check Payment → Notification

---

## 📁 Files

### 1. **E2E_TEST_SCRIPT.sh** (Linux/Mac)
Automated bash script that runs all test steps sequentially.

**Usage**:
```bash
chmod +x E2E_TEST_SCRIPT.sh
./E2E_TEST_SCRIPT.sh
```

**Features**:
- ✅ Automatic test execution
- ✅ Color-coded output
- ✅ Error handling
- ✅ Test summary report
- ✅ Extracts and saves important IDs

---

### 2. **E2E_TEST_SCRIPT.ps1** (Windows PowerShell)
Automated PowerShell script for Windows users.

**Usage**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\E2E_TEST_SCRIPT.ps1
```

**Features**:
- ✅ Works on Windows 10/11
- ✅ Colored output
- ✅ Comprehensive error handling
- ✅ JSON response parsing
- ✅ Detailed summary

---

### 3. **E2E_TESTING_GUIDE.md**
Step-by-step manual testing guide with curl commands.

**Contains**:
- ✅ Prerequisites checklist
- ✅ 14 detailed test steps with curl commands
- ✅ Expected responses for each step
- ✅ Validation criteria
- ✅ Advanced test scenarios
- ✅ Troubleshooting guide
- ✅ Performance expectations

**Use Case**: Manual testing, understanding the flow, debugging

---

### 4. **TEST_REPORT_TEMPLATE.md**
Template for documenting test results.

**Includes**:
- ✅ Test summary metrics
- ✅ Individual test case results
- ✅ Security test checks
- ✅ Service integration validation
- ✅ Performance measurements
- ✅ Issue documentation
- ✅ Sign-off section

**Use Case**: Recording test execution results, compliance documentation

---

## 🚀 Quick Start

### Option 1: Automated Testing

**Linux/Mac**:
```bash
cd test
./E2E_TEST_SCRIPT.sh
```

**Windows**:
```powershell
cd test
.\E2E_TEST_SCRIPT.ps1
```

**Time**: ~5-10 minutes  
**Effort**: Minimal (just run the script)

---

### Option 2: Manual Testing

Follow the step-by-step guide:
```bash
cat E2E_TESTING_GUIDE.md
```

Then execute curl commands manually for each step.

**Time**: ~30-45 minutes  
**Effort**: Moderate (requires understanding of API calls)

---

### Option 3: Mix of Both

Use the guide to understand each step, then run the automated script.

---

## ✅ Test Checklist

Before running tests:

- [ ] All 6 services are running:
  - [ ] Auth Service (8021)
  - [ ] User Service (8022)
  - [ ] Hotel-Room Service (8023)
  - [ ] Booking Service (8024)
  - [ ] Payment-Noti Service (8025)
  - [ ] API Gateway (8020)

- [ ] MySQL database running:
  - [ ] Database `khachsan` exists
  - [ ] Tables created (Flyway migration)
  - [ ] Sample data loaded

- [ ] System connectivity:
  - [ ] Can ping localhost:8020 (Gateway)
  - [ ] Network connectivity OK
  - [ ] No firewall blocking

---

## 📊 Test Scenarios

### Main Flow (14 Steps)
1. Register new user
2. Login and get JWT token
3. Retrieve user profile
4. Search and list hotels
5. Get hotel details and rooms
6. Check room availability
7. Create booking
8. Get booking details
9. Create payment
10. Process payment (mock)
11. Verify payment success
12. Verify booking status updated
13. Get user notifications
14. Get my bookings

### Security Tests
- [ ] Authorization enforcement (no token → 401)
- [ ] Data isolation (access other user's data → 403)
- [ ] Invalid token rejection
- [ ] Protected endpoint access

### Integration Tests
- [ ] Auth service functionality
- [ ] Hotel-Room service communication
- [ ] Booking service workflow
- [ ] Payment-Noti service integration
- [ ] API Gateway routing

### Performance Tests
- [ ] Login response time < 200ms
- [ ] Hotel search < 300ms
- [ ] Booking creation < 500ms
- [ ] Payment processing < 1000ms

---

## 📈 Success Criteria

✅ **Task 5 is complete when**:

1. All 14 test steps execute successfully
2. Each step returns expected HTTP status code
3. Data validation passes for each response
4. Booking status changes from PENDING → CONFIRMED automatically
5. Payment status successfully changes to SUCCESS
6. At least 2 notifications are created
7. User can retrieve their own bookings and notifications
8. Security tests pass (401, 403 responses)
9. No critical errors in service logs
10. Performance metrics within acceptable range

---

## 🐛 Troubleshooting

### Error: Connection refused on port 8020
- **Cause**: API Gateway not running
- **Fix**: Start API Gateway service
- **Verify**: `curl http://localhost:8020/health`

### Error: Invalid token
- **Cause**: JWT_SECRET mismatch across services
- **Fix**: Ensure same JWT_SECRET in all services
- **Verify**: Check application.properties files

### Error: Room not available
- **Cause**: Test dates are in the past or already booked
- **Fix**: Use future dates (today + 5+ days)
- **Verify**: Check database room_availability table

### Error: Database not found
- **Cause**: Schema not created or Flyway not run
- **Fix**: Run schema.sql or restart services (Flyway auto-runs)
- **Verify**: `mysql khachsan -e "SHOW TABLES;"`

### Error: Booking not confirmed after payment
- **Cause**: Booking service didn't receive payment callback
- **Fix**: Check service-to-service URLs in application.properties
- **Verify**: Check booking-service logs

---

## 📝 Test Reports

After running tests:

1. **Automated Script Output**: Check console output and summary
2. **Manual Testing**: Fill in TEST_REPORT_TEMPLATE.md
3. **Save Reports**: Create timestamped copy:
   ```bash
   cp TEST_REPORT_TEMPLATE.md TEST_REPORT_$(date +%Y%m%d_%H%M%S).md
   ```

---

## 🔍 Advanced Usage

### Test Specific Scenario

Edit E2E_TEST_SCRIPT.ps1 or .sh to comment out unwanted steps.

### Customize Test Data

Modify test values in scripts:
```bash
TEST_USERNAME="custom_user"
TEST_EMAIL="custom@email.com"
CHECK_IN="2024-12-25"
CHECK_OUT="2024-12-27"
```

### Integration with CI/CD

Use automated scripts in CI/CD pipeline:
```bash
# In GitHub Actions, GitLab CI, etc.
./E2E_TEST_SCRIPT.sh
EXIT_CODE=$?
exit $EXIT_CODE
```

---

## 📊 Performance Baseline

Expected response times (local environment):
| Endpoint | Time | Notes |
|----------|------|-------|
| Auth/Login | 100-200ms | Fast, local auth |
| Hotels List | 150-300ms | Database query |
| Create Booking | 300-500ms | Multiple DB operations |
| Process Payment | 500-1000ms | Mock gateway simulation |
| Get Notifications | 100-200ms | Simple query |

If significantly slower, investigate:
- Database connection pool exhaustion
- Slow queries
- Network latency
- Resource constraints (CPU, RAM)

---

## 🚀 Next Steps

After Task 5 completion:

1. **Task 6**: Build Frontend React + Vite + TailwindCSS
   - Create user interface for all tested flows
   - Integrate with API endpoints

2. **Task 7**: Docker-Compose + .env
   - Containerize services
   - Create docker-compose.yml
   - Centralize environment variables

---

## 📞 Support

For assistance:

1. Check **E2E_TESTING_GUIDE.md** for detailed explanations
2. Review service logs: `docker-compose logs <service>`
3. Verify database: `mysql khachsan -u root`
4. Check configuration files for typos
5. Test connectivity: `curl http://localhost:8020/health`

---

## 📋 Checklist for Completion

- [ ] All 6 services running
- [ ] Database initialized with sample data
- [ ] Automated test script runs without errors
- [ ] All 14 test steps pass
- [ ] Security tests pass
- [ ] Performance acceptable
- [ ] Test report completed and saved
- [ ] Issues documented
- [ ] No critical errors remaining

**When all items checked → Task 5 COMPLETE ✓**

---

**Status**: Ready for testing  
**Last Updated**: Oct 2024  
**Maintainer**: DH13C8 Team
