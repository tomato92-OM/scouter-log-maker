const controls = {
    charName: document.getElementById('char-name'),
    charImage: document.getElementById('char-image'),
    imagePreview: document.getElementById('image-preview'),
    bgColor: document.getElementById('bg-color'),
    textColor: document.getElementById('text-color'),
    highlightColor: document.getElementById('highlight-color'),
    fontSize: document.getElementById('font-size'),
    containerWidth: document.getElementById('container-width'),
    lineHeight: document.getElementById('line-height'),
    letterSpacing: document.getElementById('letter-spacing'),
    logHeight: document.getElementById('log-height'),
    fontSelect: document.getElementById('font-select'),
    customFontUrl: document.getElementById('custom-font-url'),
    customFontFamily: document.getElementById('custom-font-family'),
    chatInput: document.getElementById('chat-input'),
    htmlOutput: document.getElementById('html-output'),
    narrItalic: document.getElementById('narr-italic'),
    narrQuote: document.getElementById('narr-quote'),
    speechBold: document.getElementById('speech-bold'),
    fileName: document.getElementById('file-name')
};
const buttons = {
    clearImage: document.getElementById('clear-image-btn'),
    upload: document.getElementById('upload-btn'),
    savePreset: document.getElementById('save-preset-btn'),
    loadPreset: document.getElementById('load-preset-btn'),
    resetAll: document.getElementById('reset-all-btn'),
    applyStyle: document.getElementById('apply-style-btn'),
    generate: document.getElementById('generate-btn'),
    addToLog: document.getElementById('add-to-log-btn'),
    copy: document.getElementById('copy-btn'),
    save: document.getElementById('save-btn'),
    import: document.getElementById('import-btn')
};
const presetFileInput = document.getElementById('preset-file-input');
const importFileInput = document.getElementById('import-file');
const previewFrame = document.querySelector('#preview-container iframe');

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x400/333/eee&text=IMAGE';
let charImageUrl = PLACEHOLDER_IMAGE;
let currentFullHtml = '';

const RE = {
    escLt: /</g,
    escGt: />/g,
    boldItalic: /\*\*\*(.*?)\*\*\*/g,
    bold: /\*\*(.*?)\*\*/g,
    italic: /\*(.*?)\*/g,
    highlight: /\^(.*?)\^/g,
    spaced: /\$(.*?)\$/g,
    quoted: /"(.*?)"|â€œ(.*?)â€/g
};

function fmt(text) {
    return text
        .replace(RE.escLt, '&lt;').replace(RE.escGt, '&gt;')
        .replace(RE.boldItalic, '<strong><em>$1</em></strong>')
        .replace(RE.bold, '<strong>$1</strong>')
        .replace(RE.italic, '<em>$1</em>')
        .replace(RE.highlight, '<span class="highlight">$1</span>')
        .replace(RE.spaced, '<span class="spaced-out">$1</span>');
}

function narrationClasses() {
    const list = ['narration'];
    if (controls.narrItalic.checked) list.push('italic');
    if (controls.narrQuote.checked) list.push('quoted');
    return list.join(' ');
}

function getFontLinks() {
    const sel = controls.fontSelect.value;
    if (sel === '__custom' && controls.customFontUrl.value.trim()) {
        return `<link href="${controls.customFontUrl.value.trim()}" rel="stylesheet">`;
    }
    const map = {
        'Pretendard': '<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">',
        'Noto Sans KR': '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">',
        'Noto Serif KR': '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&display=swap" rel="stylesheet">',
        'Gowun Dodum': '<link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap" rel="stylesheet">',
        'IBM Plex Sans KR': '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">'
    };
    return map[sel] || '';
}

function getFontFamily() {
    const sel = controls.fontSelect.value;
    if (sel === '__custom') {
        const customFamily = controls.customFontFamily.value.trim();
        if (customFamily) {
            // 사용자가 입력한 폰트 패밀리를 그대로 사용 (따옴표 포함 여부 상관없이)
            return customFamily;
        }
        return "'Noto Sans KR', sans-serif";
    }
    
    // 기본 폰트들의 경우
    const fontMap = {
        'Pretendard': '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        'Noto Sans KR': '"Noto Sans KR", sans-serif',
        'Noto Serif KR': '"Noto Serif KR", serif',
        'Gowun Dodum': '"Gowun Dodum", sans-serif',
        'IBM Plex Sans KR': '"IBM Plex Sans KR", sans-serif'
    };
    
    return fontMap[sel] || '"Noto Sans KR", sans-serif';
}

