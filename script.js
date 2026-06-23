const works = [
  ["建筑画板-4 3.png","一只猫1","静谧空间"],
  ["未命名作品.png","圣诞快乐2022","日常幻想"],
  ["IMG_0437.jpg","蓝色漫游","角色实验"],
  ["建筑画板-4 1.png","一只猫2","静谧空间"],
  ["IMG_0457.jpg","怪奇朋友","角色实验"],
  ["未命名作品 35 拷贝-chunt.jpg","春光乍泄","海报叙事"],
  ["未命名作品 2.png","虎","日常幻想"],
  ["IMG_0442.jpg","圣诞快乐2021","日常幻想"],
  ["建筑2画板-7-拷贝-6 1.png","一只猫3","静谧空间"],
  ["IMG_0153.jpg","可口可乐","角色实验"],
  ["未命名作品 4.png","华丽的冒险","海报叙事"],
  ["IMG_0441.jpg","在森林聚会","日常幻想"],
  ["未命名作品 21.jpg","王子复仇记","海报叙事"],
  ["未命名作品 6.png","美术课","海报叙事"],
  ["未命名作品 34.png","楚门的世界","海报叙事"],
  ["未命名作品 1.jpg","疗伤之旅","角色实验"],
  ["未命名作品 3.png","牛","海报叙事"],
  ["未命名作品 32.png","蓝色大门","海报叙事"],
  ["IMG_0433.jpg","2022","日常幻想"],
  ["IMG_0450.png","万圣夜","角色实验"],
  ["未命名作品 5.png","给-妳们","海报叙事"],
  ["未命名作品 30.png","爱与死亡与机器人","海报叙事"],
  ["未命名作品 31.jpg","怪奇物语","海报叙事"],
  ["园游会.jpg","园游会","日常幻想"],
  ["兔.jpg","兔","日常幻想"],
  ["新增作品-龙.webp","龙","日常幻想"]
];

const englishTitles = [
  "A Cat 1",
  "Merry Christmas 2022",
  "Blue Wanderer",
  "A Cat 2",
  "Strange Friends",
  "Happy Together",
  "Tiger",
  "Merry Christmas 2021",
  "A Cat 3",
  "Coca-Cola",
  "A Gorgeous Adventure",
  "Forest Gathering",
  "The Prince's Revenge",
  "Art Class",
  "The Truman Show",
  "Healing Journey",
  "Ox",
  "Blue Gate Crossing",
  "2022",
  "Halloween Night",
  "Dear Girl",
  "Love, Death & Robots",
  "Stranger Things",
  "Funfair",
  "Rabbit",
  "Dragon"
];

const chapterDescriptions = [
  "通向月亮升起的地方。",
  "圣诞快乐，大家。",
  "blue blue blue biu......",
  "在大巴扎漫游",
  "一起玩",
  "何宝荣，不如我们重新来过？",
  "虎",
  "",
  "",
  "笑口常开",
  "长长的时间的旅程，充满太多未知的诱惑",
  "",
  "",
  "",
  "这世界一层一层一层",
  "",
  "新年大吉",
  "夏天都快过完了，好像什么事也没有做。",
  "",
  "",
  "野蛮的撕开一切",
  "",
  "",
  "我顶着大太阳 只想为你撑伞",
  "",
  ""
];

const seriesNames = {
  "日常幻想": "Daily Fantasy Vol. I",
  "静谧空间": "Quiet Space Vol. I",
  "角色实验": "Character Studies Vol. I",
  "海报叙事": "Poster Narratives Vol. I"
};

const experience = document.querySelector("#experience");
const deck = document.querySelector("#deck");
const overview = document.querySelector("#overview");
const overviewGrid = document.querySelector("#overviewGrid");
const aboutPanel = document.querySelector("#aboutPanel");
const focusView = document.querySelector("#focusView");
const hoverPreview = document.querySelector("#hoverPreview");
const hoverPreviewImage = document.querySelector("#hoverPreviewImage");
const caption = document.querySelector("#workCaption");
const backdrop = document.querySelector(".backdrop");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = 1;
let startY = 0;
let wheelLock = false;
let openingTimer;
let numberDirection = 0;
let pointerTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let pointerCurrent = { ...pointerTarget };
let hoveringCard = false;
const paletteCache = new Map();

function hasGsap() {
  return window.gsap && !reduceMotion.matches;
}

