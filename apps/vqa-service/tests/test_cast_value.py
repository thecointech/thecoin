import unittest
from geo_math import BBox
from src.run_endpoint_query import pixels_to_position, position_to_pixels, cast_value
from TestBase import TestBase

class TestCastValue(TestBase):
    def setUp(self):
        # Create a sample crop with 100x100 dimensions for easy percentage calculations
        self.crop = BBox(left=0, top=0, right=100, bottom=100)
        
        # Create a sample crop with non-zero origin and different dimensions
        self.complex_crop = BBox(left=50, top=25, right=150, bottom=125)
    
    def test_pixels_to_position_simple_crop(self):
        # Test with simple 100x100 crop starting at origin
        response = "looking for position_x=13 and position_y=79"
        result = pixels_to_position(response, self.crop)
        self.assertEqual("looking for position_x=13.0 and position_y=79.0", result)


    def test_pixels_to_position_complex_crop(self):
        # Test with crop that has non-zero origin and different dimensions
        response = "looking for position_x=100 and position_y=75"
        result = pixels_to_position(response, self.complex_crop)
        
        # For a crop from 50 to 150 (width 100), pixel 100 should be 50%
        # For a crop from 25 to 125 (height 100), pixel 75 should be 50%
        self.assertEqual(result, "looking for position_x=50.0 and position_y=50.0")

    def test_position_to_pixels_simple_crop(self):
        # Test with simple 100x100 crop starting at origin
        response = {"position_x": "50", "position_y": "50"}
        result = position_to_pixels(response, self.crop)
        
        self.assertEqual(result["position_x"], 50.0)  # 50% = 50 pixels
        self.assertEqual(result["position_y"], 50.0)  # 50% = 50 pixels

    def test_position_to_pixels_complex_crop(self):
        # Test with crop that has non-zero origin and different dimensions
        response = {"position_x": "50", "position_y": "50"}
        result = position_to_pixels(response, self.complex_crop)
        
        # For a crop from 50 to 150, 50% should be pixel 100
        # For a crop from 25 to 125, 50% should be pixel 75
        self.assertEqual(result["position_x"], 100.0)
        self.assertEqual(result["position_y"], 75.0)

    def test_cast_value_invalid_input(self):
        # Test handling of invalid numeric input
        response = "looking for position_x=invalid and position_y=50"
        result = pixels_to_position(response, self.crop)
        self.assertEqual(result, "looking for position_x=invalid and position_y=50.0")

    def test_cast_value_missing_key(self):
        # Test handling of missing keys
        response = {"other_key": "value"}
        result = cast_value(response, "position_x", 1.0)
        
        self.assertIsNone(result)
        self.assertNotIn("position_x", response)

    def test_cast_value_nested_dict(self):
        # Test casting values in nested dictionaries
        response = {
            "outer": {
                "position_x": "50",
                "inner": {"position_y": "25"}
            }
        }
        cast_value(response, "position_x", 2.0)  # Scale by 2
        cast_value(response, "position_y", 2.0)  # Scale by 2
        
        self.assertEqual(response["outer"]["position_x"], 100.0)
        self.assertEqual(response["outer"]["inner"]["position_y"], 50.0)

    def test_cast_value_list(self):
        # Test casting values in lists of dictionaries
        response = {
            "items": [
                {"position_x": "10"},
                {"position_x": "20"}
            ]
        }
        cast_value(response, "position_x", 2.0)  # Scale by 2
        
        self.assertEqual(response["items"][0]["position_x"], 20.0)
        self.assertEqual(response["items"][1]["position_x"], 40.0)

if __name__ == '__main__':
    unittest.main()