import re

target_url = "https://lh3.googleusercontent.com/aida/AEtjO1X98oTfwNQkFjO28CjGpysj42JcV1BPKwoIYhMGDF1j3kOxS0fm8aH_rEJN6nmPK4IsTZw01CZ3Oe2a_rtdmd1r3-vQlAoL3F04KW9yOqSDc1k_VM-7FYxOgnsgSS2-JKZH28QYLfG8GEj3KyhBdI3dmcAyVU1jihdZYjcGvJ0asg7V-ThUEkYcFbJL9ADkPwdbrVFXIbEqJ8Ns27vwD6ci7PPAgvfTrfyqUMCee3FlvdUF7uxgMKzouOUe"
replacement_src = "/assets/logos/ikonectt_transparent.png"

for filename in ['residential.html', 'business.html', 'coverage.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if target_url in content:
        content = content.replace(target_url, replacement_src)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Target not found in {filename}")

print("Done updating HTML logo references.")
