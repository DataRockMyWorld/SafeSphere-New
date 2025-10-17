# SafeSphere Docker Testing Guide

## 🐳 Testing with Docker

Since you're using Docker, all tests run inside containers. No virtual environment needed!

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Make sure Docker is running
docker --version

# 2. Build test containers
./run_tests_docker.sh build

# 3. Run tests
./run_tests_docker.sh fast

# 4. View coverage report
./run_tests_docker.sh view
```

---

## 📋 Available Commands

### Basic Commands

```bash
# Build test containers (run this first)
./run_tests_docker.sh build

# Run all tests
./run_tests_docker.sh all

# Run unit tests only
./run_tests_docker.sh unit

# Run integration tests only
./run_tests_docker.sh integration

# Run fast tests (exclude slow tests)
./run_tests_docker.sh fast
```

### Coverage Commands

```bash
# Check code coverage
./run_tests_docker.sh coverage

# View coverage report in browser
./run_tests_docker.sh view
```

### Quality Commands

```bash
# Run linters (flake8, black, isort)
./run_tests_docker.sh lint

# Run security tests
./run_tests_docker.sh security
```

### Utility Commands

```bash
# Run specific test file
./run_tests_docker.sh test accounts/test_models.py

# Enter test container shell (for debugging)
./run_tests_docker.sh shell

# Clean up containers and artifacts
./run_tests_docker.sh cleanup
```

### CI/CD Commands

```bash
# Run CI pipeline (build + fast tests + coverage + lint)
./run_tests_docker.sh ci

# Run full test suite (everything)
./run_tests_docker.sh full
```

---

## 🏗️ Architecture

### Docker Compose Setup

The test environment includes:

- **db_test**: PostgreSQL 15 database for testing
- **redis_test**: Redis for caching and Celery
- **backend_test**: Django app with all test dependencies

### Test Containers vs Production Containers

| Feature | Production | Testing |
|---------|-----------|---------|
| Dockerfile | `backend/Dockerfile` | `backend/Dockerfile.test` |
| Compose file | `docker-compose.yml` | `docker-compose.test.yml` |
| Database | Port 5432 | Port 5433 |
| Redis | Port 6379 | Port 6380 |
| Dependencies | `requirements.txt` | `requirements.txt` + `requirements-test.txt` |

---

## 📊 Test Workflow

### Daily Development

```bash
# Morning sanity check
./run_tests_docker.sh fast

# Test specific module while coding
./run_tests_docker.sh test accounts/test_models.py

# Before committing
./run_tests_docker.sh ci
```

### Before Deployment

```bash
# Run full test suite
./run_tests_docker.sh full

# Check coverage
./run_tests_docker.sh coverage
./run_tests_docker.sh view
```

---

## 🔧 Debugging Failed Tests

### View Test Output

```bash
# Run with verbose output
./run_tests_docker.sh fast
```

### Enter Container for Debugging

```bash
# Enter test container shell
./run_tests_docker.sh shell

# Inside container, you can:
pytest accounts/test_models.py -vv -s  # Very verbose with print statements
pytest --pdb                            # Drop into debugger on failure
pytest -k "test_user_login"            # Run specific test by name
python manage.py shell                 # Django shell
```

### View Logs

```bash
# View test container logs
docker-compose -f docker-compose.test.yml logs backend_test

# Follow logs in real-time
docker-compose -f docker-compose.test.yml logs -f backend_test
```

---

## 🐛 Common Issues & Solutions

### Issue: "Docker is not running"

**Solution**: Start Docker Desktop

```bash
# macOS/Windows: Open Docker Desktop
# Linux: sudo systemctl start docker
```

### Issue: "Port already in use"

**Solution**: Stop conflicting containers

```bash
# Stop all SafeSphere containers
docker-compose down
docker-compose -f docker-compose.test.yml down

