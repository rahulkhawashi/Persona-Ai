#!/usr/bin/env python3
"""
Simple test to run Persona AI voice version
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the voice version directly
exec(open('persona-ai.py').read())