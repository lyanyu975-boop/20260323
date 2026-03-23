let grasses = []; // 儲存水草的陣列
let bubbles = []; // 儲存氣泡的陣列
let fishes = [];  // 儲存小魚的陣列

function setup() {
  createCanvas(windowWidth, windowHeight);

  let colors = ['#264653', '#2a9d8f', '#588157', '#3a5a40', '#a3b18a']; // 飽和度低的綠色系

  // 產生 50 根水草的資料
  for (let i = 0; i < 50; i++) {
    let c = color(random(colors)); // 將 Hex 字串轉換為 p5 Color 物件
    c.setAlpha(random(150, 220));  // 設定透明度 (範圍 0-255)，數值越小越透明

    grasses.push({
      x: random(width),                  // 水草位置隨機，可重疊
      color: c,                          // 使用帶有透明度的顏色
      noiseOffset: random(1000),         // 隨機的搖晃起始點 (方向)
      w: random(30, 60),                 // 線條寬度 30~60
      h: random(height * 0.2, height * 0.66), // 高度隨機，最高不超過視窗 2/3
      speed: random(0.002, 0.02)         // 搖晃速度隨機
    });
  }

  // 產生 40 個氣泡
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(3, 10),
      speed: random(1, 3),
      popY: random(0, height * 0.3), // 設定氣泡破裂的高度 (在畫面頂部 30% 範圍內)
      popping: false,                // 狀態：是否正在破裂
      alpha: 255                     // 用於破裂時的透明度漸變
    });
  }

  // 產生 15 條小魚
  for (let i = 0; i < 15; i++) {
    fishes.push({
      x: random(width),
      y: random(height * 0.3, height - 50), // 魚主要在水草區域活動
      size: random(10, 20),
      speed: random(1, 3) * (random() > 0.5 ? 1 : -1), // 隨機左右方向 (正數向右，負數向左)
      color: color(random(200, 255), random(100, 200), random(50, 100)) // 橘黃色系，對比深藍背景
    });
  }
}

function draw() {
  // 環境光效果：漸層背景 (上方較亮，下方較暗)
  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#184e77'); // 海面光線 (淺深藍)
  gradient.addColorStop(1, '#001d3d'); // 深海 (深藍)
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);

  // 繪製氣泡
  for (let b of bubbles) {
    if (b.popping) {
      // 氣泡破裂效果：變大並淡出
      b.size += 0.5;
      b.alpha -= 10;
      noFill();
      stroke(255, b.alpha);
      strokeWeight(1);
      circle(b.x, b.y, b.size);

      // 當氣泡完全消失後，重置到底部
      if (b.alpha <= 0) {
        b.y = height + 10;
        b.x = random(width);
        b.size = random(3, 10);
        b.speed = random(1, 3);
        b.popping = false;
        b.popY = random(0, height * 0.3);
      }
    } else {
      // 正常上升狀態
      noStroke();
      fill(255, 80); // 半透明白色
      circle(b.x, b.y, b.size);
      b.y -= b.speed;

      // 檢查是否到達破裂高度
      if (b.y < b.popY) {
        b.popping = true;
        b.alpha = 255;
      }
    }
  }

  // 繪製小魚 (在水草之前繪製，這樣會被水草擋住，產生穿梭感)
  for (let f of fishes) {
    // 互動：驚嚇反應
    let d = dist(mouseX, mouseY, f.x, f.y);
    if (d < 120) { // 當滑鼠距離小於 120 時觸發
      let force = 6; // 逃跑的推力
      if (d > 0) {
        // 計算逃跑方向向量並位移
        f.x += ((f.x - mouseX) / d) * force;
        f.y += ((f.y - mouseY) / d) * force;

        // 如果逃跑方向與目前游動方向相反，則讓魚轉頭
        if (((f.x - mouseX) > 0 && f.speed < 0) || ((f.x - mouseX) < 0 && f.speed > 0)) f.speed *= -1;
      }
    }

    // 更新位置
    f.x += f.speed;
    // 加上一點垂直波動，讓游泳更自然
    f.y += sin(frameCount * 0.05 + f.x) * 0.5;

    // 邊界檢查：超出畫面則從另一邊出現
    if (f.speed > 0 && f.x > width + 50) f.x = -50;
    if (f.speed < 0 && f.x < -50) f.x = width + 50;

    push(); // 儲存當前繪圖狀態
    translate(f.x, f.y);
    
    // 如果往左游，翻轉魚身
    if (f.speed < 0) scale(-1, 1);

    fill(f.color);
    noStroke();
    
    // 畫魚身 (橢圓)
    ellipse(0, 0, f.size * 2, f.size);
    // 畫魚尾 (三角形)
    triangle(-f.size, 0, -f.size * 1.6, -f.size / 2, -f.size * 1.6, f.size / 2);
    pop(); // 恢復繪圖狀態
  }

  // 水草參數設定
  let swayDistance = 150;       // 水草搖晃的距離
  let segments = 20;            // 水草的分段數量 (越多越平滑)

  blendMode(BLEND); // 明確設定混合模式，讓透明顏色能正確疊加

  // 遍歷所有水草並繪製
  for (let g of grasses) {
    fill(g.color); // 設定該根水草的顏色
    noStroke();    // 取消邊框，改用填色繪製形狀

    let startX = g.x;  // 使用隨機產生的 X 位置
    let startY = height;
    let weedHeight = g.h; // 使用隨機產生的高度

    // 先計算中軸點
    let points = [];
    for (let i = 0; i <= segments; i++) {
      let progress = i / segments;
      let y = startY - (progress * weedHeight);
      
      // 計算搖晃
      let noiseVal = noise(frameCount * g.speed + i * 0.1 + g.noiseOffset);
      let xOffset = map(noiseVal, 0, 1, -swayDistance, swayDistance);
      let x = startX + xOffset * progress;
      
      points.push({x: x, y: y});
    }

    beginShape();
    // 左側 (由下往上)
    curveVertex(points[0].x - g.w/2, points[0].y); // 控制點
    for (let i = 0; i <= segments; i++) {
      let r = g.w * 0.5 * (1 - i / segments); // 寬度隨高度遞減
      curveVertex(points[i].x - r, points[i].y);
    }
    // 右側 (由上往下)
    for (let i = segments; i >= 0; i--) {
      let r = g.w * 0.5 * (1 - i / segments);
      curveVertex(points[i].x + r, points[i].y);
    }
    curveVertex(points[0].x + g.w/2, points[0].y); // 控制點
    endShape(CLOSE);
  }
}
