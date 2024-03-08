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
parser.add_argument('braille_text', type=str, help='Braille text to be translated: string')
parser.add_argument('results_dir', type=str, help='Output directory')
parser.add_argument('translation_table', type=str, help='Translation table to be used: string')
args = parser.parse_args()

# Check if the braille text argument is empty or None
if (args.braille_text == '') or (args.braille_text is None):
    print('input braille string does not exist: ' + args.braille_text)
    exit()

# Construct the path to the braille translation table
table_path = path.join(current_script_directory, 'louis', 'tables', args.translation_table)

# Check if the translation table exists
if not Path(table_path).is_file():
    print(f"The specified translation table does not exist: {table_path}")
    exit()
# Check if the results directory exists
if Path(args.results_dir).is_dir():
    # Construct the path to the output file
    translation_output_directory = path.join(args.results_dir, 'translatedBrailleDots.txt')
    try:
        # Translate the braille text using the Slovak braille translation table
        liblouis_word = louis.backTranslateString([table_path], args.braille_text)
        # Write the translated text to the output file
        with open(translation_output_directory, 'w', encoding='utf-8') as file:
            file.write(liblouis_word)
    except Exception as e:
        # Print an error message if something goes wrong during the translation
        print(f"An error occurred during the braille translation: {e}")
else:
    # Print an error message if the results directory does not exist
    print(f"The specified output directory does not exist: {args.results_dir}")