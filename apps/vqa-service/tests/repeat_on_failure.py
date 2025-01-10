
import os
import time


class RepeatSubTestContextManager:
    def __init__(self, subtest_context):
        self.current_try = 0
        self.subtest_context = subtest_context  # Store the original subtest context
        
    def __enter__(self):
        self.current_try += 1
        # Enter the actual subtest context first
        self.subtest = self.subtest_context.__enter__()
        return self
        
    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            print(f"Subtest attempt {self.current_try} failed with: {exc_type.__name__}: {exc_value}")
            
            # Exit the current subtest context
            self.subtest_context.__exit__(exc_type, exc_value, traceback)
            return False  # Suppress the final exception
        
        # No exception - exit the subtest context normally
        return self.subtest_context.__exit__(exc_type, exc_value, traceback)

def repeat_on_fail(func, timeout=3600):
    """Decorator that repeats a test on failure"""
    def wrapper(*args, **kwargs):
        # Do not repeat if no debugger attached
        if (os.environ.get('DEBUGPY_RUNNING') != "true"):
            return func(*args, **kwargs)

        oldSubTest = args[0].subTest
        # Wrap the original subTest to add retry capability
        def wrapped_subtest(*subtest_args, **subtest_kwargs):
            original_subtest = oldSubTest(*subtest_args, **subtest_kwargs)
            return RepeatSubTestContextManager(original_subtest)
        args[0].subTest = wrapped_subtest
        
        while True:
            start_time = time.time()
            # args[0] is self (the test class instance)
            try:
                r = func(*args, **kwargs)
                args[0].subTest = oldSubTest
                return r
            except Exception as e:
                if time.time() - start_time > timeout:
                    args[0].subTest = oldSubTest
                    raise e
                # else re-run the test
                
    return wrapper