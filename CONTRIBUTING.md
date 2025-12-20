# Contributing to RareNet

Thank you for your interest in contributing to RareNet! This is a hackathon submission, but we welcome feedback and contributions.

## 🎯 Project Status

**Current Status:** Hackathon Submission (CyborgDB Hackathon 2025)

This project was built as a proof-of-concept for privacy-preserving rare disease diagnosis. While it's production-ready in terms of performance and security, it's primarily a demonstration of CyborgDB's capabilities.

## 📋 How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in [GitHub Issues](https://github.com/your-org/rare-net/issues)
2. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - System information (OS, Python version, Node version)

### Suggesting Enhancements

We're particularly interested in:

- **Privacy improvements:** Better privacy guarantees, new privacy techniques
- **Performance optimizations:** Faster queries, better caching
- **New rare diseases:** Expanding the disease database
- **Better UX:** Improved user interface, better error messages
- **Documentation:** Clarifications, examples, tutorials

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest

   # Frontend tests
   cd frontend
   npm test

   # Integration tests
   ./verify.sh
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `perf:` Performance improvements
   - `refactor:` Code refactoring
   - `test:` Adding tests

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe what you changed and why
   - Reference any related issues
   - Include screenshots for UI changes

## 🏗️ Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### Quick Start

```bash
# Clone your fork
git clone https://github.com/your-username/rare-net.git
cd rare-net

# Run setup
chmod +x setup.sh
./setup.sh

# Verify everything works
chmod +x verify.sh
./verify.sh
```

### Manual Setup

If the automated setup doesn't work:

```bash
# Start CyborgDB and Redis
docker-compose up -d

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# In another terminal: Frontend setup
cd frontend
npm install
npm run dev
```

## 📝 Code Style

### Python (Backend)

- **Style Guide:** PEP 8
- **Type Hints:** Required for all functions
- **Docstrings:** Required for public functions
- **Line Length:** 100 characters max

Example:
```python
def query_hospital(hospital_id: str, query_vector: List[float], 
                   top_k: int = 20) -> List[Dict]:
    """
    Query a hospital's encrypted vector index.
    
    Args:
        hospital_id: Hospital identifier (e.g., "mumbai")
        query_vector: 384-dimensional symptom embedding
        top_k: Number of results to return
        
    Returns:
        List of matching cases with scores and metadata
    """
    # Implementation
    pass
```

### TypeScript (Frontend)

- **Style Guide:** Airbnb TypeScript Style Guide
- **Components:** Functional components with hooks
- **Props:** Type all props with interfaces
- **Naming:** PascalCase for components, camelCase for functions

Example:
```typescript
interface DiagnosticInsightProps {
  insight: InsightData | null;
  isLoading: boolean;
}

export function DiagnosticInsight({ insight, isLoading }: DiagnosticInsightProps) {
  // Implementation
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
./verify.sh
```

## 📚 Documentation

When adding features, please update:

- **README.md:** If it changes setup or usage
- **ARCHITECTURE.md:** If it changes system design
- **API Documentation:** If it adds/changes endpoints
- **Code Comments:** For complex logic

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email us at: security@rarenet.example.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We'll respond within 48 hours.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md (Contributors section)
- Release notes
- Project documentation

## ❓ Questions?

- **General questions:** Open a [GitHub Discussion](https://github.com/your-org/rare-net/discussions)
- **Bug reports:** Open a [GitHub Issue](https://github.com/your-org/rare-net/issues)
- **Security issues:** Email security@rarenet.example.com

## 🎯 Priority Areas

We're especially looking for contributions in:

1. **Privacy Enhancements**
   - Implementing secure multi-party computation
   - Better differential privacy mechanisms
   - Federated learning integration

2. **Performance Optimizations**
   - Query caching strategies
   - Batch processing improvements
   - GPU acceleration for embeddings

3. **Healthcare Features**
   - More rare diseases (currently 15)
   - Better symptom validation
   - Integration with FHIR standards
   - Clinical decision support tools

4. **Developer Experience**
   - Better error messages
   - More comprehensive tests
   - Improved documentation
   - Example use cases

## 🚀 Release Process

1. Features are merged to `main` branch
2. Version bumped following [Semantic Versioning](https://semver.org/)
3. Release notes generated
4. Tagged release created
5. Docker images published

## 📞 Contact

- **Project Lead:** RareNet Team
- **Email:** contact@rarenet.example.com
- **GitHub:** [@rarenet-team](https://github.com/rarenet-team)

---

Thank you for contributing to RareNet! Together, we can help reduce the diagnostic odyssey for rare disease patients worldwide. 🏥
