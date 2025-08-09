# SafeSphere - Safety Management System

A comprehensive safety management system built with Django backend and React frontend.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SafeSphere-New
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production Deployment

See [Production Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
SafeSphere-New/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── api/               # API endpoints
│   ├── documents/         # Document management
│   ├── legals/            # Legal compliance
│   ├── ppes/              # PPE management
│   └── core/              # Core settings
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── scripts/               # Deployment and utility scripts
├── docs/                  # Documentation
└── nginx/                 # Nginx configuration
```

## 🛠️ Available Scripts

### Production Scripts
- `scripts/production/setup-ssl.sh` - SSL certificate setup
- `scripts/production/fix-cors-syntax.sh` - CORS configuration fix
- `scripts/production/fix-ssl-final.sh` - SSL certificate fix

### Deployment Scripts
- `scripts/deployment/deploy.sh` - Main deployment script

### Admin Scripts
- `scripts/admin/create-admin-simple.sh` - Create admin user

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:
- Database settings
- Email settings
- CORS settings
- SSL settings

### Frontend Configuration
Update `frontend/src/utils/axiosInstance.ts` with your backend URL.

## 📚 Documentation

- [Production Deployment](docs/deployment/PRODUCTION_DEPLOYMENT.md)
- [Authentication Workflow](docs/development/AUTHENTICATION_WORKFLOW.md)
- [Domain Setup](docs/deployment/DOMAIN_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
