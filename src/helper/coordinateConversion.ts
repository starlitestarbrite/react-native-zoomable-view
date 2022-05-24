import { Size2D, Vec2D } from 'src/typings';

/**
 * Assuming you have an image that's being resized to fit into a container
 * using the "contain" resize mode. You can use this function to calculate the
 * size of the image after fitting.
 *
 * Since our sheet is resized in this manner, we need this function
 * for things like pan boundaries and marker placement
 *
 * @param imgSize
 * @param containerSize
 */
export function applyContainResizeMode(
  imgSize: Size2D,
  containerSize: Size2D
): { size: Size2D; scale: number } | { size: null; scale: null } {
  const { width: imageWidth, height: imageHeight } = imgSize;
  const { width: areaWidth, height: areaHeight } = containerSize;
  const imageAspect = imageWidth / imageHeight;
  const areaAspect = areaWidth / areaHeight;

  let newSize;
  if (imageAspect >= areaAspect) {
    // longest edge is horizontal
    newSize = { width: areaWidth, height: areaWidth / imageAspect };
  } else {
    // longest edge is vertical
    newSize = { width: areaHeight * imageAspect, height: areaHeight };
  }

  if (isNaN(newSize.height)) newSize.height = areaHeight;
  if (isNaN(newSize.width)) newSize.width = areaWidth;

  const scale = imageWidth
    ? newSize.width / imageWidth
    : newSize.height / imageHeight;

  if (!isFinite(scale)) return { size: null, scale: null };

  return {
    size: newSize,
    scale,
  };
}

export interface TransformSubjectData {
  originalWidth: number;
  originalHeight: number;
  offsetX: number;
  offsetY: number;
  zoomLevel: number;
}

export const defaultTransformSubjectData: TransformSubjectData = {
  offsetX: 0,
  offsetY: 0,
  zoomLevel: 0,
  originalWidth: 0,
  originalHeight: 0,
};

/**
 * get the coord of sheet's origin relative to the transformSubject
 * @param resizedImageSize
 * @param transformSubject
 */
function getSheetOriginOnTransformSubject(
  resizedImageSize: Size2D,
  transformSubject: TransformSubjectData
) {
  const {
    offsetX,
    offsetY,
    zoomLevel: scale,
    originalWidth: transformSubjectOriginalWidth,
    originalHeight: transformSubjectOriginalHeight,
  } = transformSubject;
  return {
    x:
      offsetX * scale +
      transformSubjectOriginalWidth / 2 -
      (resizedImageSize.width / 2) * scale,
    y:
      offsetY * scale +
      transformSubjectOriginalHeight / 2 -
      (resizedImageSize.height / 2) * scale,
  };
}

/**
 * Translates the coord system of a point from the transformSubject's space to the sheet's space
 * TODO: Move this into react-native-zoomable-view.
 *
 * @param pointOnContainer
 * @param sheetImageSize
 * @param transformSubject
 *
 * @return {Vec2D} returns null if point is out of the sheet's bound
 */
export function convertPointOnTransformSubjectToPointOnImage({
  pointOnTransformSubject,
  sheetImageSize,
  transformSubject,
}: {
  pointOnTransformSubject: Vec2D;
  sheetImageSize: Size2D;
  transformSubject: TransformSubjectData;
}): Vec2D | null {
  const { size: resizedImgSize, scale: resizedImgScale } =
    applyContainResizeMode(sheetImageSize, {
      width: transformSubject.originalWidth,
      height: transformSubject.originalHeight,
    }) || {};

  if (resizedImgScale == null || resizedImgSize == null) return null;

  const sheetOriginOnContainer = getSheetOriginOnTransformSubject(
    resizedImgSize,
    transformSubject
  );

  const pointOnSheet = {
    x:
      (pointOnTransformSubject.x - sheetOriginOnContainer.x) /
      transformSubject.zoomLevel /
      resizedImgScale,
    y:
      (pointOnTransformSubject.y - sheetOriginOnContainer.y) /
      transformSubject.zoomLevel /
      resizedImgScale,
  };

  if (
    pointOnSheet.x < 0 ||
    pointOnSheet.x > sheetImageSize.width ||
    pointOnSheet.y < 0 ||
    pointOnSheet.y > sheetImageSize.height
  )
    return null;

  return pointOnSheet;
}
