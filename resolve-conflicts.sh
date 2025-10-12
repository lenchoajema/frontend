#!/bin/bash

# Find all files with merge conflict markers
FILES=$(grep -rl "<<<<<<< HEAD" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=coverage --exclude-dir=build 2>/dev/null)

echo "Resolving conflicts in the following files:"
echo "$FILES"
echo ""

for file in $FILES; do
    echo "Processing: $file"
    
    # Create a temporary Python script to resolve conflicts
    python3 << 'PYTHON_SCRIPT'
import sys
import re

filename = sys.argv[1] if len(sys.argv) > 1 else None
if not filename:
    sys.exit(1)

try:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
except:
    print(f"Error reading {filename}")
    sys.exit(1)

# Remove conflict markers and keep the incoming changes (after =======)
# Pattern: <<<<<<< HEAD\n.*?\n=======\n(.*?)\n>>>>>>> 
pattern = r'<<<<<<< HEAD\n.*?\n=======\n(.*?)\n>>>>>>>[^\n]*\n?'
resolved = re.sub(pattern, r'\1', content, flags=re.DOTALL)

# If that didn't work, try simpler pattern
if '<<<<<<< HEAD' in resolved:
    lines = resolved.split('\n')
    new_lines = []
    in_conflict = False
    keep_section = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            keep_section = False
            continue
        elif line.startswith('=======') and in_conflict:
            keep_section = True
            continue
        elif line.startswith('>>>>>>>') and in_conflict:
            in_conflict = False
            keep_section = False
            continue
        
        if not in_conflict:
            new_lines.append(line)
        elif keep_section:
            new_lines.append(line)
    
    resolved = '\n'.join(new_lines)

try:
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(resolved)
    print(f"✓ Resolved conflicts in {filename}")
except:
    print(f"✗ Error writing {filename}")
    sys.exit(1)
PYTHON_SCRIPT
    
    python3 -c "
import sys
import re

filename = '$file'
try:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
except:
    print(f'Error reading {filename}')
    sys.exit(1)

lines = content.split('\n')
new_lines = []
in_conflict = False
keep_section = False

for line in lines:
    if line.startswith('<<<<<<< HEAD'):
        in_conflict = True
        keep_section = False
        continue
    elif line.startswith('=======') and in_conflict:
        keep_section = True
        continue
    elif line.startswith('>>>>>>>') and in_conflict:
        in_conflict = False
        keep_section = False
        continue
    
    if not in_conflict:
        new_lines.append(line)
    elif keep_section:
        new_lines.append(line)

resolved = '\n'.join(new_lines)

try:
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(resolved)
    print(f'✓ Resolved conflicts in {filename}')
except Exception as e:
    print(f'✗ Error writing {filename}: {e}')
    sys.exit(1)
"
done

echo ""
echo "Conflict resolution complete!"
echo "Checking for remaining conflicts..."
REMAINING=$(grep -r "<<<<<<< HEAD" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=coverage --exclude-dir=build 2>/dev/null | wc -l)
echo "Remaining conflicts: $REMAINING"
