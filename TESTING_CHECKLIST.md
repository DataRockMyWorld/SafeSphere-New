# SafeSphere Testing Checklist

## 🐳 Quick Start with Docker (5 minutes)

```bash
./run_tests_docker.sh build
./run_tests_docker.sh fast
./run_tests_docker.sh view
```

**See `DOCKER_TESTING_GUIDE.md` for complete Docker instructions.**

---

## 🚀 Quick Start without Docker (5 minutes)

```bash
cd backend
pip install -r requirements-test.txt
./run_tests.sh fast
```

---

## ✅ Pre-Commit Checklist

Before committing code, ensure:

- [ ] All tests pass: `./run_tests.sh fast`
- [ ] No linter errors: `./run_tests.sh lint`
- [ ] Coverage doesn't decrease: `./run_tests.sh coverage`
- [ ] New code has tests
- [ ] No console.log or print debug statements

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass: `./run_tests.sh full`
- [ ] CI/CD pipeline green
- [ ] Security scan clean: `./run_tests.sh security`
- [ ] Load tests pass: `./run_tests.sh load`
- [ ] Coverage ≥ 80%
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backups verified

---

## ✅ Critical Bugs to Fix

### 🔴 Must Fix NOW

- [ ] Add unique constraint to reset codes (`accounts/models.py`)
- [ ] Fix PO number race condition (`ppes/models.py`)
- [ ] Add file size validation (all file uploads)
- [ ] Add file type whitelist validation
- [ ] Make inventory updates atomic (`ppes/models.py`)
- [ ] Add default for ACCOUNT_LOCKOUT_ATTEMPTS

### 🟡 Fix This Week

- [ ] Handle email failures gracefully
- [ ] Add pagination to all list endpoints
- [ ] Fix hardcoded verification URL
- [ ] Remove password from test user response
- [ ] Optimize N+1 query issues

---

## ✅ Testing Coverage Goals

| Module | Current | Target | Status |
|--------|---------|--------|--------|
| accounts | 0% | 90% | ⚠️ TODO |
| documents | 0% | 85% | ⚠️ TODO |
| ppes | 0% | 85% | ⚠️ TODO |
| legals | 0% | 80% | ⚠️ TODO |
| api | 0% | 85% | ⚠️ TODO |
| **Overall** | **0%** | **85%** | **⚠️ TODO** |

---

## ✅ Test Commands Quick Reference

### Docker Commands (Recommended)

```bash
# Build containers (first time or after dependency changes)
./run_tests_docker.sh build

# Fast tests (for CI)
./run_tests_docker.sh fast

# All tests
./run_tests_docker.sh all

# Coverage
./run_tests_docker.sh coverage
./run_tests_docker.sh view

# Security
./run_tests_docker.sh security

# Specific test
./run_tests_docker.sh test accounts/test_models.py

# Enter container shell
./run_tests_docker.sh shell

# Lint
./run_tests_docker.sh lint

# CI pipeline
./run_tests_docker.sh ci

# Full suite
./run_tests_docker.sh full

# Cleanup
./run_tests_docker.sh cleanup
```

### Non-Docker Commands

```bash
# Install
./run_tests.sh install

# Fast tests (for CI)
./run_tests.sh fast

# All tests
./run_tests.sh all

# Coverage
./run_tests.sh coverage
open htmlcov/index.html

# Security
./run_tests.sh security

# Load tests (requires running server)
python manage.py runserver &
./run_tests.sh load

# Lint
./run_tests.sh lint

# CI pipeline
./run_tests.sh ci

# Full suite
./run_tests.sh full

# Cleanup
./run_tests.sh cleanup
```

---

## ✅ Files Created

### Test Files
- [x] `backend/accounts/test_models.py` (400+ lines)
- [x] `backend/accounts/test_api.py` (500+ lines)
- [x] `backend/documents/test_models.py` (600+ lines)
- [x] `backend/ppes/test_models.py` (700+ lines)

### Factory Files
- [x] `backend/accounts/factories.py` (100+ lines)
- [x] `backend/documents/factories.py` (150+ lines)
- [x] `backend/ppes/factories.py` (200+ lines)

### Infrastructure
- [x] `backend/pytest.ini`
- [x] `backend/requirements-test.txt`
- [x] `backend/run_tests.sh`
- [x] `backend/tests/load/locustfile.py` (300+ lines)
- [x] `.github/workflows/tests.yml`

### Documentation
- [x] `docs/STRESS_TESTING_STRATEGY.md`
- [x] `docs/TESTING_QUICKSTART.md`
- [x] `STRESS_TESTING_IMPLEMENTATION.md`
- [x] `TESTING_CHECKLIST.md` (this file)

---

## ✅ URL Configuration TODO

Check your `backend/accounts/urls.py` has these URL names:

- [ ] `login`
- [ ] `password-reset-confirm`
- [ ] `user-me`
- [ ] `notification-list`
- [ ] `notification-detail`
- [ ] `mark-all-read`
- [ ] `create-user`

If not, update test files with your actual URL names.

---

