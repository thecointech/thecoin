

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, TypedDict


@dataclass
class VqaCallData:
    args: List[Any]
    response: Dict[str, Any]

class Coords(TypedDict):
    top: float
    left: float
    centerY: float
    height: float
    width: float

class FontData(TypedDict):
    font: str
    color: str
    size: str
    style: str

class ElementData(TypedDict):
    tagName: str
    role: Optional[str]
    selector: str
    coords: Coords
    font: FontData
    label: str
    text: str
    nodeValue: str
    parentSelector: str
    parentTagName: str
    siblingText: List[str]

class ComponentsData(TypedDict):
    selector: float
    tag: float
    inputType: float
    font: float
    label: float
    role: float
    positionAndSize: float
    nodeValue: float
    siblings: float
    estimatedText: float

class TestElmRawData(TypedDict):
    data: ElementData
    score: float
    components: ComponentsData

@dataclass
class TestElmData:
    filename: str
    data: ElementData
    score: float
    components: ComponentsData

class TestSchData(TypedDict):
    score: float
    components: Any
    search: Dict[str, Any]

class ElementName(TypedDict):
    step: int
    index: int
    name: str
    fullname: str
