# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Wealth Management & Goal Tracker System to production environments.

---

## 📋 Prerequisites

### System Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or Windows Server 2019+

### Software Requirements
- **Python 3.11+**
- **Node.js 18+**
- **Nginx** (recommended)
- **SSL Certificate** (required for production)
- **Domain Name** (recommended)

---

## 🐳 Docker Deployment (Recommended)

### 1. Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: wealth-backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=sqlite:///./production.db
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - CORS_ORIGINS=${FRONTEND_URL}
    volumes:
      - ./data:/app/data
    networks:
      - wealth-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: wealth-frontend
    restart: unless-stopped
    environment:
      - VITE_API_URL=${BACKEND_URL}
    networks:
      - wealth-network
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: wealth-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./data/logs/nginx:/var/log/nginx
    networks:
      - wealth-network
    depends_on:
      - frontend
      - backend

networks:
  wealth-network:
    driver: bridge

volumes:
  wealth-data:
    driver: local
```

### 2. Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Create Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss 
               application/json application/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Upstream servers
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin $http_origin;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            add_header Access-Control-Allow-Credentials true;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=auth burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://backend/api/health;
        }
    }
}
```

### 5. Environment Configuration

Create `.env`:

```bash
# Security
SECRET_KEY=your-super-secure-secret-key-32-chars-long
ENVIRONMENT=production

# URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com/api

# Database (if using MySQL/PostgreSQL)
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/wealth_management

# External APIs (optional)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
YAHOO_FINANCE_ENABLED=true

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO
```

### 6. Deploy with Docker

```bash
# Create necessary directories
mkdir -p data/logs/nginx nginx/ssl

# Copy SSL certificates to nginx/ssl/
cp cert.pem nginx/ssl/
cp key.pem nginx/ssl/

# Set permissions
chmod 600 nginx/ssl/key.pem

# Deploy
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🖥️ Traditional Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs nginx certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash wealthapp
sudo usermod -aG sudo wealthapp
```

### 2. Backend Deployment

```bash
# Switch to application user
sudo su - wealthapp

# Clone repository
git clone <repository-url> wealth-management
cd wealth-management/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production database
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Create admin user
python create_admin.py

# Create systemd service
sudo tee /etc/systemd/system/wealth-backend.service > /dev/null <<EOF
[Unit]
Description=Wealth Management Backend
After=network.target

[Service]
Type=exec
User=wealthapp
Group=wealthapp
WorkingDirectory=/home/wealthapp/wealth-management/backend
Environment=PATH=/home/wealthapp/wealth-management/backend/venv/bin
Environment=SECRET_KEY=your-secret-key
Environment=ENVIRONMENT=production
ExecStart=/home/wealthapp/wealth-management/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start and enable service
sudo systemctl daemon-reload
sudo systemctl enable wealth-backend
sudo systemctl start wealth-backend
```

### 3. Frontend Deployment

```bash
# Navigate to frontend directory
cd ~/wealth-management/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy to nginx directory
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo tee /etc/nginx/sites-available/wealth-management > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/wealth-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ☸️ Kubernetes Deployment

### 1. Create Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wealth-management
```

### 2. Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wealth-backend
  namespace: wealth-management
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wealth-backend
  template:
    metadata:
      labels:
        app: wealth-backend
    spec:
      containers:
      - name: backend
        image: wealth-management/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: wealth-secrets
              key: secret-key
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: wealth-config
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: wealth-backend-service
  namespace: wealth-management
spec:
  selector:
    app: wealth-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

### 3. Frontend Deployment

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wealth-frontend
  namespace: wealth-management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wealth-frontend
  template:
    metadata:
      labels:
        app: wealth-frontend
    spec:
      containers:
      - name: frontend
        image: wealth-management/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: wealth-frontend-service
  namespace: wealth-management
spec:
  selector:
    app: wealth-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### 4. Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wealth-ingress
  namespace: wealth-management
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: wealth-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: wealth-backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wealth-frontend-service
            port:
              number: 80
```

### 5. Secrets and ConfigMaps

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: wealth-secrets
  namespace: wealth-management
type: Opaque
data:
  secret-key: <base64-encoded-secret>
  database-password: <base64-encoded-db-password>
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: wealth-config
  namespace: wealth-management
data:
  database-url: "sqlite:///./production.db"
  environment: "production"
  cors-origins: "https://your-domain.com"
```

### 6. Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml

# Check status
kubectl get pods -n wealth-management
kubectl get services -n wealth-management
kubectl get ingress -n wealth-management

# View logs
kubectl logs -f deployment/wealth-backend -n wealth-management
```

---

## 🔧 Configuration Management

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | JWT signing secret | Yes | - |
| `ENVIRONMENT` | Deployment environment | Yes | development |
| `DATABASE_URL` | Database connection string | Yes | sqlite:///./wealth_management.db |
| `CORS_ORIGINS` | Allowed CORS origins | Yes | http://localhost:3000 |
| `ALPHA_VANTAGE_API_KEY` | Market data API key | No | - |
| `LOG_LEVEL` | Logging level | No | INFO |
| `MAX_CONNECTIONS` | Database pool size | No | 10 |
| `REDIS_URL` | Redis connection URL | No | - |

### Production Checklist

- [ ] **Security**
  - [ ] SSL/TLS certificates installed
  - [ ] Strong secret keys configured
  - [ ] Firewall rules configured
  - [ ] Rate limiting enabled
  - [ ] Security headers set

- [ ] **Performance**
  - [ ] Database indexes optimized
  - [ ] Caching configured
  - [ ] CDN enabled for static assets
  - [ ] Load balancer configured
  - [ ] Monitoring enabled

- [ ] **Reliability**
  - [ ] Health checks configured
  - [ ] Auto-restart policies set
  - [ ] Backup strategy implemented
  - [ ] Log rotation configured
  - [ ] Error tracking enabled

- [ ] **Compliance**
  - [ ] GDPR compliance checked
  - [ ] Data retention policy set
  - [ ] Audit logging enabled
  - [ ] Privacy policy updated

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

```python
# Add to backend/app/main.py
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# Metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    REQUEST_DURATION.observe(process_time)
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 2. Log Aggregation

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

