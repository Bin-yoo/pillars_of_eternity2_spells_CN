/* 永恒之柱2 法术表 —— 交互逻辑 */
(function () {
  "use strict";

  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var spells = window.SPELLS || [];

  var board = document.getElementById("board");
  var preview = document.getElementById("preview");
  var previewImg = preview.querySelector("img");
  var previewCap = preview.querySelector(".preview-cap");

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox.querySelector("img");
  var lightboxCap = lightbox.querySelector("figcaption");

  var lastPointer = { x: 0, y: 0 };

  // 路径里的中文/空格 -> 合法 URL
  function enc(p) { return encodeURI(p); }

  /* ---------- 渲染 ---------- */
  function buildBoard() {
    var levels = [];
    for (var i = 0; i < spells.length; i++) {
      if (levels.indexOf(spells[i].level) === -1) levels.push(spells[i].level);
    }
    levels.sort(function (a, b) { return a - b; });

    var frag = document.createDocumentFragment();

    levels.forEach(function (lv) {
      var section = document.createElement("section");
      section.className = "level";

      var mark = document.createElement("div");
      mark.className = "level-mark";
      var markSpan = document.createElement("span");
      markSpan.textContent = ROMAN[lv] || String(lv);
      mark.appendChild(markSpan);
      section.appendChild(mark);

      var grid = document.createElement("div");
      grid.className = "spells";

      spells.filter(function (s) { return s.level === lv; })
        .forEach(function (s) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "spell";
          btn.dataset.name = s.name;
          btn.dataset.detail = s.detail;
          btn.setAttribute("aria-label", s.name);

          var img = document.createElement("img");
          img.className = "icon";
          img.src = enc(s.icon);
          img.alt = s.name;
          img.loading = "lazy";
          img.draggable = false;
          btn.appendChild(img);

          var cap = document.createElement("span");
          cap.className = "cap";
          cap.textContent = s.name;
          btn.appendChild(cap);

          grid.appendChild(btn);
        });

      section.appendChild(grid);
      frag.appendChild(section);
    });

    board.appendChild(frag);
  }

  /* ---------- 悬停预览 ---------- */
  function positionPreview() {
    var pad = 20;
    var r = preview.getBoundingClientRect();
    var x = lastPointer.x + pad;
    var y = lastPointer.y + pad;

    if (x + r.width > window.innerWidth - 8) x = lastPointer.x - pad - r.width;
    if (y + r.height > window.innerHeight - 8) y = lastPointer.y - pad - r.height;

    x = Math.max(8, Math.min(x, window.innerWidth - r.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - r.height - 8));

    preview.style.transform = "translate(" + x + "px," + y + "px)";
  }

  function showPreview(btn) {
    var d = btn.dataset.detail;
    if (preview.dataset.current === d && preview.classList.contains("show")) return;
    preview.dataset.current = d;
    previewImg.src = enc(d);
    previewCap.textContent = btn.dataset.name;
    preview.classList.add("show");
    positionPreview();
  }

  function hidePreview() {
    preview.classList.remove("show");
    preview.dataset.current = "";
  }

  board.addEventListener("mouseover", function (e) {
    var btn = e.target.closest ? e.target.closest(".spell") : null;
    if (btn) showPreview(btn);
  });

  board.addEventListener("mousemove", function (e) {
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
    if (preview.classList.contains("show")) positionPreview();
  });

  board.addEventListener("mouseleave", hidePreview);

  // 图片加载完成后（此前尺寸未知）重新定位
  previewImg.addEventListener("load", function () {
    if (preview.classList.contains("show")) positionPreview();
  });

  /* ---------- 点击放大 ---------- */
  function openLightbox(btn) {
    lightboxImg.src = enc(btn.dataset.detail);
    lightboxCap.textContent = btn.dataset.name;
    lightbox.classList.add("show");
    hidePreview();
  }
  function closeLightbox() {
    lightbox.classList.remove("show");
    lightboxImg.removeAttribute("src");
  }

  board.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".spell") : null;
    if (btn) openLightbox(btn);
  });

  lightbox.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- 启动 ---------- */
  if (spells.length === 0) {
    board.innerHTML = '<p style="padding:40px;text-align:center;color:#d9c07a">' +
      '未找到法术数据（data.js）。请确认与图片目录放在一起。</p>';
  } else {
    buildBoard();
    document.querySelector(".hint").textContent =
      "共 " + spells.length + " 个法术 · 按法术等级排列 · 悬停查看详细图 · 点击放大";
  }
})();
