const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const resultSection = document.getElementById('resultSection');

// ドラッグ＆ドロップのエフェクト制御
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => { 
    e.preventDefault(); 
    dropZone.classList.add('dragover'); 
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => { 
    e.preventDefault(); 
    dropZone.classList.remove('dragover'); 
  }, false);
});

// ファイルが選択・ドロップされたときの処理
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files));
dropZone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files));

function handleFile(files) {
  const file = files[0];
  if (!file || !file.name.endsWith('.html')) {
    alert('HTMLファイルを選択してください。');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    processHTML(e.target.result);
  };
  reader.readAsText(file);
}

// 分割メインロジック
function processHTML(rawText) {
  // 1. CSS (<style>タグの中身) を抽出して結合
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let cssContent = '';
  let match;
  while ((match = styleRegex.exec(rawText)) !== null) {
    cssContent += match[1].trim() + '\n\n';
  }

  // 2. JS (<script>タグの中身) を抽出して結合
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let jsContent = '';
  while ((match = scriptRegex.exec(rawText)) !== null) {
    jsContent += match[1].trim() + '\n\n';
  }

  // 3. 元のコードから <style> と <script> タグを削除
  let htmlContent = rawText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 4. HTMLの<head>内に外部ファイルを読み込むタグを自動挿入
  if (cssContent.trim() && !htmlContent.includes('style.css')) {
    htmlContent = htmlContent.replace('</head>', '  <link rel="stylesheet" href="style.css">\n</head>');
  }
  if (jsContent.trim() && !htmlContent.includes('script.js')) {
    htmlContent = htmlContent.replace('</body>', '  <script src="script.js"><\/script>\n</body>');
  }

  // 各ボタンへのセットとサイズ表示
  setupDownload('dlHtml', 'htmlSize', htmlContent.trim());
  setupDownload('dlCss', 'cssSize', cssContent.trim());
  setupDownload('dlJs', 'jsSize', jsContent.trim());

  resultSection.style.display = 'block';
}

function setupDownload(btnId, sizeId, content) {
  const btn = document.getElementById(btnId);
  const sizeSpan = document.getElementById(sizeId);
  
  if (!content) {
    btn.classList.add('empty');
    btn.removeAttribute('href');
    sizeSpan.textContent = '中身なし (0 bytes)';
    return;
  }

  btn.classList.remove('empty');
  const blob = new Blob([content], { type: 'text/plain' });
  btn.href = URL.createObjectURL(blob);
  sizeSpan.textContent = `${blob.size} bytes`;
}
