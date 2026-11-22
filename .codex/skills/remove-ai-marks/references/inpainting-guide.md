# Inpainting Recipes by Watermark Type

## White semi-transparent text (most stock sites)

```python
# Threshold: pixels brighter than 210 AND with low saturation
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
mask = cv2.inRange(hsv, (0, 0, 210), (180, 30, 255))
```

## Gray diagonal repeat pattern (Adobe Stock, Getty)

```python
# Convert to LAB, isolate lightness channel anomalies
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
# Diagonal patterns show as periodic frequency spikes in FFT
fft = np.fft.fft2(l.astype(float))
# Notch-filter the dominant frequency peaks, then IFFT
```

## Corner logo (transparent PNG overlay)

```python
# If you know the corner: mask bottom-right 15% x 15%
h, w = img.shape[:2]
mask = np.zeros((h, w), dtype=np.uint8)
mask[int(h*0.85):, int(w*0.85):] = 255
```

## Dark semi-transparent overlay (Canva watermark)

```python
# Dark regions with low saturation over otherwise colorful content
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
mask = cv2.inRange(hsv, (0, 0, 0), (180, 50, 80))
```

## Full-image tiled text (Shutterstock style)

These are the hardest. Options:
1. Use `cv2.INPAINT_NS` (Navier-Stokes) — slower but better for large regions
2. Use an AI inpainting service with a generated mask
3. If the watermark is very regular, use FFT notch filtering to attenuate the pattern frequency

## Inpainting radius guide

| Watermark size | inpaintRadius |
|---|---|
| Thin text (<5px) | 3 |
| Medium text/logo | 7 |
| Large logo/banner | 15 |
| Full-region | 21+ (quality degrades) |
