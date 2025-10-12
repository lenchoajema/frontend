#!/usr/bin/env python3
import os
import sys
import glob

def resolve_conflicts(filepath):
    """Resolve merge conflicts by keeping incoming changes (after =======)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False
    
    new_lines = []
    in_conflict = False
    keep_section = False
    conflict_count = 0
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            keep_section = False
            conflict_count += 1
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
    
    if conflict_count == 0:
        return None
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"✓ Resolved {conflict_count} conflict(s) in {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error writing {filepath}: {e}")
        return False

def find_conflict_files(root_dir):
    """Find all files with merge conflict markers"""
    conflict_files = []
    exclude_dirs = {'node_modules', '.git', 'coverage', 'build', 'dist'}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if '<<<<<<< HEAD' in content:
                        conflict_files.append(filepath)
            except:
                pass
    
    return conflict_files

if __name__ == '__main__':
    root = '/workspaces/frontend'
    print("Searching for files with merge conflicts...")
    conflict_files = find_conflict_files(root)
    
    if not conflict_files:
        print("No merge conflicts found!")
        sys.exit(0)
    
    print(f"\nFound {len(conflict_files)} file(s) with conflicts:")
    for f in conflict_files:
        print(f"  - {f}")
    
    print("\nResolving conflicts...")
    success_count = 0
    for filepath in conflict_files:
        result = resolve_conflicts(filepath)
        if result:
            success_count += 1
    
    print(f"\n✓ Successfully resolved conflicts in {success_count}/{len(conflict_files)} file(s)")
    
    # Check for remaining conflicts
    remaining = find_conflict_files(root)
    if remaining:
        print(f"\n⚠ Warning: {len(remaining)} file(s) still have conflicts:")
        for f in remaining:
            print(f"  - {f}")
    else:
        print("\n✓ All conflicts resolved successfully!")
