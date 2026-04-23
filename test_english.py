#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test English braille translation"""

import sys
import os

# Add the liblouis-python directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'resources', 'liblouis-python'))

import louis

# Read English braille text from file
input_file = os.path.join(os.path.dirname(__file__), 'test_english_braille.txt')
with open(input_file, 'r', encoding='utf-8') as f:
    braille_text = f.read()

# Test with different English tables
tables_to_test = [
    'en-us-g1.ctb',
    'en-us-g2.ctb',
    'en-ueb-g1.ctb',
    'en-ueb-g2.ctb',
    'en-gb-g1.ctb',
]

tables_dir = os.path.join(os.path.dirname(__file__), 'resources', 'liblouis-python', 'louis', 'tables')

# Output file
output_file = os.path.join(os.path.dirname(__file__), 'test_english_output.txt')

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("Testing English braille translation with different tables:\n\n")
    out.write(f"Braille input length: {len(braille_text)} chars\n\n")
    
    for table_name in tables_to_test:
        table_path = os.path.join(tables_dir, table_name)
        
        if not os.path.exists(table_path):
            out.write(f"❌ {table_name}: Table file not found\n\n")
            continue
        
        try:
            # Translate the full text
            lines = braille_text.split('\n')
            translated_lines = []
            for line in lines:
                if line.strip():
                    result = louis.backTranslateString([table_path], line)
                    translated_lines.append(result)
                else:
                    translated_lines.append('')
            
            full_result = '\n'.join(translated_lines)
            
            out.write(f"✓ {table_name}:\n")
            out.write(f"  Full result:\n{full_result}\n")
            out.write(f"  Total length: {len(full_result)} chars\n\n")
            out.write("="*80 + "\n\n")
        except Exception as e:
            out.write(f"❌ {table_name}: Error - {e}\n\n")

print(f"Test completed. Results written to: {output_file}")
