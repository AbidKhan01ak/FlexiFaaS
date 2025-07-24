# add_two.py
import sys
import json

# Read input JSON from stdin
payload = sys.stdin.read()

# Parse JSON safely
data = json.loads(payload)

# Example: expects keys 'a' and 'b'
result = data['a'] + data['b']
print(result)
