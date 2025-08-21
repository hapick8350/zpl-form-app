/**
 * 바코드 생성기
 * bwip-js와 qrcode를 사용하여 다양한 타입의 바코드를 생성합니다.
 */

import bwipjs from 'bwip-js';
import QRCode from 'qrcode';

export class BarcodeGenerator {
  constructor() {
    this.canvas = null;
  }

  /**
   * 바코드를 생성합니다.
   * @param {Object} barcodeInfo - 바코드 정보
   * @returns {Promise<Object>} 생성된 바코드의 base64 이미지 또는 경고 메시지
   */
  async generateBarcode(barcodeInfo) {
    try {
      // QR 코드는 별도 라이브러리 사용
      if (barcodeInfo.type.toUpperCase() === 'QR') {
        const dataUrl = await this.generateQRCode(barcodeInfo);
        return {
          type: 'success',
          dataUrl: dataUrl
        };
      }

      // Data Matrix는 더 보수적인 설정으로 처리
      if (barcodeInfo.type.toUpperCase() === 'DATAMATRIX') {
        const dataUrl = await this.generateDataMatrix(barcodeInfo);
        return {
          type: 'success',
          dataUrl: dataUrl
        };
      }

      // 다른 바코드 타입은 bwip-js 사용
      return await this.generateBwipBarcode(barcodeInfo);
    } catch (error) {
      console.error('바코드 생성 오류:', error);
      throw new Error(`바코드 생성에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * QR 코드를 생성합니다.
   * @param {Object} barcodeInfo - 바코드 정보
   * @returns {Promise<string>} 생성된 QR 코드의 base64 이미지
   */
  async generateQRCode(barcodeInfo) {
    try {
      const canvas = document.createElement('canvas');
      
      const options = {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'L'
      };

      console.log('QR 코드 생성 옵션:', options);

      await QRCode.toCanvas(canvas, barcodeInfo.data, options);
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('QR 코드 생성 오류:', error);
      throw new Error(`QR 코드 생성에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * Data Matrix 바코드를 생성합니다.
   * @param {Object} barcodeInfo - 바코드 정보
   * @returns {Promise<string>} 생성된 Data Matrix의 base64 이미지
   */
  async generateDataMatrix(barcodeInfo) {
    try {
      const canvas = document.createElement('canvas');
      
      const options = {
        bcid: 'datamatrix',
        text: barcodeInfo.data,
        scale: 1, // 스케일을 1로 줄임
        height: 50, // 높이를 50으로 줄임
        width: 50, // 너비도 50으로 줄임
        includetext: false, // 텍스트 제외하여 정사각형 유지
        backgroundcolor: 'FFFFFF',
        padding: 3 // 패딩도 줄임
      };

      console.log('Data Matrix 생성 옵션:', options);

      await bwipjs.toCanvas(canvas, options);
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Data Matrix 생성 오류:', error);
      // Data Matrix 생성 실패 시 Code 128로 대체
      console.log('Data Matrix 생성 실패, Code 128로 대체');
      const fallbackInfo = {
        ...barcodeInfo,
        type: 'CODE128'
      };
      return await this.generateBwipBarcode(fallbackInfo);
    }
  }

  /**
   * EAN-13 체크섬을 계산합니다.
   * @param {string} data - 12자리 숫자
   * @returns {string} 13자리 EAN-13 코드 (체크섬 포함)
   */
  calculateEAN13Checksum(data) {
    if (data.length !== 12) {
      return null;
    }
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(data[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    
    const checksum = (10 - (sum % 10)) % 10;
    return data + checksum;
  }

  /**
   * EAN-13 체크섬을 검증하고 수정합니다.
   * @param {string} data - 13자리 숫자
   * @returns {string} 올바른 체크섬이 포함된 13자리 숫자
   */
  validateAndFixEAN13Checksum(data) {
    if (data.length !== 13) {
      return null;
    }
    
    const first12Digits = data.substring(0, 12);
    const currentChecksum = parseInt(data[12]);
    const correctChecksum = parseInt(this.calculateEAN13Checksum(first12Digits)[12]);
    
    if (currentChecksum !== correctChecksum) {
      console.log(`EAN-13 체크섬 수정: ${data} -> ${first12Digits}${correctChecksum}`);
      return first12Digits + correctChecksum;
    }
    
    return data;
  }

  /**
   * UPC-A 체크 디지트를 계산합니다.
   * @param {string} data - 11자리 숫자
   * @returns {string} 체크 디지트가 포함된 12자리 숫자
   */
  calculateUPCACheckDigit(data) {
    if (data.length !== 11) {
      return null;
    }
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(data[i]);
      // UPC-A는 홀수 위치(0부터 시작하므로 짝수 인덱스)에 3을 곱하고, 짝수 위치에 1을 곱함
      sum += digit * (i % 2 === 0 ? 3 : 1);
    }
    
    const remainder = sum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;
    
    return data + checkDigit.toString();
  }

  /**
   * UPC-A 체크 디지트를 검증하고 수정합니다.
   * @param {string} data - 12자리 숫자
   * @returns {string} 올바른 체크 디지트가 포함된 12자리 숫자
   */
  validateAndFixUPCCheckDigit(data) {
    if (data.length !== 12) {
      return null;
    }
    
    const first11Digits = data.substring(0, 11);
    const currentCheckDigit = parseInt(data[11]);
    const correctCheckDigit = parseInt(this.calculateUPCACheckDigit(first11Digits)[11]);
    
    if (currentCheckDigit !== correctCheckDigit) {
      console.log(`UPC-A 체크 디지트 수정: ${data} -> ${first11Digits}${correctCheckDigit}`);
      return first11Digits + correctCheckDigit;
    }
    
    return data;
  }

  /**
   * bwip-js를 사용하여 바코드를 생성합니다.
   * @param {Object} barcodeInfo - 바코드 정보
   * @returns {Promise<Object>} 생성된 바코드의 base64 이미지 또는 경고 메시지
   */
  async generateBwipBarcode(barcodeInfo) {
    const canvas = document.createElement('canvas');
    
    // EAN-13 처리
    let barcodeData = barcodeInfo.data;
    if (barcodeInfo.type.toUpperCase() === 'EAN13') {
      if (barcodeData.length === 12) {
        // 12자리인 경우 체크섬 계산
        barcodeData = this.calculateEAN13Checksum(barcodeData);
        console.log(`EAN-13 체크섬 계산: ${barcodeInfo.data} -> ${barcodeData}`);
      } else if (barcodeData.length === 13) {
        // 13자리인 경우 체크섬 검증 및 수정
        const correctedData = this.validateAndFixEAN13Checksum(barcodeData);
        if (correctedData && correctedData !== barcodeData) {
          console.log(`EAN-13 체크섬 수정됨: ${barcodeData} -> ${correctedData}`);
          barcodeData = correctedData;
        }
      } else {
        // EAN-13 길이가 맞지 않는 경우 경고 메시지 반환
        const warningMessage = `EAN-13 바코드는 12자리 또는 13자리 숫자여야 합니다.\n\n현재 입력: ${barcodeData.length}자리\n입력된 데이터: ${barcodeData}\n\nCode 128 바코드로 대체하여 생성합니다.`;
        console.log('EAN-13 길이 오류, Code 128로 대체');
        return {
          type: 'warning',
          message: warningMessage,
          fallbackType: 'CODE128'
        };
      }
    }

    // UPC-A 처리
    if (barcodeInfo.type.toUpperCase() === 'UPCA') {
      if (barcodeData.length === 11) {
        // 11자리인 경우 체크 디지트 계산
        barcodeData = this.calculateUPCACheckDigit(barcodeData);
        console.log(`UPC-A 체크 디지트 계산: ${barcodeInfo.data} -> ${barcodeData}`);
      } else if (barcodeData.length === 12) {
        // 12자리인 경우 체크 디지트 검증 및 수정
        const correctedData = this.validateAndFixUPCCheckDigit(barcodeData);
        if (correctedData && correctedData !== barcodeData) {
          console.log(`UPC-A 체크 디지트 수정됨: ${barcodeData} -> ${correctedData}`);
          barcodeData = correctedData;
        }
      } else {
        // UPC-A 길이가 맞지 않는 경우 경고 메시지 반환
        const warningMessage = `UPC-A 바코드는 11자리 또는 12자리 숫자여야 합니다.\n\n현재 입력: ${barcodeData.length}자리\n입력된 데이터: ${barcodeData}\n\nCode 128 바코드로 대체하여 생성합니다.`;
        console.log('UPC-A 길이 오류, Code 128로 대체');
        return {
          type: 'warning',
          message: warningMessage,
          fallbackType: 'CODE128'
        };
      }
    }
    
    // 바코드 타입별 설정
    let defaultHeight = 60; // 기본 높이
    let defaultScale = 2; // 기본 스케일
    let defaultPadding = 8; // 기본 패딩
    
    if (barcodeInfo.type.toUpperCase() === 'DATAMATRIX') {
      defaultHeight = 120; // Data Matrix는 정사각형 유지
      defaultScale = 2; // Data Matrix는 적절한 스케일
      defaultPadding = 8; // Data Matrix 패딩
    } else if (barcodeInfo.type.toUpperCase() === 'QR') {
      // QR 코드는 별도 처리 (QR 코드 생성기에서 처리됨)
      return await this.generateQRCode(barcodeInfo);
    }
    
    // 바코드 타입별 특정 옵션 먼저 가져오기
    const typeOptions = this.getTypeSpecificOptions(barcodeInfo);
    
    const options = {
      bcid: this.mapBarcodeType(barcodeInfo.type),
      text: barcodeData,
      scale: typeOptions.scale || defaultScale,
      height: typeOptions.height || barcodeInfo.height || defaultHeight,
      includetext: typeOptions.includetext !== false, // typeOptions에서 false로 명시된 경우에만 텍스트 제외
      textxalign: 'center',
      backgroundcolor: 'FFFFFF',
      padding: typeOptions.padding || defaultPadding
    };

    // 나머지 타입별 옵션 추가
    Object.assign(options, typeOptions);

    console.log('바코드 생성 옵션:', options);

    await bwipjs.toCanvas(canvas, options);
    
    return {
      type: 'success',
      dataUrl: canvas.toDataURL('image/png')
    };
  }

  /**
   * 바코드 타입을 bwip-js 형식으로 매핑합니다.
   * @param {string} type - 바코드 타입
   * @returns {string} bwip-js 바코드 타입
   */
  mapBarcodeType(type) {
    const typeMap = {
      'CODE128': 'code128',
      'CODE39': 'code39',
      'DATAMATRIX': 'datamatrix',
      'EAN13': 'ean13',
      'UPCA': 'upca',
      'EAN8': 'ean8',
      'CODE93': 'code93',
      'ITF14': 'itf14',
      'PDF417': 'pdf417'
    };

    return typeMap[type.toUpperCase()] || 'code128';
  }

  /**
   * 바코드 타입별 특정 옵션을 반환합니다.
   * @param {Object} barcodeInfo - 바코드 정보
   * @returns {Object} 타입별 옵션
   */
  getTypeSpecificOptions(barcodeInfo) {
    const options = {};

    switch (barcodeInfo.type.toUpperCase()) {
      case 'DATAMATRIX':
        options.sizelimit = 1; // 가장 작은 크기 제한
        options.scale = 2; // Data Matrix 스케일 조정
        options.height = 80; // Data Matrix 높이 고정
        break;
      case 'PDF417':
        options.columns = 2;
        options.rows = 10;
        break;
      case 'CODE128':
      case 'CODE39':
      case 'EAN13':
      case 'UPCA':
      case 'EAN8':
      case 'CODE93':
      case 'ITF14':
        // 1차원 바코드: height로 높이 직접 제어, scaleX로 너비 제어
        options.scaleX = 2;          // 가로 스케일 (3 -> 2)
        options.height = 10;         // 바(bar)의 높이를 직접 지정 (15 -> 10)
        options.includetext = false; // 텍스트는 이미지에 포함하지 않음
        break;
    }

    return options;
  }

  /**
   * 여러 바코드를 한 번에 생성합니다.
   * @param {Array} barcodes - 바코드 정보 배열
   * @returns {Promise<Array>} 생성된 바코드 이미지 배열
   */
  async generateMultipleBarcodes(barcodes) {
    const promises = barcodes.map(barcode => this.generateBarcode(barcode));
    return Promise.all(promises);
  }

  /**
   * 바코드 이미지를 다운로드합니다.
   * @param {string} dataUrl - 바코드 이미지 데이터 URL
   * @param {string} filename - 파일명
   */
  downloadBarcode(dataUrl, filename = 'barcode.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 바코드 이미지를 새 창에서 열기
   * @param {string} dataUrl - 바코드 이미지 데이터 URL
   */
  openBarcodeInNewWindow(dataUrl) {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>바코드 이미지</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .barcode-container {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            img { 
              max-width: 100%; 
              height: auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img src="${dataUrl}" alt="바코드" />
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  }
}

export default BarcodeGenerator;
