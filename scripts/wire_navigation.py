import re

def update_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Update logo link
    html = re.sub(r'<a aria-label="Ikonectt Home"[^>]*href="#"', '<a aria-label="Ikonectt Home" class="flex items-center flex-shrink-0 transition-opacity hover:opacity-90" href="index.html"', html)
    # Utility bar links
    html = re.sub(r'href="#residential"', 'href="residential.html"', html)
    html = re.sub(r'href="#business"', 'href="business.html"', html)
    
    # Megamenu and dropdown links
    html = html.replace('href="#plans"', 'href="residential.html#plans-matrix"')
    html = html.replace('href="#coverage"', 'href="coverage.html"')
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html")

def update_page_links(filename, current_page):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()

    # Home link on logo
    html = re.sub(r'data-path="home"\s+href="#"', 'data-path="home" href="index.html"', html)
    # Residential links
    html = re.sub(r'data-path="residential-internet"\s+href="#"', 'data-path="residential-internet" href="residential.html"', html)
    html = re.sub(r'data-path="residential-plans"\s+href="#"', 'data-path="residential-plans" href="residential.html#plans-matrix"', html)
    # Business links
    html = re.sub(r'data-path="business-internet"\s+href="#"', 'data-path="business-internet" href="business.html"', html)
    html = re.sub(r'data-path="business-solutions"\s+href="#"', 'data-path="business-solutions" href="business.html#solutions"', html)
    # Coverage links
    html = re.sub(r'data-path="coverage-checker"\s+href="#"', 'data-path="coverage-checker" href="coverage.html"', html)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated {filename}")

update_index()
update_page_links('residential.html', 'residential')
update_page_links('business.html', 'business')
update_page_links('coverage.html', 'coverage')
print("All navigation links wired successfully!")
