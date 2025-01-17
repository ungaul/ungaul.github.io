import os
import json
from pathlib import Path

# Source directories
PHOTOS_DIR = Path("gallery/assets/img/photos")
GAUL_DIR = Path("gallery/assets/img/gaul")

# Output JSON files
PHOTOS_JSON = PHOTOS_DIR / "data.json"
GAUL_JSON = GAUL_DIR / "data.json"

def generate_json(directory, output_file):
    """
    Scans a directory and generates a JSON file listing the images it contains.

    Args:
        directory (Path): Path to the directory to scan.
        output_file (Path): Path to the output JSON file.
    """
    data = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.jpg', '.webp', '.png', '.jpeg')):
                # Relative path to avoid absolute paths in the output
                relative_path = Path(root).joinpath(file).relative_to(directory.parent)
                data.append({
                    "name": file,
                    "path": str(relative_path).replace("\\", "/")  # Normalize paths for web use
                })

    # Write data to the JSON file
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    print(f"Generated {output_file}")

def main():
    # Generate JSON for the "photos" directory
    generate_json(PHOTOS_DIR, PHOTOS_JSON)

    # Generate JSON for the "gaul" directory
    generate_json(GAUL_DIR, GAUL_JSON)

if __name__ == "__main__":
    main()
