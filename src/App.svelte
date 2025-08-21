<script>
  import { onMount } from 'svelte';
  import ZPLParser from './lib/zplParser.js';
  import BarcodeGenerator from './lib/barcodeGenerator.js';
  import './app.css';

  let zplCode = '';
  let barcodes = [];
  let generatedImages = [];
  let isLoading = false;
  let error = '';
  let selectedTemplate = 'code128';
  let templateData = '';
  let showTemplates = false;
  let showModal = false;
  let modalMessage = '';


  let parser;
  let generator;

  onMount(() => {
    parser = new ZPLParser();
    generator = new BarcodeGenerator();
    
    // 샘플 ZPL 코드 설정
    zplCode = `^XA
^FO50,50^BC,100,Y,N,N
^FD123456789^FS
^XZ`;
  });

  // ZPL 코드 파싱 및 바코드 생성
  async function generateBarcodes() {
    if (!zplCode.trim()) {
      error = 'ZPL 코드를 입력해주세요.';
      return;
    }

    isLoading = true;
    error = '';

    try {
      console.log('입력된 ZPL 코드:', zplCode);
      
      // ZPL 파싱
      barcodes = parser.parse(zplCode);
      console.log('파싱된 바코드:', barcodes);
      
      if (barcodes.length === 0) {
        error = '유효한 바코드 명령어를 찾을 수 없습니다.';
        console.log('바코드를 찾을 수 없음');
        return;
      }

      // 바코드 이미지 생성
      const results = await generator.generateMultipleBarcodes(barcodes);
      
      // 경고 메시지가 있는지 확인 (EAN-13에만 적용)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result && result.type === 'warning' && barcodes[i].type === 'EAN13') {
          modalMessage = result.message;
          showModal = true;
          // 경고 메시지가 있는 바코드는 Code 128로 대체
          barcodes[i].type = result.fallbackType;
        }
      }
      
      // 성공한 결과만 필터링
      generatedImages = results.filter(result => result && result.type === 'success').map(result => result.dataUrl);
      console.log('생성된 이미지:', generatedImages);
    } catch (err) {
      console.error('오류 발생:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  // 템플릿 적용
  function applyTemplate() {
    if (!templateData.trim()) {
      error = '바코드 데이터를 입력해주세요.';
      return;
    }

    zplCode = parser.generateTemplate(selectedTemplate, templateData);
    error = '';
  }

  // 모든 바코드 다운로드
  function downloadAllBarcodes() {
    generatedImages.forEach((image, index) => {
      const barcode = barcodes[index];
      const filename = `${barcode.type}_${barcode.data}.png`;
      generator.downloadBarcode(image, filename);
    });
  }

  // 개별 바코드 다운로드
  function downloadBarcode(image, barcode, index) {
    const filename = `${barcode.type}_${barcode.data}_${index + 1}.png`;
    generator.downloadBarcode(image, filename);
  }

  // 바코드 새 창에서 열기
  function openBarcode(image) {
    generator.openBarcodeInNewWindow(image);
  }

  // ZPL 코드 초기화
  function clearZPL() {
    zplCode = '';
    barcodes = [];
    generatedImages = [];
    error = '';
  }

  // 모달 닫기
  function closeModal() {
    showModal = false;
    modalMessage = '';
  }
</script>

<main>
  <div class="container">
    <!-- 헤더 -->
    <header class="header">
      <h1>🎯 ZPL 바코드 생성기</h1>
      <p>ZPL 언어를 입력하면 바코드 이미지를 자동으로 생성합니다</p>
    </header>

    <div class="content">
      <!-- 입력 섹션 -->
      <section class="input-section">
        <div class="input-group">
          <label for="zpl-input">ZPL 코드 입력</label>
          <textarea
            id="zpl-input"
            bind:value={zplCode}
            placeholder="ZPL 코드를 입력하세요...&#10;&#10;예시:&#10;^XA&#10;^FO50,50^BC,100,Y,N,N&#10;^FD123456789^FS&#10;^XZ"
            rows="8"
          ></textarea>
        </div>

        <div class="button-group">
          <button class="btn btn-primary" on:click={generateBarcodes} disabled={isLoading}>
            {isLoading ? '생성 중...' : '바코드 생성'}
          </button>
          <button class="btn btn-secondary" on:click={clearZPL}>
            초기화
          </button>
          <button class="btn btn-outline" on:click={() => showTemplates = !showTemplates}>
            템플릿 보기
          </button>
        </div>

        {#if error}
          <div class="error-message">{error}</div>
        {/if}
      </section>

      <!-- 템플릿 섹션 -->
      {#if showTemplates}
        <section class="template-section">
          <h3>빠른 템플릿</h3>
          <div class="template-form">
            <div class="form-row">
              <div class="form-group">
                <label for="template-type">바코드 타입</label>
                <select id="template-type" bind:value={selectedTemplate}>
                  <option value="code128">Code 128</option>
                  <option value="code39">Code 39</option>
                  <option value="qr">QR Code</option>
                  <option value="datamatrix">Data Matrix</option>
                  <option value="ean13">EAN-13</option>
                  <option value="upca">UPC-A</option>
                </select>
              </div>
              <div class="form-group">
                <label for="template-data">바코드 데이터</label>
                <input
                  id="template-data"
                  type="text"
                  bind:value={templateData}
                  placeholder="바코드에 포함할 데이터"
                />
              </div>
            </div>
            <button class="btn btn-primary" on:click={applyTemplate}>
              템플릿 적용
            </button>
          </div>
        </section>
      {/if}

      <!-- 결과 섹션 -->
      {#if barcodes.length > 0}
        <section class="results-section">
          <div class="results-header">
            <h3>생성된 바코드 ({barcodes.length}개)</h3>
            <button class="btn btn-success" on:click={downloadAllBarcodes}>
              전체 다운로드
            </button>
          </div>

          <div class="barcodes-grid">
            {#each barcodes as barcode, index}
              <div class="barcode-card">
                <div class="barcode-info">
                  <h4>{barcode.type}</h4>
                  <p class="barcode-data">{barcode.data}</p>
                  <p class="barcode-position">위치: ({barcode.x}, {barcode.y})</p>
                </div>
                
                {#if generatedImages[index]}
                  <div class="barcode-image-container">
                    <img src={generatedImages[index]} alt="바코드" />
                    <p class="barcode-text">{barcode.data}</p>
                  </div>
                  
                  <div class="barcode-actions">
                    <button 
                      class="btn btn-sm btn-outline" 
                      on:click={() => openBarcode(generatedImages[index])}
                    >
                      새 창에서 보기
                    </button>
                    <button 
                      class="btn btn-sm btn-success" 
                      on:click={() => downloadBarcode(generatedImages[index], barcode, index)}
                    >
                      다운로드
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </div>

  <!-- 모달 -->
  {#if showModal}
    <div class="modal-overlay" on:click={closeModal}>
      <div class="modal-content" on:click={(e) => e.stopPropagation()}>
        <h2>경고</h2>
        <p>{modalMessage}</p>
        <button class="btn btn-primary" on:click={closeModal}>확인</button>
      </div>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    color: white;
  }

  .header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .header p {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .input-section {
    margin-bottom: 30px;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.3s ease;
  }

  textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .button-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }



  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #5a6268;
  }

  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline:hover {
    background: #667eea;
    color: white;
  }

  .btn-success {
    background: #28a745;
    color: white;
  }

  .btn-success:hover {
    background: #218838;
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 14px;
  }

  .error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 8px;
    margin-top: 15px;
    border: 1px solid #f5c6cb;
  }

  .template-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .template-section h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .template-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
  }

  .form-group select,
  .form-group input {
    padding: 10px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 14px;
  }

  .form-group select:focus,
  .form-group input:focus {
    outline: none;
    border-color: #667eea;
  }

  .results-section {
    margin-top: 30px;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .results-header h3 {
    color: #333;
    margin: 0;
  }

  .barcodes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .barcode-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .barcode-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .barcode-info h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1.1rem;
  }

  .barcode-data {
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 14px;
    margin: 8px 0;
    word-break: break-all;
  }

  .barcode-position {
    color: #6c757d;
    font-size: 14px;
    margin: 8px 0;
  }

  .barcode-image {
    text-align: center;
    margin: 15px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .barcode-image img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  /* 1차원 바코드 가로 길이 대폭 늘리기 제거 (위에서 처리) */
  .barcode-image img[src*="ean13"],
  .barcode-image img[src*="upca"],
  .barcode-image img[src*="code128"],
  .barcode-image img[src*="code39"],
  .barcode-image img[src*="ean8"],
  .barcode-image img[src*="code93"],
  .barcode-image img[src*="itf14"] {
    /* 개별 스타일 제거 */
  }

  .barcode-image-container {
    text-align: center;
    margin: 15px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .barcode-text {
    margin-top: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #333;
  }


  .barcode-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  /* 모달 스타일 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 90%;
  }

  .modal-content h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.8rem;
  }

  .modal-content p {
    color: #555;
    font-size: 1.1rem;
    margin-bottom: 25px;
    line-height: 1.6;
  }

  .modal-content button {
    padding: 12px 25px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .modal-content button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }

    .content {
      padding: 20px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .button-group {
      flex-direction: column;
      align-items: stretch;
    }



    .results-header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .barcodes-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