function prepareGsap() {
  if (!hasGsap()) return;
  document.documentElement.classList.add("gsap-ready");
  gsap.defaults({ ease: "power3.out", duration: .72 });
}

function createDeck() {
  deck.innerHTML = works.map(([file, title], index) => {
    const pileRank = Math.abs(index - current);
    const isPileCard = pileRank <= 3;
    const jitterX = ((index * 17) % 9) - 4;
    const jitterY = ((index * 23) % 7) - 3;
    const rotation = (((index * 29) % 13) - 6) * .34;
    const release = isPileCard ? pileRank : 7 + (index % 5);
    return `
      <button class="art-card${isPileCard ? " pile-card" : ""}" style="--order:${index};--pile-rank:${pileRank};--release:${release};--pile-x:${jitterX}px;--pile-y:${jitterY}px;--pile-rotation:${rotation}deg" type="button" data-index="${index}" aria-label="放大作品：${title}">
        <img src="作品/${file}" alt="${title}" draggable="false">
      </button>
    `;
  }).join("");

  overviewGrid.innerHTML = works.map(([file, title, category], index) => `
    <button class="chapter-row" type="button" data-index="${index}" aria-label="查看章节：${title}">
      <span class="chapter-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="chapter-title">
        <strong>${title}</strong>
        <span>${englishTitles[index]}</span>
      </span>
      <span class="chapter-meta">${seriesNames[category]}<br>${String(index + 1).padStart(2, "0")}:${String(works.length).padStart(2, "0")}</span>
      <span class="chapter-thumb"><img src="作品/${file}" alt=""></span>
    </button>
  `).join("");
}

function relativeIndex(index) {
  let diff = index - current;
  if (diff > works.length / 2) diff -= works.length;
  if (diff < -works.length / 2) diff += works.length;
  return diff;
}

function setCardStyle(card, offset) {
  const abs = Math.abs(offset);
  const visible = abs <= 4;
  const mobile = window.innerWidth <= 760;
  const spread = mobile ? 31 : 32;
  const side = offset % 2 === 0 ? 1 : -1;
  const x = abs === 0 ? 0 : side * abs * (mobile ? 2.1 : 1.35);
  const scale = offset === 0 ? "calc(1 * var(--hover-scale, 1))" : Math.max(.54, .8 - abs * .065);
  const lift = offset === 0 ? " + var(--hover-lift, 0px)" : "";
  const tilt = offset === 0 ? " rotateX(var(--tilt-x)) rotateY(var(--tilt-y))" : "";
  card.style.transform = `translate(-50%, -50%) translate(${x}vw, calc(${offset * spread}vh${lift})) translateZ(${-abs * 165}px) rotateZ(${side * abs * 1.7}deg) scale(${scale})${tilt}`;
  card.style.opacity = visible ? String(offset === 0 ? 1 : Math.max(.06, .5 - abs * .1)) : "0";
  card.style.zIndex = String(12 - abs);
  card.style.pointerEvents = offset === 0 ? "auto" : "none";
  card.classList.toggle("active", offset === 0);
  if (offset !== 0) {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--glare-opacity", "0");
    card.style.setProperty("--hover-scale", "1");
    card.style.setProperty("--hover-lift", "0px");
  }
}

function cleanColor([r, g, b]) {
  const high = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  const center = (high + low) / 2;
  const saturationBoost = high - low < 92 ? 1.75 : 1.38;
  const vivid = value => Math.max(18, Math.min(218, Math.round(center + (value - center) * saturationBoost - 8)));
  let color = [vivid(r), vivid(g), vivid(b)];
  const brightest = Math.max(...color);
  const darkest = Math.min(...color);
  if (brightest > 190 && brightest - darkest < 58) {
    color = color.map(value => Math.round(value * .62));
  }
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function extractPalette(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = 30;
  canvas.height = 30;
  let pixels;
  try {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return [[80, 130, 255], [255, 70, 180], [70, 240, 210]];
  }
  const colors = [];
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const color = [pixels[index], pixels[index + 1], pixels[index + 2]];
      const high = Math.max(...color);
      const low = Math.min(...color);
      const lightness = (high + low) / 2;
      const chroma = high - low;
      if (lightness > 46 && lightness < 220 && chroma > 25) {
        const saturation = chroma / Math.max(1, high);
        colors.push({ color, score: saturation * 1.45 + chroma / 255 + (1 - Math.abs(lightness - 138) / 138) * .25 });
      }
    }
  }
  const fallback = [[157, 168, 179], [181, 177, 170], [136, 151, 163]];
  if (!colors.length) return fallback;
  colors.sort((a, b) => b.score - a.score);
  const selected = [];
  for (const candidate of colors) {
    const distantEnough = selected.every(existing => {
      const distance = candidate.color.reduce((sum, value, channel) => sum + Math.abs(value - existing[channel]), 0);
      return distance > 92;
    });
    if (distantEnough || !selected.length) selected.push(candidate.color);
    if (selected.length === 3) break;
  }
  while (selected.length < 3) selected.push(colors[Math.min(colors.length - 1, selected.length * 4)].color);
  return selected;
}

