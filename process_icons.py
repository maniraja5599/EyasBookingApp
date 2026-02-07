from PIL import Image
import os

source_path = r"C:\Users\manir\.gemini\antigravity\brain\0c3a95c4-ca7e-43f8-a6ef-10cbfed3ae61\eyas_logo_source_1770441142500.png"
output_dir = "public"

try:
    img = Image.open(source_path)
    width, height = img.size
    
    # Calculate crop box for center square
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    right = (width + min_dim) // 2
    bottom = (height + min_dim) // 2
    
    # Crop to square
    img_square = img.crop((left, top, right, bottom))
    
    # Resize and save 512x512
    icon_512 = img_square.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(output_dir, "icon-512.png"))
    print(f"Created {os.path.join(output_dir, 'icon-512.png')}")
    
    # Resize and save 192x192
    icon_192 = img_square.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(os.path.join(output_dir, "icon-192.png"))
    print(f"Created {os.path.join(output_dir, 'icon-192.png')}")
    
except Exception as e:
    print(f"Error processing image: {e}")