# Or use different ports in docker-compose.test.yml
```

### Issue: Tests fail with "Database connection error"

**Solution**: Wait for database to be ready

```bash
# The test script waits automatically, but if you run manually:
docker-compose -f docker-compose.test.yml up -d db_test
sleep 10  # Wait for database
./run_tests_docker.sh fast
```

### Issue: "Permission denied" on test script

**Solution**: Make script executable

```bash
chmod +x run_tests_docker.sh
```

### Issue: Changes not reflected in tests

**Solution**: Rebuild containers

```bash
./run_tests_docker.sh build
```

### Issue: Tests are slow

**Solution**: Run in parallel (inside container)

```bash
./run_tests_docker.sh shell

# Inside container:
pytest -n auto  # Auto-detect CPU cores
pytest -n 4     # Use 4 workers
```

---

## 📦 Adding New Test Dependencies

### Step 1: Add to requirements-test.txt

```bash
# Edit backend/requirements-test.txt
echo "new-test-package==1.0.0" >> backend/requirements-test.txt
```

### Step 2: Rebuild containers

```bash
./run_tests_docker.sh build
```

### Step 3: Verify installation

```bash
./run_tests_docker.sh shell

# Inside container:
pip list | grep new-test-package
```

---

## 🔍 Inspecting Test Results

### Coverage Report

```bash
# Generate and view coverage
./run_tests_docker.sh coverage
./run_tests_docker.sh view

# Report is at: backend/htmlcov/index.html
```

### Test Results

```bash
# Tests output to terminal by default
./run_tests_docker.sh all

# For CI/CD, you can also generate JUnit XML
docker-compose -f docker-compose.test.yml run --rm backend_test \
    pytest --junitxml=reports/junit.xml
```

---

## 🚀 CI/CD Integration

### GitHub Actions (Already Configured)

The `.github/workflows/tests.yml` file runs tests automatically on:
- Push to main/develop
- Pull requests
- Daily schedule (2 AM UTC)

### Running Locally Like CI

```bash
# Run exactly what CI runs
./run_tests_docker.sh ci
```

### Manual CI Commands

```bash
# Build
docker-compose -f docker-compose.test.yml build

# Run tests
docker-compose -f docker-compose.test.yml run --rm backend_test \
    pytest -m "not slow" --cov=. --cov-report=xml --cov-fail-under=70

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

---

## 🎯 Performance Optimization

### Faster Test Runs

```bash
# 1. Run only fast tests
./run_tests_docker.sh fast

# 2. Run tests in parallel (inside container)
./run_tests_docker.sh shell
pytest -n auto

# 3. Run only failed tests
./run_tests_docker.sh shell
pytest --lf  # Last failed
pytest --ff  # Failed first
```

### Smaller Container Images

The `Dockerfile.test` is optimized for testing:
- Uses `python:3.11-slim` (smaller base)
- Cleans up apt cache
- Uses `--no-cache-dir` for pip
- Multi-stage builds possible for even smaller images

---

## 📊 Test Metrics

### Check Current Coverage

```bash
./run_tests_docker.sh coverage
```

### Coverage Targets

| Module | Target |
|--------|--------|
| accounts | 90% |
| documents | 85% |
| ppes | 85% |
| legals | 80% |
| **Overall** | **85%** |

---

## 🔐 Security Testing

### Run Security Scans

```bash
./run_tests_docker.sh security
```

This runs:
1. **Bandit**: Python security scanner
2. **Safety**: Vulnerable dependency checker
3. **Pytest security tests**: SQL injection, XSS, etc.

### Manual Security Commands

```bash
./run_tests_docker.sh shell

# Inside container:
bandit -r . -ll                    # Security scan
safety check                       # Dependency vulnerabilities
pytest -m security                 # Security tests
```

---

## 📝 Writing Tests in Docker Environment

### Use Test Factories

```python
# In your test file
from accounts.factories import UserFactory
from documents.factories import DocumentFactory

def test_my_feature():
    user = UserFactory()
    document = DocumentFactory(created_by=user)
    # Your test here
```

