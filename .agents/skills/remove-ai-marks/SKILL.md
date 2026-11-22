---
name: remove-ai-marks
description: Remove watermarks and AI-generation marks from images. Use this skill whenever the user wants to remove visible watermarks (text overlays, logos, diagonal stamps), strip invisible AI watermarks (C2PA metadata, SynthID signatures, EXIF provenance data), or clean up images downloaded from stock sites, AI generators, or design tools. Triggers on: "remove watermark", "clean up this image", "strip the watermark", "remove the logo overlay", "remove AI marks", "clean AI-generated image", "strip metadata", "remove invisible watermark", "get rid of the stamp on this photo".
---

# Remove AI Marks & Watermarks

This skill covers two distinct problems — visible watermarks and invisible AI marks — and uses different approaches for each.

## Visible Watermarks

Visible watermarks are text, logos, or patterns overlaid on an image. Removal requires inpainting: masking the watermark region and reconstructing the underlying content.

### Quick approach (Pillow + OpenCV)

Install dependencies if needed:

```bash
pip install pillow opencv-python-headless numpy
```

Use `scripts/remove_watermark.py` for straightforward cases (solid-color or semi-transparent text on a uniform background):

```bash
python3 scripts/remove_watermark.py <input_image> <output_image> [--region x1 y1 x2 y2]
```

Without `--region`, the script auto-detects bright semi-transparent overlays. For logos or complex watermarks, pass the bounding box manually.

### When auto-detection fails

If the watermark is integrated into the photo content (not a flat overlay), use OpenCV inpainting:

1. Create a mask: threshold on the watermark color/opacity channel
2. Run `cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)`
3. For high-quality results on complex backgrounds, prefer `cv2.INPAINT_NS`

The `references/inpainting-guide.md` has threshold recipes for common watermark types (white text, gray diagonal, logo corner).

### When inpainting isn't enough

For deeply embedded watermarks (e.g., full-image diagonal repeat patterns), consider:
- Using an AI inpainting API (Stability AI, Adobe Firefly) with the mask
- Cropping the image to avoid the watermark region if the subject allows

## Invisible AI Watermarks

AI-generated images may carry several types of invisible marks:

| Type | What it is | How to remove |
|---|---|---|
| EXIF / XMP metadata | Text fields embedding origin, model, generator | Strip with Pillow or ExifTool |
| C2PA provenance | Cryptographically signed content credentials | Strip the `c2pa` chunk with `c2patool` or Pillow chunk removal |
| SynthID (Google) | Imperceptible pixel-domain watermark | Cannot be removed without degrading image quality; cropping/resizing reduces it |
| Frequency-domain watermarks | Embedded in DCT/wavelet coefficients | Recompression at different quality or slight blur can disrupt them |

### Strip metadata (EXIF / XMP / C2PA)

```bash
python3 scripts/strip_metadata.py <input_image> <output_image>
```

This removes all EXIF, XMP, IPTC, and ICC profile data while preserving pixel content. Safe for PNG, JPEG, and WebP.

### Identify what marks are present

Before removing, inspect what's there:

```bash
python3 -c "
from PIL import Image
from PIL.ExifTags import TAGS
img = Image.open('image.jpg')
info = img._getexif() or {}
for k, v in info.items():
    print(TAGS.get(k, k), ':', str(v)[:80])
print('Format info:', img.info.keys())
"
```

## Workflow

1. Identify what type of mark is present (ask the user or inspect the image)
2. For visible watermarks: run `remove_watermark.py`, show before/after, ask if satisfied
3. For metadata: run `strip_metadata.py`, confirm fields are gone
4. Save output alongside the original (e.g., `photo_clean.jpg` next to `photo.jpg`)
5. Report what was removed and what (if anything) could not be removed

## Limitations to communicate

- SynthID watermarks survive most processing; inform the user
- C2PA removal breaks the cryptographic chain of custody — this is intentional if the goal is privacy
- Inpainting quality depends on background complexity; set expectations before running
