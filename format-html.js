import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HTML 파일 읽기
const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 연속된 빈 줄들을 하나의 빈 줄로 통합 (더 강력하게)
content = content.replace(/(\r?\n\s*){3,}/g, '\n\n');

// HTML 태그 사이의 불필요한 빈 줄 정리 (개선된 패턴)
content = content.replace(/>\s*\n\s*\n\s*</g, '>\n<');
content = content.replace(/>\s*\n\s*\n\s*\n\s*</g, '>\n<');

// CSS 속성 사이의 빈 줄 정리 (더 구체적으로)
content = content.replace(/;\s*\n\s*\n/g, ';\n');
content = content.replace(/{\s*\n\s*\n/g, '{\n');
content = content.replace(/\s*\n\s*\n\s*}/g, '\n}');

// 들여쓰기된 CSS 속성 정리
content = content.replace(/\s+\n\s+\n\s+/g, '\n');

// JavaScript 코드 정리
content = content.replace(/;\s*\n\s*\n/g, ';\n');
content = content.replace(/{\s*\n\s*\n/g, '{\n');
content = content.replace(/\s*\n\s*\n\s*}/g, '\n}');

// 주석 주변 정리
content = content.replace(/\*\/\s*\n\s*\n/g, '*/\n');
content = content.replace(/\s*\n\s*\n\s*\/\*/g, '\n/*');

// 파일 쓰기
fs.writeFileSync(htmlPath, content, 'utf8');

console.log('HTML 파일 포맷팅이 완료되었습니다.');