function buildHead() {
    const fontFamily = getFontFamily();
    
    const css = `
          :root{--main-bg-color:#fff; --sub-bg-color:#fafafa; --main-border-color:#efefef; --sub-border-color:#dbdbdb;
            --main-text-color:${controls.textColor.value}; --sub-text-color:#8e8e8e; --letter-spacing:${controls.letterSpacing.value}em; --image-container-width:40%; --text-container-padding:2rem;}
          body{font-family:${fontFamily}; background:${controls.bgColor.value}; color:${controls.textColor.value};
            font-size:${controls.fontSize.value}px; line-height:${controls.lineHeight.value}; padding:1rem 0; margin:0;}
          .log-container{max-width:${controls.containerWidth.value}px; margin:auto;}
          .instagram{display:block; max-width:100%; margin:0 auto 1rem auto; position:relative; box-sizing:border-box; background:var(--main-bg-color); border:1px solid var(--sub-border-color); border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.08)}
          .instagram__main{display:flex; height:${controls.logHeight.value}px; overflow:hidden;}
          .instagram__left{width:var(--image-container-width); border-right:1px solid var(--main-border-color); flex-shrink:0; display:flex; flex-direction:column}
          .instagram__post-header{display:flex; align-items:center; gap:12px; padding:16px; border-bottom:1px solid var(--main-border-color); height:84px; box-sizing:border-box}
          .instagram__profile{width:42px; height:42px; border-radius:50%; overflow:hidden; flex-shrink:0; background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); padding:2px; display:flex; align-items:center; justify-content:center}
          .instagram__profile-inner{width:38px; height:38px; border-radius:50%; background:#fff; overflow:hidden}
          .instagram__profile-inner img{width:100%; height:100%; object-fit:cover}
          .instagram__user-info{flex:1}
          .instagram__username{font-size:14px; font-weight:bold; color:var(--main-text-color); font-family:${fontFamily}}
          .instagram__menu{font-size:16px; color:#262626; padding:8px}
          .instagram__image-container{flex:1; position:relative; overflow:hidden; background:#f5f5f5}
          .instagram__portrait{width:100%; height:100%}
          .instagram__portrait img{width:100%; height:100%; object-fit:cover}
          .instagram__right{flex:1; display:flex; flex-direction:column; overflow:hidden}
          .instagram__content{flex:1; padding:var(--text-container-padding); overflow-y:auto; color:var(--main-text-color); letter-spacing:var(--letter-spacing); font-family:${fontFamily}}
          .instagram__content p{margin:0 0 .5em 0; white-space:pre-wrap; font-family:${fontFamily}}
          .instagram__content p:last-child{margin-bottom:0}
          .instagram__content::-webkit-scrollbar{width:6px}
          .instagram__content::-webkit-scrollbar-track{background:transparent}
          .instagram__content::-webkit-scrollbar-thumb{background-color:rgba(0,0,0,.2); border-radius:3px}
          .highlight{background-color:${controls.highlightColor.value}}
          .spaced-out{letter-spacing:.2em; display:inline-block}
          .speech{font-weight:${controls.speechBold.checked ? '700' : 'inherit'}; font-family:${fontFamily}}
          .narration{font-family:${fontFamily}}
          .narration.italic{font-style:italic}
          .narration.quoted{padding-left:1em; border-left:3px solid #e0e0e0; color:#8e8e8e}
          @media (max-width:768px){body{padding:0}.log-container{max-width:100%}.instagram{border-radius:0; border-left:0; border-right:0}.instagram__main{flex-direction:column; height:auto}.instagram__left,.instagram__right{width:100%}.instagram__left{border-right:none; border-bottom:1px solid var(--main-border-color)}.instagram__image-container{aspect-ratio:1/1}.instagram__content{min-height:200px; padding:1rem}}
        `;
    return `
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${(controls.charName.value || 'CHARACTER')} Log</title>
${getFontLinks()}
<style>${css}</style>`;
}

function wrapFull(bodyHtml) {
    return `<!DOCTYPE html><html lang="ko"><head>${buildHead()}</head><body><div class="log-container">${bodyHtml}</div><!-- end log-container --></body></html>`;
}

function splitLine(line) {
    const parts = [];
    let last = 0;
    let m;
    RE.quoted.lastIndex = 0;
    while ((m = RE.quoted.exec(line)) !== null) {
        const start = m.index;
        const end = RE.quoted.lastIndex;
        if (start > last) {
            parts.push({
                type: 'narr',
                text: line.slice(last, start)
            });
        }
        const inner = (m[1] !== undefined ? m[1] : m[2]) || '';
        parts.push({
            type: 'dial',
            text: inner
        });
        last = end;
    }
    if (last < line.length) {
        parts.push({
            type: 'narr',
            text: line.slice(last)
        });
    }
    return parts;
}

