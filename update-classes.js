import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');

// case2 요소들을 찾아서 consideration-item 클래스 추가
const updated = content.replace(
  /class="overview-question achievement-explanation">• ([^\[])/g,
  'class="overview-question achievement-explanation consideration-item">• $1'
);

fs.writeFileSync('index.html', updated);
console.log('Updated all case2 elements with consideration-item class');
