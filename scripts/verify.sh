#!/bin/bash

# RareNet Quick Verification Script
# Verifies all services are running correctly

echo "========================================="
echo "  RareNet Verification Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
RESPONSE=$(curl -s http://127.0.0.1:8001/api/health)
if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ PASSED${NC} - Backend is healthy"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Backend health check failed"
    ((FAILED++))
fi
echo ""

# Test 2: Frontend Accessibility
echo "Test 2: Frontend Accessibility"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - Frontend is accessible"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - Frontend is not accessible"
    ((FAILED++))
fi
echo ""

# Test 3: CyborgDB Connection
echo "Test 3: CyborgDB Connection"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC} - CyborgDB is running"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} - CyborgDB is not accessible"
    ((FAILED++))
fi
echo ""

# Test 4: Demo User Login
echo "Test 4: Demo User Login"
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"doctor@mumbai.hospital","password":"password123"}')
if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ PASSED${NC} - Demo user login works"
    ((PASSED++))
    
    # Extract token for next test
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ FAILED${NC} - Demo user login failed"
    echo "Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi
echo ""

# Test 5: Diagnosis Query (if login worked)
if [ ! -z "$TOKEN" ]; then
    echo "Test 5: Diagnosis Query"
    DIAGNOSE_RESPONSE=$(curl -s -X POST http://127.0.0.1:8001/api/diagnose \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"symptoms":"joint hypermobility, easy bruising, stretchy skin","top_k":20}')
    
    if echo "$DIAGNOSE_RESPONSE" | grep -q "suggested_diagnosis"; then
        echo -e "${GREEN}✓ PASSED${NC} - Diagnosis query works"
        DIAGNOSIS=$(echo "$DIAGNOSE_RESPONSE" | grep -o '"suggested_diagnosis":"[^"]*' | cut -d'"' -f4)
        echo "  Diagnosis: $DIAGNOSIS"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Diagnosis query failed"
        echo "Response: $DIAGNOSE_RESPONSE"
        ((FAILED++))
    fi
else
    echo "Test 5: Diagnosis Query"
    echo -e "${YELLOW}⊘ SKIPPED${NC} - No auth token (login failed)"
fi
echo ""

# Test 6: Network Stats
echo "Test 6: Network Stats"
if [ ! -z "$TOKEN" ]; then
    STATS_RESPONSE=$(curl -s http://127.0.0.1:8001/api/stats \
        -H "Authorization: Bearer $TOKEN")
    if echo "$STATS_RESPONSE" | grep -q "total_cases"; then
        echo -e "${GREEN}✓ PASSED${NC} - Network stats accessible"
        TOTAL_CASES=$(echo "$STATS_RESPONSE" | grep -o '"total_cases":[0-9]*' | cut -d':' -f2)
        echo "  Total cases in network: $TOTAL_CASES"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Network stats failed"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIPPED${NC} - No auth token (login failed)"
fi
echo ""

# Summary
echo "========================================="
echo "  Verification Summary"
echo "========================================="
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo "System is ready for demo!"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please check the errors above and fix before demo."
    exit 1
fi