function applyPalette(colors) {
  const [first, second, third] = colors.map(color => cleanColor(color));
  const mixed = cleanColor([
    Math.round((colors[0][0] + colors[2][0]) / 2),
    Math.round((colors[0][1] + colors[1][1]) / 2),
    Math.round((colors[1][2] + colors[2][2]) / 2)
  ]);
  backdrop.style.setProperty("--cloud-a", first);
  backdrop.style.setProperty("--cloud-b", second);
  backdrop.style.setProperty("--cloud-c", third);
  backdrop.style.setProperty("--cloud-d", mixed);
}

function updateBackdrop() {
  const source = `作品/${works[current][0]}`;
  if (paletteCache.has(source)) return applyPalette(paletteCache.get(source));
  const image = new Image();
  image.onload = () => {
    const colors = extractPalette(image);
    paletteCache.set(source, colors);
    if (`作品/${works[current][0]}` === source) applyPalette(colors);
  };
  image.src = source;
}

function splitText(text) {
  return [...text].map((char, index) => {
    const content = char === " " ? "&nbsp;" : char;
    return `<span class="split-char" style="--char-index:${index}">${content}</span>`;
  }).join("");
}

function render() {
  hoveringCard = false;
  const direction = numberDirection || 1;
  document.querySelectorAll(".art-card").forEach((card, index) => setCardStyle(card, relativeIndex(index)));
  document.querySelectorAll(".chapter-row").forEach((row, index) => row.classList.toggle("current", index === current));
  const [, title, category] = works[current];
  caption.innerHTML = `
    <div class="title-inner">
      <span class="chapter-label">Chapter ${String(current + 1).padStart(2, "0")}</span>
      <strong class="title-main">${splitText(title)}</strong>
      <span class="title-en">${splitText(englishTitles[current])}</span>
      <span class="title-kind">${seriesNames[category]}</span>
      <span class="title-desc">${chapterDescriptions[current]}</span>
    </div>
  `;
  animateCaption(direction);
  const currentNumber = document.querySelector("#currentNumber");
  currentNumber.textContent = String(current + 1).padStart(2, "0");
  currentNumber.classList.remove("roll-up", "roll-down");
  if (numberDirection) {
    void currentNumber.offsetWidth;
    currentNumber.classList.add(numberDirection > 0 ? "roll-up" : "roll-down");
    numberDirection = 0;
  }
  document.querySelector("#totalNumber").textContent = String(works.length).padStart(2, "0");
  updateBackdrop();
}

function animateCaption(direction = 1) {
  if (!hasGsap() || experience.classList.contains("opening")) return;
  const root = caption.querySelector(".title-inner");
  if (!root) return;
  gsap.killTweensOf(root.querySelectorAll("*"));
  const chars = root.querySelectorAll(".split-char");
  const quiet = root.querySelectorAll(".chapter-label, .title-kind, .title-desc");
  gsap.timeline()
    .fromTo(root, { y: 22 * direction, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, 0)
    .fromTo(chars, { y: 18 * direction, opacity: 0 }, { y: 0, opacity: 1, stagger: .014, duration: .42 }, .04)
    .fromTo(quiet, { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: .055, duration: .48 }, .18);
}

function animateOpeningRelease() {
  if (!hasGsap()) return;
  gsap.fromTo(".work-title-wrap, .scroll-cue", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .52, stagger: .07, overwrite: "auto" });
}

