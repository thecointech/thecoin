import os
import sys


parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'src'))

from query import runQuery as runQueryOriginal  # noqa: E402

runQuery = runQueryOriginal
