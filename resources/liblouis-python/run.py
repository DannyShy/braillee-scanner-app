# Import necessary modules
import argparse
from os import path
from pathlib import Path
import louis as louis
import os

# Get the path of the current script and its directory
current_script_path = os.path.realpath(__file__)
current_script_directory = os.path.dirname(current_script_path)

# Set up command-line argument parsing
parser = argparse.ArgumentParser(description='Liblouis Braille recognizer to Slovak language .')
parser.add_argument('braille_text', nargs='?', type=str, default=None, help='Braille text to be translated: string')
parser.add_argument('results_dir', type=str, help='Output directory')
parser.add_argument('translation_table', type=str, help='Translation table to be used: string')
parser.add_argument('--file', type=str, default=None, help='Path to file containing braille text (UTF-8). Use this instead of braille_text argument to avoid Windows command-line encoding issues with Unicode braille characters.')
args = parser.parse_args()

# Read braille text from file if --file flag is provided, otherwise use command-line argument
if args.file is not None:
    file_path = args.file
    if not Path(file_path).is_file():
        print(f"The specified braille input file does not exist: {file_path}")
        exit(1)
    with open(file_path, encoding='utf-8') as f:
        braille_text = f.read()
    print(f"Read braille text from file: {file_path} ({len(braille_text)} chars)")
else:
    braille_text = args.braille_text

# Check if the braille text is empty or None
if (braille_text is None) or (braille_text == ''):
    print('input braille string does not exist or is empty')
    exit(1)

# Construct the path to the braille translation table
table_path = path.join(current_script_directory, 'louis', 'tables', args.translation_table)

# Check if the translation table exists
if not Path(table_path).is_file():
    print(f"The specified translation table does not exist: {table_path}")
    exit(1)

# Check if the results directory exists
if Path(args.results_dir).is_dir():
    # Construct the path to the output file
    translation_output_directory = path.join(args.results_dir, 'translatedBrailleDots.txt')
    try:
        # Translate the braille text using the braille translation table
        # Process line by line to preserve line structure
        translated_lines = []
        for line in braille_text.splitlines():
            if line.strip():
                translated_line = louis.backTranslateString([table_path], line)
                translated_lines.append(translated_line)
            else:
                translated_lines.append('')
        liblouis_word = '\n'.join(translated_lines)
        print(f"Translation completed: {len(braille_text)} braille chars -> {len(liblouis_word)} text chars")
        # Write the translated text to the output file
        with open(translation_output_directory, 'w', encoding='utf-8') as file:
            file.write(liblouis_word)
    except Exception as e:
        # Print an error message if something goes wrong during the translation
        print(f"An error occurred during the braille translation: {e}")
        exit(1)
else:
    # Print an error message if the results directory does not exist
    print(f"The specified output directory does not exist: {args.results_dir}")
    exit(1)
