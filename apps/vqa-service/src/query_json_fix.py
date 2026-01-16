

import re


def clean_invalid_json_chars(text: str) -> str:
    """
    Fix random characters within JSON string values.
    Pattern: "key": "value with "unescaped" quotes" should become "key": "value with \"unescaped\" quotes"
    """
    # we sometimes get the following invalid json output "option":="value"
    cleaned = text.replace('":="', '": "')
    # In longer JSON am seeing eg: "position_y="43.5",
    cleaned = re.sub(r'=\"([\d\.]+)\"', r'": \g<1>', cleaned)
    # The model has trouble when returning None options
    # eg: {'error_message_detected': False, 'error_message': None}
    cleaned = re.sub(r",?\s*['\"][^'\"]+['\"]: None", '', cleaned, flags=re.IGNORECASE)
    return cleaned


def extract_json_text(text: str) -> str:
    """
    Sometimes, we get responses like:
    The element was found { ...(valid_json) ... }
    """
    # Try finding everything in between brackets
    match = re.search(r"(\{[\w\W]*\})", text)
    return match.group(1) if match else text


def fix_unescaped_quotes(text: str) -> str:
    """
    Fix unescaped quotes within JSON string values.
    Pattern: "key": "value with "unescaped" quotes" should become "key": "value with \"unescaped\" quotes"
    """

    # Pattern explanation:
    # (:\s*") - captures colon, optional whitespace, and opening quote
    # ([^"]*(?:"[^"]*)*?) - captures content that may contain quotes (non-greedy)
    # "(\s*[,}\]]) - closing quote followed by comma, brace, bracket, or newline
    # This targets string values between field delimiters
    pattern = r'(:\s*")([^"\\]*(?:\\.[^"\\]*)*?)("(?=\s*[,}\]\n]))'

    # More aggressive pattern for cases where quotes aren't properly closed
    # Looks for: ": "text" more text with "quotes" here",
    aggressive_pattern = r'(:\s*")([^"]*"[^"]*?)("(?=\s*[,}\]\n]))'

    # Try to detect if we have improperly nested quotes
    # Count quotes after ": " and before next comma/brace
    fixed = text
    lines = text.split('\n')
    result_lines = []

    for line in lines:
        # For each line, find field: value patterns
        # Match pattern: "field": "value possibly with "quotes" inside"
        if '": "' not in line:
            result_lines.append(line)
            continue

        parts = line.split('": "', 1)
        if len(parts) != 2:
            result_lines.append(line)
            continue

        prefix = parts[0] + '": "'
        remainder = parts[1]

        # Find all potential closing quotes (track positions of unescaped quotes)
        quote_positions = []
        i = 0
        while i < len(remainder):
            if remainder[i] == '\\' and i + 1 < len(remainder):
                i += 2
                continue
            if remainder[i] == '"':
                quote_positions.append(i)
            i += 1

        if not quote_positions:
            # No quotes found
            result_lines.append(line)
            continue

        # The closing quote should be the last one before a JSON delimiter
        # or the last one on the line
        close_idx = quote_positions[-1]
        for pos in reversed(quote_positions):
            # Check if this quote is followed by a JSON delimiter
            if pos + 1 >= len(remainder) or remainder[pos + 1] in ',}\n':
                close_idx = pos
                break

        # Now fix the content between opening and closing quotes
        content = remainder[:close_idx]
        suffix = remainder[close_idx:]

        # Count unescaped quotes in content
        internal_quote_count = 0
        i = 0
        while i < len(content):
            if content[i] == '\\' and i + 1 < len(content):
                i += 2
                continue
            if content[i] == '"':
                internal_quote_count += 1
            i += 1

        if internal_quote_count > 0:
            # Escape all unescaped quotes in the content
            fixed_content = []
            i = 0
            while i < len(content):
                if content[i] == '\\' and i + 1 < len(content) and content[i + 1] == '"':
                    # Already escaped quote - keep both characters
                    fixed_content.append('\\')
                    fixed_content.append('"')
                    i += 2
                elif content[i] == '"':
                    # Unescaped quote - escape it
                    fixed_content.append('\\')
                    fixed_content.append('"')
                    i += 1
                else:
                    fixed_content.append(content[i])
                    i += 1

            line = prefix + ''.join(fixed_content) + suffix

        result_lines.append(line)

    return '\n'.join(result_lines)

# Find string values that contain unescaped quotes
# Look for: ": "...<content with quotes>..."
# The pattern matches field values that have quotes in the middle
def replace_inner_quotes(match):
    prefix = match.group(1)  # The ": " part
    content = match.group(2)  # The string content with unescaped quotes

    # Escape any unescaped quotes in the content
    # First, protect already escaped quotes
    content = content.replace('\\"', '\x00')  # Temporarily replace escaped quotes
    content = content.replace('"', '\\"')      # Escape unescaped quotes
    content = content.replace('\x00', '\\"')  # Restore the escaped quotes

    return f'{prefix}"{content}"'