function buildBlockFromChat() {
    const lines = controls.chatInput.value.split('\n');
    const anyOptionOn = controls.narrItalic.checked || controls.narrQuote.checked || controls.speechBold.checked;
    let html = '';

    for (const line of lines) {
        if (line === '') {
            html += `<br>`;
            continue;
        }
        if (!anyOptionOn) {
            html += `<p>${fmt(line)}</p>`;
            continue;
        }
        const pieces = splitLine(line);
        if (pieces.length === 1 && pieces[0].type === 'narr') {
            html += `<p class="${narrationClasses()}">${fmt(pieces[0].text)}</p>`;
            continue;
        }
        for (const p of pieces) {
            if (p.type === 'narr') {
                const t = p.text;
                if (t.trim() === '') continue;
                html += `<p class="${narrationClasses()}">${fmt(t)}</p>`;
            } else {
                html += `<p class="speech">â€œ${fmt(p.text)}â€</p>`;
            }
        }
    }
    const profileImgTag = `<img src="${charImageUrl}" alt="${controls.charName.value || 'CHARACTER'}">`;
    return `
<div class="instagram">
  <div class="instagram__main">
    <div class="instagram__left">
      <div class="instagram__post-header">
        <div class="instagram__profile"><div class="instagram__profile-inner">${profileImgTag}</div></div>
        <div class="instagram__user-info"><div class="instagram__username">${controls.charName.value || 'CHARACTER'}</div></div>
        <div class="instagram__menu">â‹¯</div>
      </div>
      <div class="instagram__image-container"><div class="instagram__portrait">${profileImgTag}</div></div>
    </div>
    <div class="instagram__right"><div class="instagram__content">${html}</div></div>
  </div>
</div>`;
}

function updatePreviewFromBody(bodyHtml) {
    currentFullHtml = wrapFull(bodyHtml);
    
    // iframe이 완전히 로드된 후 폰트가 적용되도록 약간의 지연 추가
    requestAnimationFrame(() => {
        previewFrame.removeAttribute('src');
        previewFrame.srcdoc = currentFullHtml;
        
        // iframe 로드 완료 후 폰트 재적용을 위한 추가 처리
        previewFrame.onload = () => {
            setTimeout(() => {
                try {
                    const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                    const fontFamily = getFontFamily();
                    
                    // CSS를 통해 폰트 강제 적용
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        body, .instagram__content, .instagram__content p, 
                        .instagram__username, .speech, .narration {
                            font-family: ${fontFamily} !important;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                } catch (e) {
                    // Cross-origin 오류 방지를 위한 예외 처리
                    console.log('Font reapplication skipped due to cross-origin restrictions');
                }
            }, 500); // 500ms 후 폰트 재적용
        };
    });
}

function generateNewLog() {
    const block = buildBlockFromChat();
    controls.htmlOutput.value = block;
    updatePreviewFromBody(block);
}

function addToLog() {
    const block = buildBlockFromChat();
    if (!currentFullHtml) {
        updatePreviewFromBody(block);
        controls.htmlOutput.value = block;
        return;
    }
    const m = currentFullHtml.match(/<div class="log-container">([\s\S]*?)<\/div><!-- end log-container -->/);
    const body = m ? m[1] : '';
    const nextBody = body + block;
    controls.htmlOutput.value = block;
    updatePreviewFromBody(nextBody);
}

function applyStyles() {
    const bodyFromTextarea = controls.htmlOutput.value.trim();
    if (bodyFromTextarea) {
        updatePreviewFromBody(bodyFromTextarea);
        return;
    }
    const block = buildBlockFromChat();
    controls.htmlOutput.value = block;
    updatePreviewFromBody(block);
}

buttons.import.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const text = ev.target.result;
        const bodyMatch = text.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
        const bodyInner = bodyMatch ? bodyMatch[1] : text;
        controls.htmlOutput.value = bodyInner;
        updatePreviewFromBody(bodyInner);
    };
    reader.readAsText(file);
    importFileInput.value = '';
});

controls.htmlOutput.addEventListener('input', () => {
    updatePreviewFromBody(controls.htmlOutput.value);
});

document.getElementById('use-custom-font-btn').addEventListener('click', () => {
    if (!controls.customFontUrl.value.trim() || !controls.customFontFamily.value.trim()) {
        // alert() is blocked, use console.log or a custom modal instead.
        console.log('Custom 폰트 URL과 Font Family를 모두 입력해주세요.');
        return;
    }
    controls.fontSelect.value = '__custom';
    applyStyles();
});