function animateOverview(isOpen) {
  if (!hasGsap()) return;
  gsap.killTweensOf([overview, ".overview-top", ".chapter-row"]);
  if (!isOpen) {
    gsap.to(overview.querySelectorAll(".overview-top, .chapter-row"), { y: -10, opacity: 0, duration: .2, stagger: .006, overwrite: "auto" });
    return;
  }
  const rows = overview.querySelectorAll(".chapter-row");
  gsap.set(rows, { y: 24, opacity: 0 });
  gsap.timeline()
    .fromTo(".overview-top", { y: 18, opacity: 0, filter: "blur(8px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: .64 }, 0)
    .to(rows, { y: 0, opacity: 1, duration: .62, stagger: .026 }, .12);
}

function animateAbout(isOpen) {
  if (!hasGsap()) return;
  const pieces = aboutPanel.querySelectorAll(".eyebrow, h2, .about-copy > p, .wechat-block");
  gsap.killTweensOf(pieces);
  if (!isOpen) return;
  gsap.fromTo(pieces, { y: 28, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: .7, stagger: .08, overwrite: "auto" });
}

function animateHoverPreview(isOpen) {
  if (!hasGsap()) return;
  gsap.killTweensOf([hoverPreview, hoverPreviewImage]);
  if (isOpen) {
    gsap.set(hoverPreview, { opacity: 1 });
    gsap.set(hoverPreviewImage, { scale: 1, y: 0 });
  } else {
    gsap.set(hoverPreview, { opacity: 0 });
    gsap.set(hoverPreviewImage, { scale: 1, y: 0 });
  }
}

function finishOpening() {
  experience.classList.remove("opening");
  animateOpeningRelease();
}

function replayOpening() {
  clearTimeout(openingTimer);
  current = 1;
  experience.classList.add("opening");
  render();
  openingTimer = setTimeout(finishOpening, hasGsap() ? 980 : 1650);
}

function move(step) {
  if (aboutPanel.classList.contains("open")) return;
  if (hoverPreview.classList.contains("open")) return;
  finishOpening();
  numberDirection = step;
  current = (current + step + works.length) % works.length;
  render();
}

function openFocus() {
  const [file, title, category] = works[current];
  document.querySelector("#focusImage").src = `作品/${file}`;
  document.querySelector("#focusImage").alt = title;
  document.querySelector("#focusTitle").textContent = title;
  document.querySelector("#focusCategory").textContent = category;
  focusView.classList.add("open");
  focusView.setAttribute("aria-hidden", "false");
}

function closeFocus() {
  focusView.classList.remove("open");
  focusView.setAttribute("aria-hidden", "true");
}

function showHoverPreview() {
  const [file, title] = works[current];
  const source = `作品/${file}`;
  const wasOpen = hoverPreview.classList.contains("open");
  if (hoverPreviewImage.getAttribute("src") !== source) {
    hoverPreviewImage.src = source;
    hoverPreviewImage.alt = title;
  }
  hoverPreview.classList.add("open");
  hoverPreview.setAttribute("aria-hidden", "false");
  experience.classList.add("hovering-preview");
  if (!wasOpen) animateHoverPreview(true);
}

function hideHoverPreview() {
  hoveringCard = false;
  if (hasGsap()) {
    gsap.killTweensOf([hoverPreview, hoverPreviewImage]);
    gsap.set(hoverPreview, { opacity: 0 });
    gsap.set(hoverPreviewImage, { scale: 1, y: 0 });
  }
  hoverPreview.classList.remove("open");
  hoverPreview.setAttribute("aria-hidden", "true");
  experience.classList.remove("hovering-preview");
}

function toggleOverview(force) {
  const isOpen = typeof force === "boolean" ? force : !overview.classList.contains("open");
  overview.classList.toggle("open", isOpen);
  overview.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) toggleAbout(false);
  animateOverview(isOpen);
}

function toggleAbout(force) {
  const isOpen = typeof force === "boolean" ? force : !aboutPanel.classList.contains("open");
  aboutPanel.classList.toggle("open", isOpen);
  aboutPanel.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) toggleOverview(false);
  animateAbout(isOpen);
}

function setPointerTarget(clientX, clientY) {
  pointerTarget = { x: clientX, y: clientY };
  if (!experience.classList.contains("hovering-preview")) {
    backdrop.style.setProperty("--pointer-scale", "1");
  }
}

