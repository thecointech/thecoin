import unittest
from PIL import Image
from src.helpers_image import overlay_image
from geo_math import BBox

class TestHelpersImage(unittest.TestCase):
    def setUp(self):
        # Create a simple test image
        self.test_image = Image.new('RGB', (100, 100), color='white')
        
    def test_overlay_single_box(self):
        """Test overlaying a single bounding box"""
        box = BBox(left=10, top=10, right=90, bottom=90)
        result = overlay_image(self.test_image, [box])

        # result.show()
        
        # Check that result is in RGBA mode
        self.assertEqual(result.mode, 'RGBA')
        # Check dimensions haven't changed
        self.assertEqual(result.size, self.test_image.size)
        
    def test_overlay_multiple_boxes(self):
        """Test overlaying multiple bounding boxes"""
        boxes = [
            BBox(left=10, top=10, right=40, bottom=40),
            BBox(left=50, top=50, right=90, bottom=90)
        ]
        result = overlay_image(self.test_image, boxes)
        
        # result.show()

        self.assertEqual(result.mode, 'RGBA')
        self.assertEqual(result.size, self.test_image.size)
        
    def test_empty_box_list(self):
        """Test with empty box list"""
        result = overlay_image(self.test_image, [])
        
        self.assertEqual(result.mode, 'RGBA')
        self.assertEqual(result.size, self.test_image.size)
        
    def test_rgba_input(self):
        """Test with an image that's already in RGBA mode"""
        rgba_image = Image.new('RGBA', (100, 100), color=(255, 255, 255, 255))
        box = BBox(left=10, top=10, right=90, bottom=90)
        
        result = overlay_image(rgba_image, [box])
        
        self.assertEqual(result.mode, 'RGBA')
        self.assertEqual(result.size, rgba_image.size)

if __name__ == '__main__':
    unittest.main()