buttons.upload.addEventListener('click', () => {
    controls.charImage.click();
});

controls.charImage.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    controls.fileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        charImageUrl = e.target.result;
        controls.imagePreview.src = charImageUrl;
    };
    reader.readAsDataURL(file);
});
buttons.clearImage.addEventListener('click', () => {
    charImageUrl = PLACEHOLDER_IMAGE;
    controls.imagePreview.src = PLACEHOLDER_IMAGE;
    controls.charImage.value = '';
    controls.fileName.value = 'No file chosen';
});

function savePresetToFile() {
    const preset = {
        charName: controls.charName.value,
        bgColor: controls.bgColor.value,
        textColor: controls.textColor.value,
        highlightColor: controls.highlightColor.value,
        fontSize: controls.fontSize.value,
        containerWidth: controls.containerWidth.value,
        lineHeight: controls.lineHeight.value,
        letterSpacing: controls.letterSpacing.value,
        logHeight: controls.logHeight.value,
        fontSelect: controls.fontSelect.value,
        customFontUrl: controls.customFontUrl.value,
        customFontFamily: controls.customFontFamily.value,
        narrItalic: controls.narrItalic.checked,
        narrQuote: controls.narrQuote.checked,
        speechBold: controls.speechBold.checked,
        // BUGFIX: Save image URL to preset
        charImageUrl: charImageUrl
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], {
        type: 'application/json'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(controls.charName.value || 'preset')}_preset.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function loadPresetFromFile() {
    presetFileInput.click();
}
presetFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const s = JSON.parse(e.target.result);
            Object.entries(s).forEach(([k, v]) => {
                if (!(k in controls)) return;
                const el = controls[k];
                if (el.type === 'checkbox') el.checked = !!v;
                else el.value = v;
            });
            
            // BUGFIX: Load image URL from preset
            if (s.charImageUrl) {
                charImageUrl = s.charImageUrl;
                controls.imagePreview.src = charImageUrl;
                controls.fileName.value = '프리셋 이미지';
            } else {
                // If preset has no image, reset to placeholder
                charImageUrl = PLACEHOLDER_IMAGE;
                controls.imagePreview.src = PLACEHOLDER_IMAGE;
                controls.charImage.value = '';
                controls.fileName.value = 'No file chosen';
            }

            applyStyles();
        } catch (err) {
            console.error('잘못된 프리셋 파일입니다.', err);
        }
    };
    reader.readAsText(file);
    presetFileInput.value = '';
});

buttons.copy.addEventListener('click', () => {
    if (!currentFullHtml) {
        return;
    }
    navigator.clipboard.writeText(currentFullHtml).then(() => toast('전체 HTML 코드가 복사되었습니다!'));
});
buttons.save.addEventListener('click', () => {
    if (!currentFullHtml) {
        console.log('저장할 로그가 없습니다.');
        return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([currentFullHtml], {
        type: 'text/html'
    }));
    a.download = `log_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
});

buttons.generate.addEventListener('click', generateNewLog);
buttons.addToLog.addEventListener('click', addToLog);
buttons.applyStyle.addEventListener('click', applyStyles);
buttons.savePreset?.addEventListener('click', savePresetToFile);
buttons.loadPreset?.addEventListener('click', loadPresetFromFile);

// BUGFIX: Activate the reset button
buttons.resetAll?.addEventListener('click', () => {
    // Reloading the page is the simplest and most effective way to reset all settings.
    location.reload();
});


updatePreviewFromBody('<div class="instagram"><div class="instagram__main"><div class="instagram__left"><div class="instagram__post-header"><div class="instagram__profile"><div class="instagram__profile-inner"><img src="https://placehold.co/100x100/333/3f3&text=PREVIEW" alt="Image Preview"></div></div><div class="instagram__user-info"><div class="instagram__username">CHARACTER</div></div></div><div class="instagram__image-container"><div class="instagram__portrait"><img src="https://placehold.co/300x400/333/eee&text=IMAGE" alt="CHARACTER"></div></div></div><div class="instagram__right"><div class="instagram__content"><p>프리뷰 영역입니다. 왼쪽에서 로그를 생성해보세요.</p></div></div></div></div>');

function toast(msg) {
    const t = document.getElementById('toast-message');
    t.textContent = msg;
    t.classList.remove('opacity-0');
    setTimeout(() => t.classList.add('opacity-0'), 1500);
}
