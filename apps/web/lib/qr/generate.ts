import QRCode from "qrcode";

export async function generateQrCodeDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720
  });
}
