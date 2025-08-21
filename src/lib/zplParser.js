/**
 * ZPL 언어 파서
 * ZPL 명령어를 파싱하여 바코드 정보를 추출합니다.
 */

export class ZPLParser {
  constructor() {
    this.commands = [];
    this.barcodes = [];
  }

  /**
   * ZPL 코드를 파싱합니다.
   * @param {string} zplCode - 파싱할 ZPL 코드
   * @returns {Array} 파싱된 바코드 정보 배열
   */
  parse(zplCode) {
    this.commands = [];
    this.barcodes = [];
    
    if (!zplCode || typeof zplCode !== 'string') {
      return [];
    }

    console.log('ZPL 파싱 시작:', zplCode);

    // ZPL 명령어를 라인별로 분리
    const lines = zplCode.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentX = 0;
    let currentY = 0;
    let currentBarcodeType = null;
    let currentBarcodeData = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`라인 ${i + 1}:`, line);
      
      // 위치 정보 파싱 (^FO 명령어)
      const foMatch = line.match(/\^FO(\d+),(\d+)/);
      if (foMatch) {
        currentX = parseInt(foMatch[1]) || 0;
        currentY = parseInt(foMatch[2]) || 0;
        console.log(`위치 설정: (${currentX}, ${currentY})`);
      }
      
      // 바코드 타입 파싱
      if (line.includes('^BC')) {
        currentBarcodeType = 'code128';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      } else if (line.includes('^B3')) {
        currentBarcodeType = 'code39';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      } else if (line.includes('^BQ')) {
        currentBarcodeType = 'qr';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      } else if (line.includes('^BX')) {
        currentBarcodeType = 'datamatrix';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      } else if (line.includes('^BE')) {
        currentBarcodeType = 'ean13';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      } else if (line.includes('^BY')) {
        currentBarcodeType = 'upca';
        console.log(`바코드 타입 발견: ${currentBarcodeType}`);
      }
      
      // 바코드 데이터 파싱 (^FD 명령어)
      const fdMatch = line.match(/\^FD(.+?)(?:\^FS|$)/);
      if (fdMatch) {
        currentBarcodeData = fdMatch[1];
        console.log(`바코드 데이터 발견: ${currentBarcodeData}`);
        
        // 바코드 정보 생성
        if (currentBarcodeType && currentBarcodeData) {
          this.createBarcodeInfo(currentBarcodeType, currentBarcodeData, currentX, currentY);
          currentBarcodeType = null;
          currentBarcodeData = null;
        }
      }
    }

    console.log('파싱 완료, 바코드 개수:', this.barcodes.length);
    return this.barcodes;
  }

  /**
   * 바코드 정보를 생성합니다.
   * @param {string} type - 바코드 타입
   * @param {string} data - 바코드 데이터
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   */
  createBarcodeInfo(type, data, x, y) {
    const barcodeInfo = {
      type: type.toUpperCase(),
      data: data,
      x: x,
      y: y,
      width: 2,
      height: 100,
      options: {}
    };

    console.log('바코드 정보 생성:', barcodeInfo);
    this.barcodes.push(barcodeInfo);
  }

  /**
   * 간단한 ZPL 템플릿을 생성합니다.
   * @param {string} type - 바코드 타입
   * @param {string} data - 바코드 데이터
   * @returns {string} ZPL 코드
   */
  generateTemplate(type, data) {
    const templates = {
      code128: `^XA
^FO50,50^BC,100,Y,N,N
^FD${data}^FS
^XZ`,
      code39: `^XA
^FO50,50^B3N,N,100,Y,N
^FD${data}^FS
^XZ`,
      qr: `^XA
^FO50,50^BQN,2,4
^FD${data}^FS
^XZ`,
      datamatrix: `^XA
^FO50,50^BX,N,200,200
^FD${data}^FS
^XZ`,
      ean13: `^XA
^FO50,50^BE,N,100,Y,N
^FD${data}^FS
^XZ`,
      upca: `^XA
^FO50,50^BY,N,100,Y,N
^FD${data}^FS
^XZ`
    };

    return templates[type] || templates.code128;
  }
}

export default ZPLParser;
