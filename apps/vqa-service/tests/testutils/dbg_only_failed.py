
import os
import sys
import json
from typing import Callable


class DebugFailingTests:
    """Context manager that tracks failing subtests and provides skip filtering for debug mode.

    Usage:
        with DebugFailingTests(section, test_name, skip_if) as tracker:
            for test in test_datum:
                with self.subTest(key=test.key):
                    if tracker.should_skip(test):
                        self.skipTest(f"Skipping {test.key}")
                    try:
                        await test_func(test)
                    except Exception:
                        tracker.record_failure(test.key)
                        raise
    """

    def __init__(self, section: str, test_name: str, skip_if: list[str] | Callable[[str], bool] | None = None):
        self.section = section
        self.test_name = test_name
        self.skip_if = skip_if if skip_if is not None else []
        self.failing_tests: list[str] = []
        self.skip_filter: Callable[[str], bool]|None = None

    def __enter__(self):
        self.skip_filter = self._get_skip_filter()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if len(self.failing_tests) > 0:
            with open(self._failing_name(), "w") as f:
                json.dump(self.failing_tests, f)
            print("Failing tests: " + str(self.failing_tests))
        else:
            if os.path.exists(self._failing_name()):
                os.remove(self._failing_name())
        return False

    def record_failure(self, test_key: str):
        """Record a test failure."""
        self.failing_tests.append(test_key)

    def should_skip(self, key: str) -> bool:
        """Check if a test should be skipped based on skip_if and debug mode."""
        return self.skip_filter(key) if self.skip_filter else False

    def _failing_name(self) -> str:
        return f"failing-vqa-{self.section}-{self.test_name}.json"

    def _get_skip_filter(self) -> Callable[[str], bool]:
        skip_fn = self.skip_if if isinstance(self.skip_if, Callable) else lambda key: key in self.skip_if
        if not os.path.exists(self._failing_name()):
            return skip_fn
        is_debugging = sys.gettrace() is not None or 'pydevd' in sys.modules
        if not is_debugging:
            return skip_fn
        # if debugging, only run the failing tests
        with open(self._failing_name(), "r") as f:
            data = json.load(f)
            return lambda key: skip_fn(key) or key not in data


# # Legacy functions for backward compatibility (now delegating to methods)
# def get_skip_filter(self, name: str, skip_if: list[str]|Callable[[TestData], bool]):
#     skip_fn = skip_if if isinstance(skip_if, Callable) else lambda test: test.key in skip_if
#     if (not os.path.exists(self.failing_name(name))):
#         return skip_fn
#     is_debugging = sys.gettrace() is not None or 'pydevd' in sys.modules
#     if not is_debugging:
#         return skip_fn
#     # if debugging, only run the failing tests
#     with open(self.failing_name(name), "r") as f:
#         data = json.load(f)
#         return lambda test: skip_fn(test) or test.key not in data

# def failing_name(self, name: str):
#     return f"failing-vqa-{self.section}-{name}.json"