## ✅ Settings Configuration TODO

Add to `backend/core/settings.py`:

```python
# Account Security
ACCOUNT_LOCKOUT_ATTEMPTS = 3
ACCOUNT_LOCKOUT_DURATION = 30  # minutes

# File Uploads
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']
```

---

## ✅ Daily Development Workflow

### Morning
```bash
cd backend
./run_tests.sh fast  # Sanity check (2 min)
```

### While Coding
```bash
pytest path/to/module/  # Test your module
```

### Before Commit
```bash
./run_tests.sh ci  # CI pipeline (5 min)
```

### Before Push
```bash
./run_tests.sh full  # Full suite (15 min)
```

---

## ✅ When Tests Fail

### Debug Commands
```bash
# Verbose output
pytest -vv

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Run last failed
pytest --lf

# Drop into debugger
pytest --pdb

# Show why skipped
pytest -rs
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Import errors | `export PYTHONPATH="${PYTHONPATH}:$(pwd)"` |
| Database errors | Use `TransactionTestCase` |
| Tests too slow | Run in parallel: `pytest -n auto` |
| Flaky tests | Use `freezegun` for time, fix race conditions |

---

## ✅ Performance Benchmarks

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| Login API | < 500ms | ❓ | Not tested |
| Document list | < 200ms | ❓ | Not tested |
| PPE inventory | < 200ms | ❓ | Not tested |
| Search | < 1s | ❓ | Not tested |
| File upload (10MB) | < 5s | ❓ | Not tested |

---

## ✅ Load Testing Targets

| Scenario | Target | Status |
|----------|--------|--------|
| Concurrent users | 100 | ⚠️ Not tested |
| Requests/sec | 50+ | ⚠️ Not tested |
| Response time (p95) | < 500ms | ⚠️ Not tested |
| Error rate | < 1% | ⚠️ Not tested |

---

## ✅ Security Checklist

- [ ] All endpoints require authentication
- [ ] Permission checks on all sensitive operations
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] File upload validation
- [ ] Input sanitization
- [ ] No secrets in code
- [ ] Dependencies up to date (no vulnerabilities)

---

## ✅ Code Review Checklist

When reviewing PRs:

- [ ] New code has tests
- [ ] All tests pass
- [ ] Coverage doesn't decrease
- [ ] No obvious security issues
- [ ] Performance acceptable
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No TODOs in production code

---

## ✅ Monthly Maintenance

- [ ] Update dependencies
- [ ] Run security scan
- [ ] Review and update tests
- [ ] Check coverage trends
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Clean up old test data

---

## 📊 Progress Tracker

### Week 1 (Foundation)
- [x] Set up testing infrastructure
- [x] Create test factories
- [x] Write critical path tests
- [ ] Run all tests (fix failures)
- [ ] Fix critical bugs
- [ ] Achieve 40% coverage

### Week 2 (Integration)
- [ ] Complete API tests
- [ ] Add integration tests
- [ ] Test permissions
- [ ] Test file uploads
- [ ] Achieve 65% coverage

### Week 3 (Edge Cases)
- [ ] Test edge cases
- [ ] Test error conditions
- [ ] Test concurrency
- [ ] Achieve 75% coverage

### Week 4 (Security & Load)
- [ ] Security test suite
- [ ] Load testing
- [ ] Performance optimization
- [ ] Achieve 80% coverage

### Week 5 (Remaining Modules)
- [ ] Legal module tests
- [ ] Audit module tests
- [ ] Achieve 85% coverage

### Week 6 (Polish)
- [ ] Optimize tests
- [ ] Documentation
- [ ] Best practices guide
- [ ] Achieve 90% coverage

---

## 🎯 Success Metrics

### Code Quality
- ✅ Test coverage ≥ 85%
- ✅ All tests passing
- ✅ No linter errors
- ✅ No security vulnerabilities

### Performance
- ✅ API response < 200ms (p95)
- ✅ Handle 100 concurrent users
- ✅ 50+ requests/second
- ✅ Error rate < 0.1%

### Process
- ✅ CI/CD pipeline running
- ✅ Tests run before every deployment
- ✅ Team follows testing best practices
- ✅ Documentation up to date

---

## 🆘 Need Help?

### Documentation
- `docs/STRESS_TESTING_STRATEGY.md` - Full strategy
- `docs/TESTING_QUICKSTART.md` - Quick start guide
- `STRESS_TESTING_IMPLEMENTATION.md` - Implementation summary

### Test Files
- `backend/accounts/test_*.py` - Account tests
- `backend/documents/test_*.py` - Document tests  
- `backend/ppes/test_*.py` - PPE tests

### Resources
- [Pytest Docs](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Factory Boy](https://factoryboy.readthedocs.io/)
- [Locust](https://docs.locust.io/)

---

## 🎉 You're Ready!

You now have everything you need to stress test SafeSphere. 

**Start with:**
```bash
cd backend
./run_tests.sh install
./run_tests.sh fast
```

**Then fix what's broken and build from there!** 🚀

---

*Last Updated: $(date)*

