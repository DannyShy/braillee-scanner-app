#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Text translation script using Argos Translate for offline translation.
Translates Russian text to English or Slovak.
"""

import argparse
import sys
import os

def ensure_language_package(source_lang, target_lang):
    """
    Ensure the language package for translation is installed.
    Downloads and installs if not present.
    
    Args:
        source_lang: Source language code (e.g., 'ru')
        target_lang: Target language code (e.g., 'en')
    
    Returns:
        True if package is available, False otherwise
    """
    try:
        import argostranslate.package
        import argostranslate.translate
    except ImportError:
        print("Error: argostranslate not installed. Install with: pip install argostranslate")
        return False
    
    # Get available languages
    installed_languages = argostranslate.translate.get_installed_languages()
    
    # Check if both languages are installed
    source_installed = any(lang.code == source_lang for lang in installed_languages)
    target_installed = any(lang.code == target_lang for lang in installed_languages)
    
    if source_installed and target_installed:
        return True
    
    # Try to download and install the language package
    print(f"Downloading language package: {source_lang} -> {target_lang}")
    
    try:
        # Get available packages from the repository
        available_packages = argostranslate.package.get_available_packages()
        
        # Find the package for our language pair
        package_to_install = None
        for pkg in available_packages:
            if pkg.from_code == source_lang and pkg.to_code == target_lang:
                package_to_install = pkg
                break
        
        if package_to_install is None:
            print(f"Error: No package available for {source_lang} -> {target_lang}")
            print(f"Available packages: {[(p.from_code, p.to_code) for p in available_packages[:10]]}...")
            return False
        
        # Download and install the package
        print(f"Installing package: {package_to_install.from_name} -> {package_to_install.to_name}")
        argostranslate.package.install_from_path(package_to_install.download())
        print(f"Package installed successfully")
        return True
        
    except Exception as e:
        print(f"Error downloading language package: {e}")
        return False


def translate_text(text, source_lang='ru', target_lang='en'):
    """
    Translate text from source language to target language using Argos Translate.
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'ru' for Russian)
        target_lang: Target language code (e.g., 'en' for English, 'sk' for Slovak)
    
    Returns:
        Translated text
    """
    try:
        import argostranslate.package
        import argostranslate.translate
    except ImportError:
        print("Error: argostranslate not installed. Install with: pip install argostranslate")
        return text
    
    # Ensure language package is installed
    if not ensure_language_package(source_lang, target_lang):
        print(f"Warning: Could not install language package, returning original text")
        return text
    
    # Get available languages
    installed_languages = argostranslate.translate.get_installed_languages()
    
    # Find source and target language objects
    source_language = None
    target_language = None
    
    for lang in installed_languages:
        if lang.code == source_lang:
            source_language = lang
        if lang.code == target_lang:
            target_language = lang
    
    if source_language is None:
        print(f"Error: Source language '{source_lang}' not installed.")
        print(f"Installed languages: {[lang.code for lang in installed_languages]}")
        return text
    
    if target_language is None:
        print(f"Error: Target language '{target_lang}' not installed.")
        print(f"Installed languages: {[lang.code for lang in installed_languages]}")
        return text
    
    # Get the translation from source to target
    translation = source_language.get_translation(target_language)
    
    if translation is None:
        print(f"Error: No translation available from {source_lang} to {target_lang}")
        return text
    
    # Translate the text
    translated_text = translation.translate(text)
    return translated_text


def main():
    parser = argparse.ArgumentParser(description='Translate text from Russian to target language')
    parser.add_argument('--input', type=str, required=True, help='Input file path containing text to translate')
    parser.add_argument('--output', type=str, required=True, help='Output file path for translated text')
    parser.add_argument('--source', type=str, default='ru', help='Source language code (default: ru)')
    parser.add_argument('--target', type=str, required=True, help='Target language code (en, sk, etc.)')
    
    args = parser.parse_args()
    
    # Read input text
    if not os.path.isfile(args.input):
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    with open(args.input, 'r', encoding='utf-8') as f:
        input_text = f.read()
    
    print(f"Read {len(input_text)} characters from {args.input}")
    
    # Translate the text
    translated_text = translate_text(input_text, args.source, args.target)
    
    # Write output
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(translated_text)
    
    print(f"Translated text written to {args.output} ({len(translated_text)} characters)")


if __name__ == '__main__':
    main()