function updateCardTilt(event) {
  if (experience.classList.contains("opening") || overview.classList.contains("open") || aboutPanel.classList.contains("open") || focusView.classList.contains("open")) {
    hideHoverPreview();
    return;
  }
  const activeCard = document.querySelector(".art-card.active");
  if (!activeCard) return;
  const rect = activeCard.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) {
    hoveringCard = false;
    activeCard.style.setProperty("--tilt-x", "0deg");
    activeCard.style.setProperty("--tilt-y", "0deg");
    activeCard.style.setProperty("--glare-opacity", "0");
    activeCard.style.setProperty("--hover-scale", "1");
    activeCard.style.setProperty("--hover-lift", "0px");
    hideHoverPreview();
    return;
  }
  if (hoveringCard && hoverPreview.classList.contains("open")) return;
  hoveringCard = true;
  showHoverPreview();
  activeCard.style.setProperty("--tilt-x", "0deg");
  activeCard.style.setProperty("--tilt-y", "0deg");
  activeCard.style.setProperty("--glare-opacity", "0");
  activeCard.style.setProperty("--hover-scale", "1");
  activeCard.style.setProperty("--hover-lift", "0px");
}

function animatePointerGlow() {
  if (experience.classList.contains("hovering-preview")) {
    requestAnimationFrame(animatePointerGlow);
    return;
  }
  pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * .12;
  pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * .12;
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const pullX = ((pointerCurrent.x / width) - .5) * 140;
  const pullY = ((pointerCurrent.y / height) - .5) * 120;
  backdrop.style.setProperty("--pointer-x", `${(pointerCurrent.x / width) * 100}%`);
  backdrop.style.setProperty("--pointer-y", `${(pointerCurrent.y / height) * 100}%`);
  backdrop.style.setProperty("--pull-x", `${pullX}px`);
  backdrop.style.setProperty("--pull-y", `${pullY}px`);
  requestAnimationFrame(animatePointerGlow);
}

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const card = event.target.closest(".art-card");
  const chapterRow = event.target.closest(".chapter-row");
  if (action === "home") replayOpening();
  if (action === "overview") toggleOverview();
  if (action === "overview-close") toggleOverview(false);
  if (action === "about") toggleAbout();
  if (action === "about-close") toggleAbout(false);
  if (action === "focus-close" || event.target === focusView) closeFocus();
  if (card) return;
  if (chapterRow) {
    finishOpening();
    numberDirection = Number(chapterRow.dataset.index) >= current ? 1 : -1;
    current = Number(chapterRow.dataset.index);
    render();
    toggleOverview(false);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeFocus(); toggleOverview(false); toggleAbout(false); }
  if (hoverPreview.classList.contains("open")) return;
  if (focusView.classList.contains("open") || overview.classList.contains("open") || aboutPanel.classList.contains("open")) return;
  if (event.key === "ArrowDown") move(1);
  if (event.key === "ArrowUp") move(-1);
});

document.addEventListener("wheel", event => {
  if (hoverPreview.classList.contains("open")) return;
  if (wheelLock || focusView.classList.contains("open") || overview.classList.contains("open") || aboutPanel.classList.contains("open")) return;
  wheelLock = true;
  move(event.deltaY > 0 ? 1 : -1);
  setTimeout(() => { wheelLock = false; }, 550);
}, { passive: true });

document.addEventListener("pointerdown", event => { startY = event.clientY; });
document.addEventListener("pointermove", event => {
  setPointerTarget(event.clientX, event.clientY);
  updateCardTilt(event);
}, { passive: true });
document.addEventListener("pointerleave", () => {
  backdrop.style.setProperty("--pointer-scale", ".72");
  const activeCard = document.querySelector(".art-card.active");
  if (activeCard) {
    activeCard.style.setProperty("--tilt-x", "0deg");
    activeCard.style.setProperty("--tilt-y", "0deg");
    activeCard.style.setProperty("--glare-opacity", "0");
    activeCard.style.setProperty("--hover-scale", "1");
    activeCard.style.setProperty("--hover-lift", "0px");
  }
  hideHoverPreview();
});
document.addEventListener("pointerup", event => {
  setPointerTarget(event.clientX, event.clientY);
  const distance = event.clientY - startY;
  if (Math.abs(distance) > 55 && !hoverPreview.classList.contains("open") && !focusView.classList.contains("open") && !overview.classList.contains("open") && !aboutPanel.classList.contains("open")) {
    move(distance > 0 ? -1 : 1);
  }
});
window.addEventListener("resize", render);

prepareGsap();
createDeck();
render();
replayOpening();
animatePointerGlow();
