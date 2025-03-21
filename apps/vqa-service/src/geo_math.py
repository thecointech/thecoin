#
# Basic math, building ontop of shapely.
# Every use of point/box outside of this file
# should be in the format of these classes exclusively
#
from __future__ import annotations
from pydantic import BaseModel, Field
import shapely
from shapely.geometry import box, MultiPoint, Point


MAX_RESOLUTION = 2 ** 16


class BBox(BaseModel):
    left: float = Field(default=0.0)
    top: float = Field(default=0.0)
    right: float = Field(default=MAX_RESOLUTION)
    bottom: float = Field(default=MAX_RESOLUTION)

    @property
    def points(self):
        return [Point(self.left, self.top), Point(self.right, self.bottom)]

    @property 
    def box(self):
        return box(self.left, self.top, self.right, self.bottom)

    def intersects(self, other: BBox):
        return self.box.intersects(other.box)

    def extend(self, left: float = None, right: float = None, top: float = None, bottom: float = None):
        return BBox(left=min(self.left, left if left is not None else self.left), 
                    top=min(self.top, top if top is not None else self.top), 
                    right=max(self.right, right if right is not None else self.right), 
                    bottom=max(self.bottom, bottom if bottom is not None else self.bottom))

    def add(self, scale: float):
        return BBox(left=self.left - scale, top=self.top - scale, right=self.right + scale, bottom=self.bottom + scale)

    def translate(self, x: float, y: float):
        return BBox(left=self.left + x, top=self.top + y, right=self.right + x, bottom=self.bottom + y)

    def relative_to(self, other: BBox):
        return self.translate(-other.left, -other.top)

    def __len__(self):
        return 4

    def __add__(self, other: BBox):
        return BBox.from_points(self.points + other.points)
    
    # Note: contains is completely inside, intersects is partially inside
    def __contains__(self, other: BBox):
        return self.box.contains(other.box)

    # convert to tuple allows easy interaction with Image
    def __iter__(self):
        return iter([self.left, self.top, self.right, self.bottom])

    def __getitem__(self, idx: int):
        return list(self)[idx]

    @classmethod
    def from_coords(cls, coords: dict):
        # Our coordinates coming in are top/left/width/height
        compat = coords.copy()
        if 'height' in coords:
            compat['bottom'] = coords['top'] + coords['height']
        if 'width' in coords:
            compat['right'] = coords['left'] + coords['width']
        return cls(**compat)

    @classmethod
    def from_points(cls, points: list[Point]):
        bounds = MultiPoint(points).bounds
        return cls(left=bounds[0], top=bounds[1], right=bounds[2], bottom=bounds[3])

    @classmethod
    def merge_all(cls, boxes: list[BBox]):
        if not boxes or boxes == []:
            raise ValueError("Cannot merge empty list of boxes")
        return cls.from_points([point for box in boxes for point in box.points])

    @classmethod
    def merge_overlapping(cls, boxes: list[BBox]) -> list[BBox]:
        if not boxes:
            return []

        merged = []
        while boxes:
            current = boxes.pop(0)
            merged_something = False
            
            # Try to merge with any existing merged boxes
            for i, existing in enumerate(merged):
                if current.intersects(existing):

                    merged[i] = current + existing
                    merged_something = True
                    break
            
            if not merged_something:
                merged.append(current)
        
        return merged


# Helper to convert coords to 2 points, [left, top], [right, bottom]
def coords_to_points(coords: dict[str, float]):
    return [
        Point(coords['left'], coords['top']),
        Point(coords['left'] + coords['width'], coords['top'] + coords['height'])
    ]

def get_distance(point: Point, bbox: BBox):
    return point.distance(shapely.box(bbox.left, bbox.top, bbox.right, bbox.bottom))

#  Poorly named, but used once.  Invert box, make point relative to it
def point_out_of_bbox(point: Point, bbox: BBox):
    return Point(point.x + bbox.left, point.y + bbox.top)