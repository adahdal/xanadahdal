#!/usr/bin/env python3
"""Strip all metadata (EXIF, XMP, C2PA, IPTC) from images, preserving pixels."""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install dependencies: pip install pillow")
    sys.exit(1)


def strip_metadata(input_path: str, output_path: str) -> None:
    img = Image.open(input_path)
    fmt = img.format or Path(input_path).suffix.lstrip(".").upper()
    if fmt == "JPG":
        fmt = "JPEG"

    # Re-encode without any metadata by creating a fresh image from pixel data
    clean = Image.new(img.mode, img.size)
    clean.putdata(list(img.getdata()))

    save_kwargs = {}
    if fmt == "JPEG":
        save_kwargs["quality"] = 95
        save_kwargs["subsampling"] = 0

    clean.save(output_path, format=fmt, **save_kwargs)

    # Report what was present
    removed = []
    if hasattr(img, "_getexif") and img._getexif():
        removed.append("EXIF")
    if "xmp" in img.info:
        removed.append("XMP")
    if "icc_profile" in img.info:
        removed.append("ICC profile")
    if any(k in img.info for k in ("c2pa", "C2PA")):
        removed.append("C2PA")

    if removed:
        print(f"Removed: {', '.join(removed)}")
    else:
        print("No standard metadata found (image may already be clean, or use ExifTool for deeper scan)")

    print(f"Saved clean image to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Strip all metadata from an image")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output image path")
    args = parser.parse_args()
    strip_metadata(args.input, args.output)


if __name__ == "__main__":
    main()