### 3. Health Checks

```python
# backend/app/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # Database check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Memory check
    memory = psutil.virtual_memory()
    if memory.percent > 90:
        health_status["checks"]["memory"] = f"critical: {memory.percent}%"
        health_status["status"] = "unhealthy"
    else:
        health_status["checks"]["memory"] = f"ok: {memory.percent}%"
    
    # Disk check
    disk = psutil.disk_usage('/')
    if disk.percent > 90:
        health_status["checks"]["disk"] = f"critical: {disk.percent}%"
        health_status["status"] = "unhealthy"
    else:
        health_status["checks"]["disk"] = f"ok: {disk.percent}%"
    
    return health_status
```

---

## 🔒 Security Hardening

### 1. Network Security

```bash
# Firewall configuration
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8000/tcp  # Block direct backend access
```

### 2. Application Security

```python
# backend/app/security.py
from fastapi import HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Input validation
def validate_email(email: str):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

# SQL injection prevention
def safe_query(db: Session, query: str, params: dict = None):
    """Execute safe parameterized queries"""
    return db.execute(query, params or {})
```

### 3. SSL Configuration

```nginx
# Enhanced SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python -m pytest tests/
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm install
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: |
        docker build -t wealth-management/backend:${{ github.sha }} ./backend
        docker build -t wealth-management/frontend:${{ github.sha }} ./frontend
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push wealth-management/backend:${{ github.sha }}
        docker push wealth-management/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: |
        # SSH into server and deploy
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          cd /opt/wealth-management &&
          docker-compose pull &&
          docker-compose up -d &&
          docker system prune -f
        "
```

---

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_transactions_investment_id ON transactions(investment_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

### 2. Caching Strategy

```python
# backend/app/cache.py
from functools import wraps
import redis
import json

redis_client = redis.Redis(host='redis', port=6379, db=0)

def cache_result(expire_time=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expire_time, json.dumps(result))
            
            return result
        return wrapper
    return decorator

# Usage
@cache_result(expire_time=600)
async def get_user_portfolio(user_id: int):
    # Expensive database query
    pass
```

### 3. Frontend Optimization

```javascript
// frontend/src/utils/lazyLoad.js
export const lazyLoad = (importFunc) => {
  return React.lazy(importFunc);
};

// Usage in components
const LazyDashboard = lazyLoad(() => import('./pages/Dashboard'));

// Bundle splitting
const AdminRoutes = lazyLoad(() => import('./routes/AdminRoutes'));
const UserRoutes = lazyLoad(() => import('./routes/UserRoutes'));
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
docker-compose exec backend python -c "from app.database import engine; engine.execute('SELECT 1')"

# Reset database
docker-compose exec backend python -c "from app.database import engine; from app.models import Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
```

#### 2. SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew
```

#### 3. Performance Issues
```bash
# Check system resources
docker stats
htop
iotop

# Check logs
docker-compose logs -f backend
sudo journalctl -u wealth-backend -f
```

#### 4. Memory Leaks
```python
# Add memory monitoring
import tracemalloc

tracemalloc.start()

# In your API endpoint
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')
for stat in top_stats[:10]:
    print(stat)
```

---

## 📞 Support & Maintenance

### Maintenance Tasks

#### Daily
- [ ] Check application logs
- [ ] Monitor system resources
- [ ] Verify backup completion

#### Weekly
- [ ] Update security patches
- [ ] Review performance metrics
- [ ] Check SSL certificate expiration

#### Monthly
- [ ] Database maintenance
- [ ] Log rotation
- [ ] Security audit

#### Quarterly
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] Disaster recovery testing

### Emergency Procedures

#### Application Down
1. Check service status: `systemctl status wealth-backend`
2. Review logs: `journalctl -u wealth-backend -f`
3. Restart service: `systemctl restart wealth-backend`
4. If needed, rollback to previous version

#### Database Issues
1. Check database connectivity
2. Verify disk space
3. Check database logs
4. Restore from backup if needed

#### Security Incident
1. Immediately block suspicious IPs
2. Review access logs
3. Change all secrets/keys
4. Notify security team
5. Document incident

---

## 📚 Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Complete Project Summary](./COMPLETE_PROJECT_SUMMARY.md)

### Tools & Services
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack
- **Security**: Fail2ban, ClamAV
- **Backup**: Automated snapshots
- **CI/CD**: GitHub Actions, GitLab CI

### Support Channels
- **Technical Support**: support@your-domain.com
- **Emergency**: emergency@your-domain.com
- **Documentation**: docs.your-domain.com

---

## 🎯 Conclusion

This deployment guide provides comprehensive instructions for deploying the Wealth Management & Goal Tracker System in various environments. Choose the deployment method that best fits your infrastructure and requirements.

**Recommended for production:**
- Docker Compose for small to medium deployments
- Kubernetes for large-scale deployments
- Traditional deployment for simple setups

**Key success factors:**
- Proper security configuration
- Regular monitoring and maintenance
- Automated backups and recovery procedures
- Performance optimization
- Comprehensive logging and alerting

The system is designed to be scalable, secure, and maintainable in production environments.
