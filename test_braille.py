#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test braille translation with different tables"""

import sys
import os

# Add the liblouis-python directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'resources', 'liblouis-python'))

import louis

# Read braille text from file
input_file = os.path.join(os.path.dirname(__file__), 'test_braille_input.txt')
with open(input_file, 'r', encoding='utf-8') as f:
    braille_text = f.read()

# Test with different tables
tables_to_test = [
    'en-us-g1.ctb',
    'ru-ru-g1.ctb',
    'sk-g1.ctb',
    'cs-g1.ctb',  # Czech - similar to Slovak
]

tables_dir = os.path.join(os.path.dirname(__file__), 'resources', 'liblouis-python', 'louis', 'tables')

# Output file
output_file = os.path.join(os.path.dirname(__file__), 'test_braille_output.txt')

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("Testing braille translation with different tables:\n\n")
    out.write(f"Braille input length: {len(braille_text)} chars\n")
    out.write(f"First line: {braille_text.split(chr(10))[0]}\n\n")
    
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
            out.write(f"  First line: {translated_lines[0] if translated_lines else ''}\n")
            out.write(f"  Full result:\n{full_result}\n")
            out.write(f"  Total length: {len(full_result)} chars\n\n")
        except Exception as e:
            out.write(f"❌ {table_name}: Error - {e}\n\n")

print(f"Test completed. Results written to: {output_file}")