### Test Database

Tests automatically use a separate test database:
- **Production DB**: `safesphere` on port 5432
- **Test DB**: `safesphere_test` on port 5433

Data is automatically cleaned between tests.

### Environment Variables

Test environment has these set:
- `DJANGO_SETTINGS_MODULE=core.settings`
- `DEBUG=True`
- `DATABASE_URL=postgresql://...db_test.../safesphere_test`
- `ACCOUNT_LOCKOUT_ATTEMPTS=3`
- `ACCOUNT_LOCKOUT_DURATION=30`

---

## 🎓 Best Practices

### 1. Always Build Before Running

```bash
# After pulling changes or updating dependencies
./run_tests_docker.sh build
./run_tests_docker.sh fast
```

### 2. Clean Up Regularly

```bash
# Clean up test artifacts and containers
./run_tests_docker.sh cleanup

# Full Docker cleanup (careful!)
docker system prune -a
```

### 3. Use Fast Tests for Development

```bash
# During development
./run_tests_docker.sh fast

# Before committing
./run_tests_docker.sh ci

# Before deploying
./run_tests_docker.sh full
```

### 4. Check Coverage

```bash
# Always check what's not tested
./run_tests_docker.sh coverage
./run_tests_docker.sh view
```

### 5. Debug with Container Shell

```bash
# When tests fail
./run_tests_docker.sh shell

# Debug specific test
pytest accounts/test_models.py::UserModelTests::test_create_user -vv -s --pdb
```

---

## 🆘 Getting Help

### View Available Commands

```bash
./run_tests_docker.sh help
```

### Documentation

- **This file**: Docker testing guide
- `TESTING_QUICKSTART.md`: General testing guide
- `STRESS_TESTING_STRATEGY.md`: Comprehensive strategy
- `TESTING_CHECKLIST.md`: Quick reference

### Debugging Commands

```bash
# Check Docker status
docker info
docker ps
docker-compose -f docker-compose.test.yml ps

# Check container logs
docker-compose -f docker-compose.test.yml logs backend_test

# Inspect container
docker-compose -f docker-compose.test.yml exec backend_test bash

# Check database
docker-compose -f docker-compose.test.yml exec db_test psql -U postgres -d safesphere_test
```

---

## 📋 Complete Example Workflow

### First Time Setup

```bash
# 1. Clone repository (already done)

# 2. Build test containers
./run_tests_docker.sh build

# 3. Run tests
./run_tests_docker.sh fast

# 4. View results
./run_tests_docker.sh view
```

### Daily Development

```bash
# Morning: Quick sanity check
./run_tests_docker.sh fast

# While coding: Test specific module
./run_tests_docker.sh test accounts/test_models.py

# Before committing
./run_tests_docker.sh ci

# If tests fail: Debug
./run_tests_docker.sh shell
pytest accounts/test_models.py -vv -s
```

### Before Deployment

```bash
# 1. Pull latest changes
git pull

# 2. Rebuild containers
./run_tests_docker.sh build

# 3. Run full test suite
./run_tests_docker.sh full

# 4. Check coverage
./run_tests_docker.sh coverage
./run_tests_docker.sh view

# 5. Security scan
./run_tests_docker.sh security

# 6. If all pass, deploy!
```

---

## 🎉 Advantages of Docker Testing

### ✅ Consistency
- Same environment for all developers
- Same environment as production
- No "works on my machine" issues

### ✅ Isolation
- Tests don't affect production database
- Clean state for each test run
- Easy cleanup

### ✅ Reproducibility
- Exact same dependencies
- Same Python version
- Same database version

### ✅ Simplicity
- No virtual environment needed
- No local PostgreSQL installation
- One command to run everything

---

## 🚀 You're Ready!

Everything is set up for Docker-based testing. Start with:

```bash
./run_tests_docker.sh build
./run_tests_docker.sh fast
./run_tests_docker.sh view
```

**Happy testing!** 🐳🧪🛡️

