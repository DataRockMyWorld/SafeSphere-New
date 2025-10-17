"""
Load testing for SafeSphere using Locust.
Tests API endpoints under various load conditions.

Run with:
    locust -f tests/load/locustfile.py --host=http://localhost:8000
    
Or headless:
    locust -f tests/load/locustfile.py --host=http://localhost:8000 \
           --users 100 --spawn-rate 10 --run-time 5m --headless
"""
from locust import HttpUser, task, between, events
import random
import json
from datetime import datetime


class SafeSphereUser(HttpUser):
    """Simulates a user interacting with SafeSphere."""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Called when a user starts. Performs login."""
        self.login()
    
    def login(self):
        """Login and store access token."""
        response = self.client.post("/api/v1/login/", json={
            "email": f"test{random.randint(1, 100)}@example.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access') or data.get('access_token')
            self.headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
        else:
            self.headers = {}
    
    @task(3)
    def view_documents(self):
        """View document list (most common operation)."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/documents/", headers=self.headers)
    
    @task(2)
    def view_single_document(self):
        """View a single document."""
        if hasattr(self, 'headers'):
            # Assume documents exist with IDs 1-100
            doc_id = random.randint(1, 100)
            self.client.get(f"/api/v1/documents/{doc_id}/", headers=self.headers)
    
    @task(2)
    def view_notifications(self):
        """View user notifications."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/notifications/", headers=self.headers)
    
    @task(1)
    def view_ppe_inventory(self):
        """View PPE inventory."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/ppe/inventory/", headers=self.headers)
    
    @task(1)
    def view_legal_register(self):
        """View legal register."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/legal/register/", headers=self.headers)
    
    @task(1)
    def search_documents(self):
        """Search documents."""
        if hasattr(self, 'headers'):
            search_terms = ['safety', 'policy', 'procedure', 'form', 'HSSE']
            term = random.choice(search_terms)
            self.client.get(f"/api/v1/documents/?search={term}", headers=self.headers)
    
    @task(1)
    def view_user_profile(self):
        """View user profile."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/user/me/", headers=self.headers)


class AuthenticationLoadTest(HttpUser):
    """Focused load test for authentication endpoints."""
    
    wait_time = between(0.5, 2)
    
    @task(5)
    def login_valid_credentials(self):
        """Test login with valid credentials."""
        self.client.post("/api/v1/login/", json={
            "email": f"test{random.randint(1, 100)}@example.com",
            "password": "testpass123"
        })
    
    @task(1)
    def login_invalid_credentials(self):
        """Test login with invalid credentials (simulates attack)."""
        self.client.post("/api/v1/login/", json={
            "email": f"test{random.randint(1, 100)}@example.com",
            "password": "wrongpassword"
        })


class DocumentWorkflowLoadTest(HttpUser):
    """Load test for document workflow operations."""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login as HSSE Manager."""
        response = self.client.post("/api/v1/login/", json={
            "email": "hsse@example.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access') or data.get('access_token')
            self.headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
    
    @task(3)
    def list_documents(self):
        """List all documents."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/documents/", headers=self.headers)
    
    @task(2)
    def filter_documents_by_status(self):
        """Filter documents by status."""
        if hasattr(self, 'headers'):
            status = random.choice(['DRAFT', 'APPROVED', 'HSSE_REVIEW', 'OPS_REVIEW'])
            self.client.get(f"/api/v1/documents/?status={status}", headers=self.headers)
    
    @task(1)
    def create_document(self):
        """Create a new document."""
        if hasattr(self, 'headers'):
            self.client.post("/api/v1/documents/", json={
                "title": f"Test Document {datetime.now().timestamp()}",
                "description": "Load test document",
                "document_type": "POLICY",
                "category": "Safety"
            }, headers=self.headers)


class PPEInventoryLoadTest(HttpUser):
    """Load test for PPE inventory operations."""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login."""
        response = self.client.post("/api/v1/login/", json={
            "email": "test@example.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access') or data.get('access_token')
            self.headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
    
    @task(5)
    def view_inventory(self):
        """View PPE inventory."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/ppe/inventory/", headers=self.headers)
    
    @task(3)
    def view_ppe_issues(self):
        """View PPE issues."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/ppe/issues/", headers=self.headers)
    
    @task(2)
    def view_ppe_requests(self):
        """View PPE requests."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/ppe/requests/", headers=self.headers)
    
    @task(1)
    def create_ppe_request(self):
        """Create a PPE request."""
        if hasattr(self, 'headers'):
            self.client.post("/api/v1/ppe/requests/", json={
                "ppe_category": random.randint(1, 10),
                "quantity": 1,
                "reason": "Need replacement",
                "urgency": random.choice(['LOW', 'MEDIUM', 'HIGH'])
            }, headers=self.headers)


class StressTest(HttpUser):
    """Aggressive stress test to find breaking points."""
    
    wait_time = between(0.1, 0.5)  # Very short wait times
    
    def on_start(self):
        """Login."""
        response = self.client.post("/api/v1/login/", json={
            "email": f"stress{random.randint(1, 1000)}@example.com",
            "password": "testpass123"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get('access') or data.get('access_token')
            self.headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
    
    @task
    def rapid_document_access(self):
        """Rapidly access documents."""
        if hasattr(self, 'headers'):
            doc_id = random.randint(1, 1000)
            self.client.get(f"/api/v1/documents/{doc_id}/", headers=self.headers)
    
    @task
    def rapid_inventory_checks(self):
        """Rapidly check inventory."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/ppe/inventory/", headers=self.headers)
    
    @task
    def rapid_notifications(self):
        """Rapidly check notifications."""
        if hasattr(self, 'headers'):
            self.client.get("/api/v1/notifications/", headers=self.headers)


# Event listeners for reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Called when test starts."""
    print("=" * 80)
    print("SafeSphere Load Test Starting")
    print(f"Target host: {environment.host}")
    print("=" * 80)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Called when test stops."""
    print("=" * 80)
    print("SafeSphere Load Test Complete")
    print("=" * 80)
    
    # Print summary statistics
    stats = environment.stats
    print(f"\nTotal requests: {stats.total.num_requests}")
    print(f"Total failures: {stats.total.num_failures}")
    print(f"Average response time: {stats.total.avg_response_time:.2f}ms")
    print(f"Min response time: {stats.total.min_response_time:.2f}ms")
    print(f"Max response time: {stats.total.max_response_time:.2f}ms")
    print(f"Requests per second: {stats.total.total_rps:.2f}")
    
    if stats.total.num_failures > 0:
        print(f"\n⚠️  WARNING: {stats.total.num_failures} failures detected!")
        print("Review the detailed report for more information.")
    else:
        print("\n✅ All requests successful!")

