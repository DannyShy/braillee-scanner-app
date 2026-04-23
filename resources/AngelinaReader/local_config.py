# coding: utf-8
"""
Local settings
"""
from pathlib import Path
import os
data_path = str(Path(__file__).parent)  # root local data directory
global_3rd_party = str(Path(__file__).parent)  # root local 3rd_party directory

# Set liblouis tables path to the tables directory bundled with the app
_liblouis_python_path = os.path.normpath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', 'liblouis-python'))
liblouis_tables_path_prefix = os.path.join(_liblouis_python_path, 'louis', 'tables') + os.sep