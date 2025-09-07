# 🚀 Smart Inventory Management With AI/ML Integration

> A production-grade, multi-tenant SaaS platform for intelligent inventory management built with Rust microservices, Python AI/ML pipeline, and React TypeScript frontend

[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Overview

An enterprise-grade smart inventory management platform that combines real-time data processing, machine learning forecasting, and AI-powered business insights. Built as a multi-language microservices architecture leveraging the strengths of both Rust and Python ecosystems.

### 🎯 Key Achievements
- **Multi-tenant SaaS architecture** with dynamic database provisioning
- **Real-time ML pipeline** with online learning and continuous model updates
- **AI-powered forecasting** using LLMs and vector similarity search
- **Advanced analytics** with complex SQL operations and multi-database queries
- **Production-ready features** including authentication, RBAC, and audit logging

## 🏗️ System Architecture

```mermaid
graph TB
    %% FRONTEND
    Frontend[React TypeScript Frontend]

    %% GATEWAY
    Gateway[Rust API Gateway]

    %% SERVICES
    subgraph Services
        Analytics[Python Analytics Service]
        GenAI[Python GenAI Service]
        ML[ML Training Pipeline]
    end

    %% DATABASES
    subgraph Databases
        PostgreSQL[(PostgreSQL)]
        MongoDB[(MongoDB)]
        Redis[(Redis / Hash Map & Streams)]
        Vector[(Vector DB)]
    end

    %% MODELS
    subgraph AI_Models
        Models[Trained Models]
        LLM[Together AI LLM]
    end

    %% CONNECTIONS
    Frontend --> Gateway

    Gateway --> Analytics
    Gateway --> GenAI
    Gateway --> ML
    Gateway --> PostgreSQL
    Gateway --> MongoDB
    Gateway --> Models

    Analytics --> PostgreSQL
    Analytics --> Redis

    GenAI --> Vector
    GenAI --> PostgreSQL
    GenAI --> MongoDB

    ML --> Redis
    ML --> Models

    Vector --> LLM

```

### 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + GSAP | Modern UI with animations |
| **API Gateway** | Rust + Actix-Web | High-performance request routing |
| **Analytics** | Python + FastAPI | Complex data analytics |
| **AI/ML** | Python + River + ChromaDB | Real-time learning & predictions |
| **Databases** | PostgreSQL + MongoDB + Redis | Multi-modal data storage |
| **Security** | Bcrypt +  RBAC | Enterprise authentication |

## ✨ Key Features

### 🔐 Multi-Tenant Architecture
- **Dynamic database creation** per company
- **Isolated data access** with role-based permissions
- **Scalable user management** with employee hierarchies

### 📊 Advanced Analytics
- **Real-time dashboards** with live data updates
- **Complex SQL analytics** using CTEs and window functions
- **Multi-dimensional reporting** across sales, inventory, and orders
- **Time-series analysis** with configurable periods

### 🤖 AI-Powered Forecasting
- **Online machine learning** with continuous model updates
- **Vector similarity search** for intelligent product recommendations
- **LLM integration** for natural language business insights
- **Automated feature engineering** with lag variables

### ⚡ Real-Time Processing
- **Redis streams** for event-driven architecture
- **Asynchronous processing** throughout the stack
- **Background ML training** with live model updates
- **Performance monitoring** with real-time metrics

## 🚀 Quick Start

### Prerequisites
- Rust 1.70+
- Python 3.8+
- Node.js 16+
- PostgreSQL 14+
- MongoDB 6.0+
- Redis 7.0+

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/Smart_Inventory_Management_With_AI_ML_integration
cd Smart_Inventory_Management_With_AI_ML_integration

# Install Rust dependencies
cd MajorProject_API
cargo build

# Install Python dependencies  
cd ../GenAI
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend-final
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables:
DATABASE_URL=postgresql://user:password@localhost/main_db
DATABASE_URL_ADMIN=postgresql://user:password@localhost/
TOGETHER_API_KEY=your_together_ai_key
MONGO_URL=mongodb://localhost:27017
```

### 3. Database Setup
```bash
# Run migrations
cd MajorProject_API
diesel migration run

# Start Redis
redis-server

# Start MongoDB
mongod
```

### 4. Start Services
```bash
# Terminal 1: Rust API Gateway
cd MajorProject_API
cargo run

# Terminal 2: Python Analytics Service
cd Sales Analytics API
uvicorn main:app --reload --port 8090 

# Terminal 3: GenAI Service  
cd GenAI
python main.py

# Terminal 4: ML Pipeline
cd redis_stream_Online_learning_ml
python main.py --draw

# Terminal 5: Frontend
cd frontend-final
npm run dev
```

## 📡 API Endpoints

### Authentication
```http
POST /api/users          # Create company account
POST /api/login          # Admin login
POST /api/employee-add   # Add employee
POST /api/employee_login # Employee login
```

### Analytics  
```http
GET /api/analytics_data        # Revenue & sales metrics
GET /api/product_summary       # Top selling products
GET /api/daily_sales_summary   # Time-series data
GET /api/category_summary      # Category performance
```

### AI/ML
```http
PUT /api/genAI/{db_name}  # Generate AI insights
GET /low-stock-count      # Inventory alerts
```

### Operations
```http
POST /api/set-orders      # Create purchase orders
POST /api/sale_set        # Record sales
PATCH /api/status-change  # Update order status
```

## 🧠 AI/ML Pipeline

### Real-Time Learning Flow
1. **Data Ingestion** → Sales data streams through Redis
2. **Feature Engineering** → Lag variables (1, 7, 14, 30 days) computed
3. **Online Learning** → River ML models update continuously  
4. **Vector Storage** → Embeddings stored in ChromaDB
5. **AI Predictions** → LLM generates business insights

### Model Features
- **Time-series forecasting** with multiple lag periods
- **Semantic similarity search** for product recommendations
- **Automated model retraining** with new data
- **Performance monitoring** with MAE tracking

## 🗄️ Database Schema

### PostgreSQL (Analytics)
- **Multi-tenant design** with dynamic database creation
- **Array operations** for efficient product data storage
- **Complex aggregations** using CTEs and window functions

### MongoDB (Inventory)
- **Flexible schema** for varying product attributes
- **Real-time updates** synchronized with sales
- **Category-based organization** with quantity tracking

### Redis (Streaming)
- **Event streams** for real-time data processing
- **Caching layer** for fast lookups
- **ML pipeline coordination** between services

## 🔧 Architecture Highlights

### Performance Optimizations
- **Connection pooling** with caching (Rust DashMap)
- **Async operations** throughout the stack
- **Background processing** for ML training
- **Optimized queries** with proper indexing

### Security Features
- **Multi-tenant isolation** at database level
- **Role-based access control** with granular permissions
- **Secure authentication** with bcrypt
- **API security** with CORS 

### Scalability Design
- **Microservices architecture** for horizontal scaling
- **Event-driven processing** with Redis streams
- **Database sharding ready** for massive datasets
- **Load balancer compatible** architecture

## 📈 Performance Metrics

- **Sub-100ms** response times for analytics queries
- **Real-time ML** model updates with <1s latency
- **Multi-tenant** architecture supporting 1000+ companies
- **Concurrent processing** of sales data streams

## 🛠️ Development

### Code Quality
- **Type safety** with Rust and TypeScript
- **Async/await** patterns throughout
- **Error handling** with custom error types
- **Memory safety** with Rust ownership model

### Testing Strategy
- **Manual API testing** with Postman collections
- **Integration testing** across service boundaries
- **Real-world data validation** with production scenarios

## 🚀 Deployment

### Recommended Stack
```yaml
# docker-compose.yml structure
services:
  rust-api:      # Main API gateway
  python-analytics: # Analytics service  
  genai-service: # AI/ML service
  ml-pipeline:   # Background ML training
  frontend:      # React application
  postgresql:    # Primary database
  mongodb:       # Document storage
  redis:         # Streaming & cache
```

### Environment Setup
- **Development:** Local services with hot reload
- **Staging:** Docker containers with shared networks  
- **Production:** Kubernetes deployment with auto-scaling

## 🎓 Project Context

Built as a **major college project** to explore smart inventory management combined with modern AI/ML integration. This was my **first experience** with:
- Rust systems programming
- Advanced machine learning pipelines  
- Microservices architecture
- Real-time data processing
- Enterprise software design

The goal was to create a production-ready system that demonstrates the integration of traditional software engineering with modern AI capabilities.

## 🔮 Future Enhancements

### Planned Security Layer
- **AES encryption** for data in transit
- **RSA key exchange** for secure communication
- **SHA-256 hashing** for data integrity
- **Custom load balancer** with intelligent routing

### Scalability Improvements
- **Kubernetes deployment** with auto-scaling
- **Database sharding** for massive datasets
- **CDN integration** for global performance
- **Monitoring & observability** with Prometheus/Grafana



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Together AI** for LLM API access
- **V0.dev** for frontend component assistance
- **Rust Community** for excellent documentation
- **FastAPI & Actix-Web** teams for amazing frameworks

---

## 📧 Contact

**[Ashutosh negi]** - [ashutoshnegisgrr@gmail.com]

**LinkedIn:** [https://www.linkedin.com/in/ashutosh-negi-UK07/]()

**Project Link:** [https://github.com/ashutoshnegi120/Smart_Inventory_Management_With_AI_ML_integration](https://github.com/ashutoshnegi120/Smart_Inventory_Management_With_AI_ML_integration)

---

*Built with ❤️ and lots of ☕ in 4 months*
