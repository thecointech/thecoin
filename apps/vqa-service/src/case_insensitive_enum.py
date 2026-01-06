from enum import Enum


class CaseInsensitiveEnum(str, Enum):
    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            # Try to match by lowercase comparison
            for member in cls:
                if member.value.lower() == value.lower():
                    return member
        return None
