# Phi Ta Khon Detector - Roboflow Training Summary

Source: Roboflow project `019s-workspace-0lfnd/pee-ta-khon-h4wug`, version `2`

## Dataset

- Project images: 311 images
- Split: train 219, validation 61, test 31
- Class: `pee-ta-khon`
- Annotated objects for class `pee-ta-khon`: 317
- Roboflow version images after augmentation: 2,282 images
- Version split after augmentation: train 2,190, validation 61, test 31

## Model

- Model type: YOLOv11 Object Detection (X Large), `yolov11x`
- Pretrained checkpoint: COCOx
- Target epochs: 300
- Finished epochs: 85
- Input preprocessing: auto-orient, resize/stretch to 640x640
- Augmentation: horizontal flip, vertical flip, crop up to 30%, brightness +/-15%, blur 2.4px, 10 image versions

## Main Metrics

- Validation mAP@50: 98.14%
- Validation mAP@50-95: 61.62%
- Validation precision: 95.01%
- Validation recall: 95.15%
- Test mAP@50: 92.93%
- Test mAP@50-95: 54.71%
- Test precision: 96.07%
- Test recall: 90.63%
- Roboflow model evaluation confidence threshold: 0.60
- Roboflow model evaluation F1: 93.8%

## Limitation Note

This model is still experimental because the train/validation/test dataset has only 311 original images and one object class. It may fail on group photos, very small masks, side-angle masks, unusual lighting, or images that differ strongly from the training distribution.
