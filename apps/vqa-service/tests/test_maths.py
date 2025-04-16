from TestBase import TestBase
from src.geo_math import BBox, coords_to_points, MAX_RESOLUTION, get_distance
from shapely.geometry import Point


class TestGeoMath(TestBase):
    def setUp(self):
        self.default_bbox = BBox()
        self.custom_bbox = BBox(left=10, top=20, right=30, bottom=40)

    def test_create_from_coords(self):
        coords = {
            "top": 10,
            "left": 20,
            "right": 30,
            "bottom": 40,
            "centerY": 123,
        }
        bbox = BBox.from_coords(coords)
        self.assertEqual(bbox.top, 10)
        self.assertEqual(bbox.left, 20)
        self.assertEqual(bbox.right, 30)
        self.assertEqual(bbox.bottom, 40)
    
    def test_bbox_defaults(self):
        self.assertEqual(self.default_bbox.left, 0.0)
        self.assertEqual(self.default_bbox.top, 0.0)
        self.assertEqual(self.default_bbox.right, MAX_RESOLUTION)
        self.assertEqual(self.default_bbox.bottom, MAX_RESOLUTION)
    
    def test_bbox_points(self):
        points = self.custom_bbox.points
        self.assertEqual(len(points), 2)
        self.assertEqual(points[0].x, 10)
        self.assertEqual(points[0].y, 20)
        self.assertEqual(points[1].x, 30)
        self.assertEqual(points[1].y, 40)
    
    def test_bbox_intersects(self):
        bbox1 = BBox(left=0, top=0, right=10, bottom=10)
        bbox2 = BBox(left=5, top=5, right=15, bottom=15)
        bbox3 = BBox(left=20, top=20, right=30, bottom=30)
        
        self.assertTrue(bbox1.intersects(bbox2))
        self.assertFalse(bbox1.intersects(bbox3))
    
    def test_bbox_extend(self):
        extended = self.custom_bbox.extend(left=5, right=35, top=15, bottom=45)
        self.assertEqual(extended.left, 5)
        self.assertEqual(extended.top, 15)
        self.assertEqual(extended.right, 35)
        self.assertEqual(extended.bottom, 45)
        
        # Test partial extension
        partial = self.custom_bbox.extend(left=5)
        self.assertEqual(partial.left, 5)
        self.assertEqual(partial.right, 30)
    
    def test_bbox_add_scale(self):
        scaled = self.custom_bbox.add(5)
        self.assertEqual(scaled.left, 5)
        self.assertEqual(scaled.top, 15)
        self.assertEqual(scaled.right, 35)
        self.assertEqual(scaled.bottom, 45)
    
    def test_bbox_add_boxes(self):
        bbox1 = BBox(left=0, top=0, right=10, bottom=10)
        bbox2 = BBox(left=5, top=5, right=15, bottom=15)
        combined = bbox1 + bbox2
        self.assertEqual(combined.left, 0)
        self.assertEqual(combined.top, 0)
        self.assertEqual(combined.right, 15)
        self.assertEqual(combined.bottom, 15)
    
    def test_bbox_contains(self):
        large = BBox(left=0, top=0, right=20, bottom=20)
        small = BBox(left=5, top=5, right=15, bottom=15)
        outside = BBox(left=25, top=25, right=35, bottom=35)
        
        self.assertTrue(small in large)
        self.assertFalse(outside in large)
    
    def test_bbox_iter(self):
        coords = list(self.custom_bbox)
        self.assertEqual(coords, [10, 20, 30, 40])
    
    def test_bbox_subscript(self):
        self.assertEqual(self.custom_bbox[0], 10)  # left
        self.assertEqual(self.custom_bbox[1], 20)  # top
        self.assertEqual(self.custom_bbox[2], 30)  # right
        self.assertEqual(self.custom_bbox[3], 40)  # bottom
    
    def test_bbox_from_points(self):
        points = [Point(0, 0), Point(10, 10), Point(5, 5)]
        bbox = BBox.from_points(points)
        self.assertEqual(bbox.left, 0)
        self.assertEqual(bbox.top, 0)
        self.assertEqual(bbox.right, 10)
        self.assertEqual(bbox.bottom, 10)
    
    def test_coords_to_points(self):
        coords = {'left': 10, 'top': 20, 'width': 30, 'height': 40}
        points = coords_to_points(coords)
        self.assertEqual(points[0].x, 10)
        self.assertEqual(points[0].y, 20)
        self.assertEqual(points[1].x, 40)  # left + width
        self.assertEqual(points[1].y, 60)  # top + height
    
    def test_merge_overlapping(self):
        box1 = BBox(left=0, top=0, right=10, bottom=10)
        box2 = BBox(left=5, top=5, right=15, bottom=15)
        box3 = BBox(left=20, top=20, right=30, bottom=30)
        
        # Test merging intersecting boxes
        merged = BBox.merge_overlapping([box1, box2])
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0].left, 0)
        self.assertEqual(merged[0].right, 15)
        
        # Test with non-intersecting boxes
        merged = BBox.merge_overlapping([box1, box3])
        self.assertEqual(len(merged), 2)
        
        # Test empty list
        self.assertEqual(BBox.merge_overlapping([]), [])
    
    def test_bbox_merge_all(self):
        """Test merging multiple boxes into a single encompassing box"""
        boxes = [
            BBox(left=0, top=0, right=10, bottom=10),
            BBox(left=20, top=20, right=30, bottom=30),
            BBox(left=5, top=15, right=25, bottom=35)
        ]
        
        merged = BBox.merge_all(boxes)
        
        # The merged box should encompass all points
        self.assertEqual(merged.left, 0)    # Leftmost point from first box
        self.assertEqual(merged.top, 0)     # Topmost point from first box
        self.assertEqual(merged.right, 30)  # Rightmost point from second box
        self.assertEqual(merged.bottom, 35) # Bottommost point from third box
        
        # Test with single box
        single_box = BBox(left=10, top=10, right=20, bottom=20)
        merged_single = BBox.merge_all([single_box])
        self.assertEqual(merged_single.left, 10)
        self.assertEqual(merged_single.top, 10)
        self.assertEqual(merged_single.right, 20)
        self.assertEqual(merged_single.bottom, 20)
        
        # Test with empty list
        with self.assertRaises(ValueError):
            BBox.merge_all([])

    def test_bbox_relative_to(self):
        """Test getting coordinates relative to another box"""
        # Test box that's offset from origin
        reference = BBox(left=100, top=50, right=200, bottom=150)
        box = BBox(left=150, top=75, right=175, bottom=100)
        
        relative = box.relative_to(reference)
        
        # Coordinates should be relative to reference's top-left (100, 50)
        self.assertEqual(relative.left, 50)    # 150 - 100
        self.assertEqual(relative.top, 25)     # 75 - 50
        self.assertEqual(relative.right, 75)   # 175 - 100
        self.assertEqual(relative.bottom, 50)  # 100 - 50
        
        # Test box that crosses reference boundaries
        box2 = BBox(left=50, top=25, right=250, bottom=175)
        relative2 = box2.relative_to(reference)
        
        self.assertEqual(relative2.left, -50)   # 50 - 100
        self.assertEqual(relative2.top, -25)    # 25 - 50
        self.assertEqual(relative2.right, 150)  # 250 - 100
        self.assertEqual(relative2.bottom, 125) # 175 - 50

    def test_get_distance(self):
        """Test distance calculations between points and boxes"""
        box = BBox(left=10, top=10, right=20, bottom=20)
        
        # Point inside box should have distance 0
        inside_point = Point(15, 15)
        self.assertEqual(get_distance(inside_point, box), 0)
        
        # Point on edge should have distance 0
        edge_point = Point(10, 15)
        self.assertEqual(get_distance(edge_point, box), 0)
        
        # Point directly left of box
        left_point = Point(5, 15)
        self.assertEqual(get_distance(left_point, box), 5)  # Distance to left edge
        
        # Point directly above box
        top_point = Point(15, 5)
        self.assertEqual(get_distance(top_point, box), 5)  # Distance to top edge
        
        # Point diagonal from corner
        diagonal_point = Point(5, 5)
        # Distance to top-left corner should be sqrt(50) ≈ 7.07...
        self.assertAlmostEqual(get_distance(diagonal_point, box), 7.0710678118654755)