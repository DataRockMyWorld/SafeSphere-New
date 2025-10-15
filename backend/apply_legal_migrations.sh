#!/bin/bash

# Script to apply all legal module migrations
# This will:
# 1. Add review cycle fields to compliance obligations
# 2. Add archive fields to evidence documents
# 3. Add enhanced fields to law library
# 4. Seed 12 default categories
# 5. Seed 12 default positions  
# 6. Seed 12 Ghana HSSE laws
# 7. Fix is_archived default values

echo "========================================="
echo "Applying Legal Compliance Migrations"
echo "========================================="
echo ""

echo "Step 1: Running migrations..."
python manage.py migrate legals

echo ""
echo "Step 2: Checking migration status..."
python manage.py showmigrations legals

echo ""
echo "========================================="
echo "Migrations Complete!"
echo "========================================="
echo ""
echo "What was added:"
echo "  ✓ 12 default HSSE categories"
echo "  ✓ 12 default positions"
echo "  ✓ 12 Ghana HSSE laws"
echo "  ✓ Review cycle fields"
echo "  ✓ Evidence archive system"
echo "  ✓ Enhanced law library fields"
echo ""
echo "Next: Restart your Django server to apply changes"

