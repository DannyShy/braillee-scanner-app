import sys
import os

# Ensure Lib/site-packages is in sys.path for embedded Python on Windows
# This is required so that pip-installed packages (numpy, torch, etc.) are found
_python_home = os.path.dirname(os.path.abspath(__file__))
_site_packages = os.path.join(_python_home, 'Lib', 'site-packages')
if _site_packages not in sys.path:
    sys.path.insert(0, _site_packages)
