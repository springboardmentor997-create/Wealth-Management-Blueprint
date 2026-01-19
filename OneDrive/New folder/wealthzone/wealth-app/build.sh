#!/bin/bash
# Railway Build Script
# This script runs migration and seeds initial data

set -e

echo "=== Running Database Migrations ==="
cd fastapi_backend
python -m alembic upgrade head

echo "=== Creating Admin User (Optional) ==="
python scripts/create_admin_pg.py || true

echo "=== Build Complete ==="
