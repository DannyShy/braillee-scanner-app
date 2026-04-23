#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Check available Argos Translate packages"""

try:
    import argostranslate.package
    
    # Update package index
    argostranslate.package.update_package_index()
    
    # Get available packages
    available_packages = argostranslate.package.get_available_packages()
    
    print(f"Total packages available: {len(available_packages)}\n")
    
    # Find packages involving Slovak (sk) or Czech (cs)
    slovak_packages = []
    czech_packages = []
    
    for pkg in available_packages:
        if pkg.from_code == 'sk' or pkg.to_code == 'sk':
            slovak_packages.append(f"{pkg.from_code} → {pkg.to_code}: {pkg.from_name} → {pkg.to_name}")
        if pkg.from_code == 'cs' or pkg.to_code == 'cs':
            czech_packages.append(f"{pkg.from_code} → {pkg.to_code}: {pkg.from_name} → {pkg.to_name}")
    
    print("Slovak (sk) packages:")
    if slovak_packages:
        for pkg in slovak_packages:
            print(f"  {pkg}")
    else:
        print("  None found")
    
    print("\nCzech (cs) packages:")
    if czech_packages:
        for pkg in czech_packages:
            print(f"  {pkg}")
    else:
        print("  None found")
    
    # Check for multi-hop translation (sk → cs → en or sk → ru → en)
    print("\n\nChecking for possible translation paths:")
    print("Slovak → Czech → English")
    print("Slovak → Russian → English")
    
except ImportError:
    print("Argos Translate not installed")
except Exception as e:
    print(f"Error: {e}")
