import sys
import os
import unittest
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from query_json_fix import fix_unescaped_quotes, clean_invalid_json_chars, extract_json_text
from query import tryConvertToJSON


class TestJsonFix(unittest.TestCase):
    """Test JSON fixing functions from query_json_fix.py"""

    def test_fix_unescaped_quotes_in_reasoning(self):
        """Test the exact example from the user - unescaped quotes in reasoning field"""
        invalid_json = ' {\n  "next_button_visible": false,\n  "reasoning": "The image shows a form for entering details of an e-transfer, but there is no clearly visible button for proceeding to the next step. The form includes fields for account information, recipient, amount, date, and security details, but lacks a obvious "Next" or "Send" button."\n}'

        result = tryConvertToJSON(invalid_json)

        self.assertFalse(result['next_button_visible'])
        self.assertIn('Next', result['reasoning'])
        self.assertIn('Send', result['reasoning'])

    def test_multiple_unescaped_quotes(self):
        """Test multiple unescaped quotes in same value"""
        invalid_json = '{"field": "value with "quote1" and "quote2" inside"}'

        result = tryConvertToJSON(invalid_json)

        self.assertIn('quote1', result['field'])
        self.assertIn('quote2', result['field'])

    def test_already_valid_json(self):
        """Test that valid JSON isn't broken"""
        valid_json = '{"field": "value with properly \\"escaped\\" quotes"}'

        result = tryConvertToJSON(valid_json)

        self.assertIn('escaped', result['field'])

    def test_partially_escaped_quotes(self):
        """Test case where some quotes are already escaped but not all"""
        # This is the bug case - mixed escaped and unescaped quotes
        invalid_json = ' {\n  "next_button_visible": false,\n  "reasoning": "The image shows a form for entering details of an e-transfer, but there is no clearly visible button for proceeding to the next step. The form includes fields for account information, recipient, amount, date, and security details, but lacks a obvious \\"Next" or "Send" button."\n}'

        result = tryConvertToJSON(invalid_json)

        self.assertFalse(result['next_button_visible'])
        self.assertIn('Next', result['reasoning'])
        self.assertIn('Send', result['reasoning'])

    def test_fix_unescaped_quotes_direct(self):
        """Test fix_unescaped_quotes function directly"""
        invalid = '{"key": "value with "inner" quotes"}'
        fixed = fix_unescaped_quotes(invalid)

        # Should be parseable now
        result = json.loads(fixed)
        self.assertIn('inner', result['key'])

    def test_clean_invalid_json_chars_colon_equals(self):
        """Test cleaning of ':=' pattern"""
        invalid = '{"option":="value"}'
        cleaned = clean_invalid_json_chars(invalid)

        result = json.loads(cleaned)
        self.assertEqual(result['option'], 'value')

    def test_clean_invalid_json_chars_equals_number(self):
        """Test cleaning of '="number"' pattern"""
        invalid = '{"position_x="42.5", "position_y="43.5"}'
        cleaned = clean_invalid_json_chars(invalid)

        result = json.loads(cleaned)
        self.assertEqual(result['position_x'], 42.5)
        self.assertEqual(result['position_y'], 43.5)

    def test_clean_invalid_json_chars_none_values(self):
        """Test removal of None values"""
        invalid = '{"error_message_detected": false, "error_message": None}'
        cleaned = clean_invalid_json_chars(invalid)

        result = json.loads(cleaned)
        self.assertFalse(result['error_message_detected'])
        self.assertNotIn('error_message', result)

    def test_clean_invalid_json_chars_combined(self):
        """Test multiple cleaning patterns at once"""
        invalid = '{"field1":="value", "field2="123", "field3": None}'
        cleaned = clean_invalid_json_chars(invalid)

        result = json.loads(cleaned)
        self.assertEqual(result['field1'], 'value')
        self.assertEqual(result['field2'], 123)
        self.assertNotIn('field3', result)

    def test_extract_json_text_with_prefix(self):
        """Test extracting JSON from text with prefix"""
        text_with_json = 'The element was found {"key": "value", "number": 42}'
        extracted = extract_json_text(text_with_json)

        result = json.loads(extracted)
        self.assertEqual(result['key'], 'value')
        self.assertEqual(result['number'], 42)

    def test_extract_json_text_with_suffix(self):
        """Test extracting JSON from text with suffix"""
        text_with_json = '{"status": "success"} and that is the result'
        extracted = extract_json_text(text_with_json)

        result = json.loads(extracted)
        self.assertEqual(result['status'], 'success')

    def test_extract_json_text_multiline(self):
        """Test extracting JSON from multiline text"""
        text_with_json = '''Here is the response:
        {
            "field1": "value1",
            "field2": "value2"
        }
        Hope this helps!'''
        extracted = extract_json_text(text_with_json)

        result = json.loads(extracted)
        self.assertEqual(result['field1'], 'value1')
        self.assertEqual(result['field2'], 'value2')

    def test_extract_json_text_already_clean(self):
        """Test that pure JSON is returned unchanged"""
        pure_json = '{"field": "value"}'
        extracted = extract_json_text(pure_json)

        self.assertEqual(extracted, pure_json)

    def test_extract_json_text_no_json(self):
        """Test that text without JSON returns unchanged"""
        no_json = 'This is just plain text without any JSON'
        extracted = extract_json_text(no_json)

        self.assertEqual(extracted, no_json)


if __name__ == "__main__":
    unittest.main()
