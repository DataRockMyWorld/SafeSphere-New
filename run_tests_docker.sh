#!/bin/bash

# SafeSphere Docker Test Runner
# Run tests inside Docker containers

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Build test containers
build_containers() {
    print_header "Building Test Containers"
    docker compose -f docker-compose.test.yml build
    print_success "Containers built"
}

# Run unit tests
run_unit_tests() {
    print_header "Running Unit Tests"
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        while ! nc -z db_test 5432; do sleep 1; done &&
        python manage.py migrate --noinput &&
        pytest -m 'unit or not integration' \
               --cov=. \
               --cov-report=term-missing \
               --cov-report=html \
               -v
    "
    print_success "Unit tests completed"
}

# Run integration tests
run_integration_tests() {
    print_header "Running Integration Tests"
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        while ! nc -z db_test 5432; do sleep 1; done &&
        python manage.py migrate --noinput &&
        pytest -m 'integration' -v
    "
    print_success "Integration tests completed"
}

# Run all tests
run_all_tests() {
    print_header "Running All Tests"
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        while ! nc -z db_test 5432; do sleep 1; done &&
        python manage.py migrate --noinput &&
        pytest -v \
               --cov=. \
               --cov-report=term-missing \
               --cov-report=html
    "
    print_success "All tests completed"
}

# Run fast tests only
run_fast_tests() {
    print_header "Running Fast Tests"
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        echo 'Waiting for database...' &&
        while ! nc -z db_test 5432; do sleep 1; done &&
        echo 'Database is ready!' &&
        python manage.py migrate --noinput &&
        pytest -m 'not slow' -v --cov=. --cov-report=html --cov-report=term-missing
    "
    print_success "Fast tests completed"
}

# Run security tests
run_security_tests() {
    print_header "Running Security Tests"
    
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        echo 'Running Bandit security scan...' &&
        bandit -r . -ll -x tests/,venv/,htmlcov/ || true &&
        echo 'Running Safety dependency check...' &&
        safety check --json || true &&
        echo 'Running pytest security tests...' &&
        pytest -m 'security' -v
    "
    
    print_success "Security tests completed"
}

# Check coverage
check_coverage() {
    print_header "Checking Code Coverage"
    
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        while ! nc -z db_test 5432; do sleep 1; done &&
        python manage.py migrate --noinput &&
        pytest --cov=. \
               --cov-report=term-missing \
               --cov-report=html \
               --cov-fail-under=70 \
               -q
    "
    
    print_success "Coverage check completed"
    print_warning "Coverage report available at: backend/htmlcov/index.html"
}

# Run linters
run_linters() {
    print_header "Running Code Linters"
    
    docker compose -f docker-compose.test.yml run --rm backend_test bash -c "
        echo 'Running flake8...' &&
        flake8 . --exclude=venv,migrations,htmlcov --max-line-length=120 || true &&
        echo 'Running black (check mode)...' &&
        black --check --exclude=venv . || true &&
        echo 'Running isort (check mode)...' &&
        isort --check-only --skip venv --skip migrations . || true
    "
    
    print_success "Linting completed"
}

# Run specific test file
run_specific_test() {
    if [ -z "$2" ]; then
        print_error "Please specify a test file"
        echo "Usage: ./run_tests_docker.sh test <path/to/test_file.py>"
        exit 1
    fi
    
    print_header "Running Specific Test: $2"
    docker compose -f docker-compose.test.yml run --rm backend_test \
        pytest "$2" -v
    print_success "Test completed"
}

# Enter test container shell
enter_shell() {
    print_header "Entering Test Container Shell"
    docker compose -f docker-compose.test.yml run --rm backend_test bash
}

# View coverage report
view_coverage() {
    print_header "Opening Coverage Report"
    
    # Check if coverage report exists
    if [ -f "backend/htmlcov/index.html" ]; then
        if command -v open &> /dev/null; then
            open backend/htmlcov/index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open backend/htmlcov/index.html
        else
            print_warning "Please open backend/htmlcov/index.html in your browser"
        fi
        print_success "Coverage report opened"
    else
        print_error "Coverage report not found. Run tests first: ./run_tests_docker.sh coverage"
        exit 1
    fi
}

# Clean up
cleanup() {
    print_header "Cleaning Up Test Containers and Volumes"
    
    docker compose -f docker-compose.test.yml down -v
    rm -rf backend/htmlcov/
    rm -rf backend/.pytest_cache/
    rm -f backend/.coverage
    find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find backend -type f -name "*.pyc" -delete
    
    print_success "Cleanup completed"
}

# Install dependencies (updates Dockerfile)
install_deps() {
    print_header "Installing Test Dependencies"
    print_warning "Test dependencies are installed in Dockerfile"
    print_warning "If you added new dependencies to requirements-test.txt, rebuild containers:"
    echo "  ./run_tests_docker.sh build"
}

# Main execution
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            build_containers
            ;;
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        all)
            run_all_tests
            ;;
        fast)
            run_fast_tests
            ;;
        security)
            run_security_tests
            ;;
        coverage)
            check_coverage
            ;;
        lint)
            run_linters
            ;;
        test)
            run_specific_test "$@"
            ;;
        shell)
            enter_shell
            ;;
        view)
            view_coverage
            ;;
        cleanup)
            cleanup
            ;;
        ci)
            # CI/CD pipeline
            print_header "Running CI/CD Test Suite"
            build_containers
            run_fast_tests
            check_coverage
            run_linters
            print_success "CI/CD tests completed"
            ;;
        full)
            # Full test suite
            print_header "Running Full Test Suite"
            build_containers
            run_linters
            run_all_tests
            run_security_tests
            check_coverage
            print_success "Full test suite completed"
            ;;
        install)
            install_deps
            ;;
        help|*)
            echo "SafeSphere Docker Test Runner"
            echo ""
            echo "Usage: ./run_tests_docker.sh [command]"
            echo ""
            echo "Commands:"
            echo "  build        Build test containers"
            echo "  unit         Run unit tests only"
            echo "  integration  Run integration tests only"
            echo "  all          Run all tests"
            echo "  fast         Run fast tests only (exclude slow)"
            echo "  security     Run security tests and scans"
            echo "  coverage     Check code coverage"
            echo "  lint         Run code linters"
            echo "  test <file>  Run specific test file"
            echo "  shell        Enter test container shell"
            echo "  view         View coverage report in browser"
            echo "  cleanup      Clean up containers and test artifacts"
            echo "  ci           Run CI/CD test suite (build + fast + coverage + lint)"
            echo "  full         Run full test suite (build + all + security + lint)"
            echo "  install      Show info about installing dependencies"
            echo ""
            echo "Examples:"
            echo "  ./run_tests_docker.sh build              # Build containers first"
            echo "  ./run_tests_docker.sh fast               # Run fast tests"
            echo "  ./run_tests_docker.sh coverage           # Check coverage"
            echo "  ./run_tests_docker.sh view               # View coverage report"
            echo "  ./run_tests_docker.sh test accounts/test_models.py  # Run specific test"
            echo "  ./run_tests_docker.sh shell              # Enter container for debugging"
            echo "  ./run_tests_docker.sh ci                 # Run CI pipeline"
            echo ""
            echo "First time setup:"
            echo "  1. ./run_tests_docker.sh build           # Build containers"
            echo "  2. ./run_tests_docker.sh fast            # Run tests"
            echo "  3. ./run_tests_docker.sh view            # View results"
            ;;
    esac
}

# Run main
main "$@"

