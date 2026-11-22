#!/usr/bin/env python3
"""Remove visible watermarks from images using OpenCV inpainting."""

import argparse
import sys
import numpy as np

try:
    import cv2
    from PIL import Image
except ImportError:
    print("Install dependencies: pip install pillow opencv-python-headless numpy")
    sys.exit(1)


def detect_watermark_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Auto-detect semi-transparent bright overlay (common stock/AI watermarks)."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    # Bright semi-transparent overlays show up as near-white regions
    _, mask = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY)
    # Morphological cleanup to avoid masking highlights
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
    mask = cv2.dilate(mask, kernel, iterations=1)
    return mask


def region_mask(img_bgr: np.ndarray, x1: int, y1: int, x2: int, y2: int) -> np.ndarray:
    mask = np.zeros(img_bgr.shape[:2], dtype=np.uint8)
    mask[y1:y2, x1:x2] = 255
    return mask


def remove_watermark(input_path: str, output_path: str, region: list | None = None) -> None:
    img = cv2.imread(input_path)
    if img is None:
        print(f"Could not read image: {input_path}")
        sys.exit(1)

    if region:
        x1, y1, x2, y2 = region
        mask = region_mask(img, x1, y1, x2, y2)
        print(f"Using manual region: ({x1},{y1}) -> ({x2},{y2})")
    else:
        mask = detect_watermark_mask(img)
        coverage = np.sum(mask > 0) / mask.size * 100
        print(f"Auto-detected mask covers {coverage:.1f}% of image")
        if coverage > 40:
            print("Warning: mask covers >40% of image — consider passing --region manually")

    result = cv2.inpaint(img, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    cv2.imwrite(output_path, result)
    print(f"Saved cleaned image to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Remove visible watermarks via inpainting")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output image path")
    parser.add_argument("--region", nargs=4, type=int, metavar=("X1", "Y1", "X2", "Y2"),
                        help="Bounding box of watermark region")
    args = parser.parse_args()
    remove_watermark(args.input, args.output, args.region)


if __name__ == "__main__":
    main()
