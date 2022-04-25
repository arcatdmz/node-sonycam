/**
 * JPEG header information
 */
export interface JpegHeader {
  progressive: boolean;
  bitDepth: number;
  height: number;
  width: number;
  components: number;
}
