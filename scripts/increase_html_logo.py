for filename in ['residential.html', 'business.html', 'coverage.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace logo height class
    old_str = 'class="h-8 w-auto object-contain"'
    new_str = 'class="h-9 sm:h-10 md:h-11 w-auto object-contain"'
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Old string not found in {filename}")

print("Completed.")
