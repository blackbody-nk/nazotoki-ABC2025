// ABC脱出ゲーム 国立天文台2025年特別公開バージョン

function toZoomRect(rectOnFull, zoomRectOnFull) {
  const { x, y, w, h } = rectOnFull;
  const { x: x0, y: y0, w: w0, h: h0 } = zoomRectOnFull;

  return {
    x: (x - x0) / w0,
    y: (y - y0) / h0,
    w: w / w0,
    h: h / h0
  };
}

function makeZoomArea({ id, rectOnFull, bg, hotspots }) {
  return {
    id,
    rect: rectOnFull,
    actions: [{
      type: "openModal",
      modal: {
        bg,
        hotspots
      }
    }]
  };
}

function makeStickerInZoom({ id, rectOnZoom, message }) {
  const isLens = id === "lens";
  const isJupiter = id === "jupiter";
  const isBinoculars = id === "binoculars";
  const isCard1 = id === "card1";
  const isCard2 = id === "card2";
  const isLetter1 = id === "letter1";

  if (isCard1) {
    const itemId = "card1";
    return {
      id: "card1_inZoom",
      rect: rectOnZoom,
      requires: [{ type: "notHasItem", item: itemId }],
      actions: [
        { type: "addItem", item: itemId },
        { type: "message", text: message || "カードを手に入れた。" }
      ]
    };
  }

  if (isLetter1) {
    const itemId = "letter1";
    return {
      id: "letter1_inZoom",
      rect: rectOnZoom,
      requires: [{ type: "notHasItem", item: itemId }],
      actions: [
        { type: "addItem", item: itemId },
        { type: "message", text: message || "手紙を手に入れた。" }
      ]
    };
  }

  if (isLens) {
    const closedImg = `/images/room1/${id}.jpg`;
    const openImg = `/images/room1/${id}_alpha.jpg`;

    return {
      id: `${id}_inZoom`,
      rect: rectOnZoom,
      actions: [
        {
          type: "openModal",
          modal: {
            bg: closedImg,
            hotspots: [
              {
                id: "lens_need_select",
                rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                priority: 0,
                actions: [{ type: "message", text: "何かあやしい。。。" }]
              },
              {
                id: "lens_open_with_binoculars",
                rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                priority: 10,
                requires: [
                  { type: "hasItem", item: "binoculars" },
                  { type: "selectedItem", item: "binoculars" }
                ],
                actions: [
                  { type: "openModal", replace: true, modal: { bg: openImg, hotspots: [] } },
                  { type: "message", text: `双眼鏡を使った。『${message}』がある。` }
                ]
              }
            ]
          }
        }
      ]
    };
  }

  if (isJupiter) {
    const closedImg = `/images/room1/${id}_closed.jpg`;
    const openImg = `/images/room1/${id}_open.jpg`;

    return {
      id: `${id}_inZoom`,
      rect: rectOnZoom,
      actions: [
        {
          type: "openModal",
          modal: {
            bg: closedImg,
            hotspots: [
              {
                id: `${id}_flip`,
                rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                actions: [
                  { type: "openModal", replace: true, modal: { bg: openImg, hotspots: [] } },
                  { type: "message", text: `めくった。『${message}』がある。` }
                ]
              }
            ]
          }
        },
        { type: "message", text: "木星だ" }
      ]
    };
  }

  if (isBinoculars) {
    const itemId = "binoculars";

    const closedImg = `/images/room1/binoculars_closed.jpg`;
    const openImg = `/images/room1/binoculars_open.jpg`;
    const openTakenImg = `/images/room1/binoculars_open_taken.jpg`;

    const openModalNotTaken = {
      bg: openImg,
      hotspots: [
        {
          id: "binoculars_take",
          rect: { x: 0.35, y: 0.42, w: 0.35, h: 0.35 },
          requires: [{ type: "notHasItem", item: itemId }],
          actions: [
            { type: "addItem", item: itemId },
            { type: "openModal", replace: true, modal: { bg: openTakenImg, hotspots: [] } },
            { type: "message", text: "双眼鏡を手に入れた。" }
          ]
        }
      ]
    };

    const closedModalNotTaken = {
      bg: closedImg,
      hotspots: [
        {
          id: "binoculars_open_from_closed",
          rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
          actions: [
            { type: "openModal", replace: true, modal: openModalNotTaken },
            { type: "message", text: "双眼鏡がある。" }
          ]
        }
      ]
    };

    return [
      {
        id: "binoculars_inZoom_notTaken",
        rect: rectOnZoom,
        requires: [{ type: "notHasItem", item: itemId }],
        actions: [
          { type: "openModal", modal: closedModalNotTaken },
          { type: "message", text: "双眼鏡の絵がある。何かありそうだ。。。" }
        ]
      },
      {
        id: "binoculars_inZoom_taken",
        rect: rectOnZoom,
        requires: [{ type: "hasItem", item: itemId }],
        actions: [{ type: "openModal", modal: { bg: openTakenImg, hotspots: [] } }]
      }
    ];
  }

  const openImg = `/images/room1/${id}_open.jpg`;
  return {
    id: `${id}_inZoom`,
    rect: rectOnZoom,
    actions: [
      { type: "message", text: `調べた。『${message}』がある。` },
      { type: "openModal", modal: { bg: openImg, hotspots: [] } }
    ]
  };
}

// 金庫用 helper と modal 関数
function makeSafeButton(id, rect, char) {
  return {
    id,
    rect,
    actions: [{ type: "safeInputAppend", char, maxLength: 4 }]
  };
}

function makeSafeOpenedModal(state) {
  const alreadyTaken = state?.inventory?.includes("goldKey");
  // もし inventory ではなく別の持ち物管理なら、そこに合わせて書き換え

  if (alreadyTaken) {
    return {
      bg: "/images/room1/safe_box_opened.png",
      hotspots: []
    };
  }

  return {
    bg: "/images/room1/safe_box_opened_w_key.png",
    hotspots: [
      {
        id: "take_card2_Key",
        rect: { x: 0.30, y: 0.53, w: 0.18, h: 0.10 },
        actions: [
          { type: "addItem", item: "goldKey" },
          { type: "addItem", item: "card2" },
          {
            type: "openModal",
            replace: true,
            modal: {
              bg: "/images/room1/safe_box_opened.png",
              hotspots: []
            }
          },
          { type: "message", text: "最後の謎のカードと鍵を手に入れた。" }
        ]
      }
    ]
  };
}

function makeSafeLockedModal() {
  return {
    bg: "/images/room1/safe_box_keypad.jpg",
    displayText: (state) => {
      const s = state?.flags?.safeInput || "";
      return (s + "____").slice(0, 4);
    },
    hotspots: [
      // 1段目
      makeSafeButton("safe_1", { x: 0.500, y: 0.465, w: 0.06, h: 0.045 }, "1"),
      makeSafeButton("safe_2", { x: 0.575, y: 0.460, w: 0.06, h: 0.045 }, "2"),
      makeSafeButton("safe_3", { x: 0.647, y: 0.455, w: 0.06, h: 0.045 }, "3"),

      // 2段目
      makeSafeButton("safe_4", { x: 0.503, y: 0.525, w: 0.06, h: 0.045 }, "4"),
      makeSafeButton("safe_5", { x: 0.575, y: 0.523, w: 0.06, h: 0.045 }, "5"),
      makeSafeButton("safe_6", { x: 0.647, y: 0.520, w: 0.06, h: 0.045 }, "6"),

      // 3段目
      makeSafeButton("safe_7", { x: 0.503, y: 0.585, w: 0.06, h: 0.045 }, "7"),
      makeSafeButton("safe_8", { x: 0.575, y: 0.583, w: 0.06, h: 0.045 }, "8"),
      makeSafeButton("safe_9", { x: 0.647, y: 0.580, w: 0.06, h: 0.045 }, "9"),

      // 4段目
      {
        id: "safe_c",
        rect: { x: 0.500, y: 0.645, w: 0.06, h: 0.045 },
        actions: [{ type: "safeInputClear" }]
      },
      makeSafeButton("safe_0", { x: 0.575, y: 0.643, w: 0.06, h: 0.045 }, "0"),
      {
        id: "safe_e",
        rect: { x: 0.647, y: 0.640, w: 0.06, h: 0.045 },
        actions: [
          {
            type: "safeTryUnlock",
            code: "2015", // ←ここを正解に変える
            successModal: () => makeSafeOpenedModal(),
            successMessage: "金庫が開いた。",
            failMessage: "暗証番号が違うようだ。"
          }
        ]
      }
    ]
  };
}


/* =========================
   card1 / letter1 関連
========================= */

function makeCard1FrontModal() {
  return {
    bg: "/images/items/card1_front.png",
    hotspots: [
      {
        id: "card1_flip_to_back",
        rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
        actions: [
          { type: "setFlag", flag: "card1Flipped", value: true },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          { type: "openModal", replace: true, modal: () => makeCard1BackModal() },
          { type: "message", text: "カードを裏返した。" }
        ]
      }
    ]
  };
}

function makeCard1BackModal() {
  return {
    bg: "/images/items/card1_back.png",
    hotspots: [
      {
        id: "card1_flip_to_front",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        priority: 0,
        actions: [
          { type: "setFlag", flag: "card1Flipped", value: false },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          { type: "openModal", replace: true, modal: () => makeCard1FrontModal() },
          { type: "message", text: "カードを表に戻した。" }
        ]
      }
    ]
  };
}

function makeCard1Letter1CombinedModal() {
  return {
    bg: "/images/items/card1_letter1_combined.png",
    hotspots: [
      {
        id: "card1_letter1_separate",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        actions: [
          { type: "setFlag", flag: "card1Flipped", value: true },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          //{ type: "openModal", replace: true, modal: () => makeCard1BackModal() },
          { type: "openModal", replace: true, modal: () => makeLetter1Page2Modal() },
          { type: "message", text: "手紙をカードから外した。" }
        ]
      }
    ]
  };
}

function makeLetter1Page1Modal() {
  return {
    bg: "/images/items/letter_1.png",
    hotspots: [
      {
        id: "letter1_to_page2",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        actions: [
          { type: "setFlag", flag: "letter1Page", value: 2 },
          { type: "openModal", replace: true, modal: () => makeLetter1Page2Modal() },
          { type: "message", text: "次のページを開いた。" }
        ]
      }
    ]
  };
}

//通常の2-3ページ
function makeLetter1Page2Modal() {
  return {
    bg: "/images/items/letter_2-3.jpg",
    hotspots: [
      // 右下クリックで折る
      {
        id: "letter1_fold_corner",
        rect: { x: 0.53, y: 0.75, w: 0.20, h: 0.25 },
        priority: 20,
        actions: [
          { type: "setFlag", flag: "letter1CornerFolded", value: true },
          { type: "openModal", replace: true, modal: () => makeLetter1Page2FoldedModal() },
          { type: "message", text: "手紙の右下を折った。" }
        ]
      },

      // 中央クリックで card1 と合成
      {
        id: "letter1_combine_with_card1",
        rect: { x: 0.30, y: 0.45, w: 0.2, h: 0.25 },

        requires: [
          { type: "hasItem", item: "card1" },
          { type: "flag", flag: "card1Flipped", value: true }
        ],
        priority: 10,
        actions: [
          { type: "setFlag", flag: "card1Letter1Combined", value: true },
          {
            type: "openModal",
            replace: true,
            modal: () => makeCard1Letter1CombinedModal()
          },
          { type: "message", text: "手紙をカードに重ねた。2つの帽子の先に何かヒントがありそうだ・・・" }
        ]
      },

      // 通常クリックで 4 ページへ
      {
        id: "letter1_to_page3",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        priority: 0,
        actions: [
          { type: "setFlag", flag: "letter1Page", value: 3 },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          { type: "openModal", replace: true, modal: () => makeLetter1Page3Modal() },
          { type: "message", text: "さらに次のページを開いた。" }
        ]
      }
    ]
  };
}

// 右下を折った後の2-3ページ->戻す
function makeLetter1Page2FoldedModal() {
  return {
    bg: "/images/items/letter_2-3_nazo3.jpg",
    hotspots: [
      // 右下クリックで折りを戻す
      {
        id: "letter1_unfold_corner",
        rect: { x: 0.53, y: 0.75, w: 0.20, h: 0.25 },
        priority: 20,
        actions: [
          { type: "setFlag", flag: "letter1CornerFolded", value: false },
          { type: "openModal", replace: true, modal: () => makeLetter1Page2Modal() },
          { type: "message", text: "手紙の右下を戻した。" }
        ]
      },

      // 折った状態でも合成可能にするなら残す
      {
        id: "letter1_combine_with_card1_folded",
        rect: { x: 0.30, y: 0.45, w: 0.2, h: 0.3 },
        requires: [
          { type: "hasItem", item: "card1" },
          { type: "flag", flag: "card1Flipped", value: true }
        ],
        priority: 10,
        actions: [
          { type: "setFlag", flag: "card1Letter1Combined", value: true },
          {
            type: "openModal",
            replace: true,
            modal: () => makeCard1Letter1CombinedModal()
          },
          { type: "message", text: "手紙をカードに重ねた。" }
        ]
      },

      // 通常クリックで次ページ
      {
        id: "letter1_folded_to_page3",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        priority: 0,
        actions: [
          { type: "setFlag", flag: "letter1Page", value: 3 },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          { type: "openModal", replace: true, modal: () => makeLetter1Page3Modal() },
          { type: "message", text: "さらに次のページを開いた。" }
        ]
      }
    ]
  };
}

function makeLetter1Page3Modal() {
  return {
    bg: "/images/items/letter_4.png",
    hotspots: [
      {
        id: "letter1_back_to_page1",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        actions: [
          { type: "setFlag", flag: "letter1Page", value: 1 },
          { type: "setFlag", flag: "card1Letter1Combined", value: false },
          { type: "openModal", replace: true, modal: () => makeLetter1Page1Modal() },
          { type: "message", text: "最初のページに戻った。" }
        ]
      }
    ]
  };
}

// * 鏡と手紙

function makeMirrorModal() {
  return {
    bg: "/images/room1/mirror_zoom.jpg",
    hotspots: [
     // 条件を満たすときだけ最優先でこちらが反応
      {
        id: "mirror_combine_letter_folded",
        rect: { x: 0.34, y: 0.355, w: 0.33, h: 0.55 },
        requires: [
          { type: "hasItem", item: "letter1" },
          { type: "selectedItem", item: "letter1" },
          { type: "flag", flag: "letter1CornerFolded", value: true }
        ],
        priority: 10,
        actions: [
          {
            type: "openModal",
            replace: true,
            modal: () => makeMirrorLetterCombinedModal()
          },
          { type: "message", text: "折った手紙を鏡に合わせた。蝶ネクタイが完成したように見える。" }
        ]
      },
         // 上の条件に当てはまらないときはこちら
      {
        id: "mirror_no_letter_fallback",
        rect: { x: 0.34, y: 0.355, w: 0.33, h: 0.55 },
        priority: 0,
        actions: [
          {
            type: "openModal",
            replace: true,
            modal: () => makeMirrorNoLetterModal()
          },
          { type: "message", text: "天井が見える。このままではよくわからない。" }
        ]
      }
    ]
  };
}

function makeMirrorLetterCombinedModal() {
  return {
    bg: "/images/room1/mirror_zoom_letter.png",
    hotspots: [
      {
        id: "mirror_letter_separate",
        rect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 },
        actions: [
          {
            type: "openModal",
            replace: true,
            modal: () => makeMirrorModal()
          },
          { type: "message", text: "手紙を鏡から外した。" }
        ]
      }
    ]
  };
}

function makeMirrorNoLetterModal() {
  return {
    bg: "/images/room1/mirror_zoom_noletter.png",
    hotspots: [
    ]
  };
}

// ★ズームしたい場所（任意rect）をここに追加
const zoomAreasNorth = [
  {
    key: "mitaka",
    rectOnFull: { x: 0.54, y: 0.30, w: 0.31, h: 0.39 },
    bg: "/images/room1/1_north_zoom_mitaka.jpg"
  }
];

// ★北のmitakaポスター（元画像基準の座標）North
const stickersOnNorth = [
  { id: "jupiter", zoomKey: "mitaka", rectOnFull: { x: 0.733, y: 0.529, w: 0.016, h: 0.028 }, message: "イ" },
  { id: "binoculars", zoomKey: "mitaka", rectOnFull: { x: 0.782, y: 0.620, w: 0.025, h: 0.033 }, message: "双眼鏡" },
  { id: "lens", zoomKey: "mitaka", rectOnFull: { x: 0.572, y: 0.615, w: 0.02, h: 0.03 }, message: "α" }
];

// Eastのトレイの場所
const zoomAreasEast = [
  {
    key: "tray",
    rectOnFull: { x: 0.20, y: 0.68, w: 0.055, h: 0.055 },
    bg: "/images/room1/tray.jpg"
  }
];

// ★カード（east元画像=2_east.jpg基準の座標）
const stickersOnEast = [
  { id: "card1", zoomKey: "tray", rectOnFull: { x: 0.234, y: 0.699, w: 0.008, h: 0.009 }, message: "カードを手に入れた" },
  { id: "letter1", zoomKey: "tray", rectOnFull: { x: 0.213, y: 0.699, w: 0.016, h: 0.013 }, message: "手紙を手に入れた" }
];

function buildZoomHotspotsForNorth(zoomKey) {
  const area = zoomAreasNorth.find((z) => z.key === zoomKey);
  if (!area) return [];

  return stickersOnNorth
    .filter((s) => s.zoomKey === zoomKey)
    .flatMap((s) => {
      const hs = makeStickerInZoom({
        id: s.id,
        message: s.message,
        rectOnZoom: toZoomRect(s.rectOnFull, area.rectOnFull)
      });
      return Array.isArray(hs) ? hs : [hs];
    });
}

function buildZoomHotspotsForEast(zoomKey) {
  const area = zoomAreasEast.find((z) => z.key === zoomKey);
  if (!area) return [];

  return stickersOnEast
    .filter((s) => s.zoomKey === zoomKey)
    .flatMap((s) => {
      const hs = makeStickerInZoom({
        id: s.id,
        message: s.message,
        rectOnZoom: toZoomRect(s.rectOnFull, area.rectOnFull)
      });
      return Array.isArray(hs) ? hs : [hs];
    });
}

/* =========================
   アイテム定義
   ※ card1, letter の icon だけ動的化
========================= */

export const items = {
  binoculars: {
    id: "binoculars",
    name: "双眼鏡",
    icon: "/images/items/binoculars.png"
  },

  goldKey: {
    id: "goldKey",
    name: "金の鍵",
    icon: "/images/items/gold_key.png",
    inspect: {
      bg: "/images/items/gold_key.png",
      hotspots: []
    }
  },

  card1: {
    id: "card1",
    name: "最初の謎",
    icon: (state) => {
      const flags = state?.flags || {};

      if (flags.card1Letter1Combined) {
        return "/images/items/card1_letter1_combined.png";
      }
      if (flags.card1Flipped) {
        return "/images/items/card1_back.png";
      }
      return "/images/items/card1_front.png";
    },
    inspect: (state) => {
      const flags = state?.flags || {};

      if (flags.card1Letter1Combined) {
        return makeCard1Letter1CombinedModal();
      }
      if (flags.card1Flipped) {
        return makeCard1BackModal();
      }
      return makeCard1FrontModal();
    }
  },

  card2: {
    id: "card2",
    name: "最後の謎",
    icon: "/images/items/card2.png",
    inspect: {
      bg: "/images/items/card2.png",
      hotspots: []
    }
  },

  letter1: {
    id: "letter1",
    name: "手紙",
    icon: (state) => {
      const flags = state?.flags || {};
      const page = flags.letter1Page || 1;
      const folded = flags.letter1CornerFolded === true;

      if (page === 2 && folded) {
        return "/images/items/letter_2-3_nazo3.jpg";
      }
      if (page === 2) {
        return "/images/items/letter_2-3.jpg";
      }
      if (page === 3) {
        return "/images/items/letter_4.png";
      }
      return "/images/items/letter_1.png";
    },
    inspect: (state) => {
      const flags = state?.flags || {};
      const page = flags.letter1Page || 1;
      const folded = flags.letter1CornerFolded === true;

      if (page === 2) {
        return folded ? makeLetter1Page2FoldedModal() : makeLetter1Page2Modal();
      }
      if (page === 3) return makeLetter1Page3Modal();
      return makeLetter1Page1Modal();
    }
  }
};

const itemId = "binoculars";

const openModalTaken = {
  bg: `/images/room1/binoculars_open_taken.jpg`,
  hotspots: []
};

function makeEdgeNavHotspots(roomId, nav, opts = {}) {
  const w = opts.edgeWidth ?? 0.08;
  const h = opts.edgeHeight ?? 0.12;

  const hs = [];

  if (nav?.left) {
    hs.push({
      id: "edge_nav_left",
      rect: { x: 0, y: 0, w: w, h: 1 },
      actions: [{ type: "goto", room: roomId, view: nav.left }]
    });
  }

  if (nav?.right) {
    hs.push({
      id: "edge_nav_right",
      rect: { x: 1 - w, y: 0, w: w, h: 1 },
      actions: [{ type: "goto", room: roomId, view: nav.right }]
    });
  }

  if (nav?.up) {
    hs.push({
      id: "edge_nav_up",
      rect: { x: 0, y: 0, w: 1, h: h },
      actions: [{ type: "goto", room: roomId, view: nav.up }]
    });
  }

  if (nav?.down) {
    hs.push({
      id: "edge_nav_down",
      rect: { x: 0, y: 1 - h, w: 1, h: h },
      actions: [{ type: "goto", room: roomId, view: nav.down }]
    });
  }

  return hs;
}

export const rooms = {
  room1: {
    id: "room1",
    name: "Room 1",
    views: {
      north: {
        bg: "/images/room1/1_north.jpg",
        nav: { left: "west", right: "east", up: "ceiling" },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { left: "west", right: "east", up: "ceiling" }),

          ...zoomAreasNorth.map((z) =>
            makeZoomArea({
              id: `zoom_${z.key}`,
              rectOnFull: z.rectOnFull,
              bg: z.bg,
              hotspots: buildZoomHotspotsForNorth(z.key)
            })
          ),

          {
            id: "doorLocked",
            rect: { x: 0.13, y: 0.27, w: 0.15, h: 0.61 },
            requires: [{ type: "notHasItem", item: "goldKey" }],
            actions: [{ type: "message", text: "扉は鍵がかかっている。" }]
          },
          {
            id: "doorNeedSelectKey",
            rect: { x: 0.13, y: 0.27, w: 0.15, h: 0.61 },
            requires: [
              { type: "hasItem", item: "goldKey" },
              { type: "notSelectedItem", item: "goldKey"}
            ],
            actions: [{ type: "message", text: "鍵を選んで開きそうだ。" }]
          },
          {
            id: "doorOpen",
            rect: { x: 0.13, y: 0.27, w: 0.15, h: 0.61 },
            requires: [
              { type: "hasItem", item: "goldKey" },
              { type: "selectedItem", item: "goldKey" }
            ],
            actions: [
              { type: "message", text: "鍵を使って扉を開けた。" },
              { type: "goto", room: "room2", view: "south" }
            ]
          }
        ]
      },

      east: {
        bg: "/images/room1/2_east.jpg",
        nav: { left: "north", right: "south", up: "ceiling"  },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { left: "north", right: "south", up: "ceiling"  }),

          ...zoomAreasEast.map((z) =>
            makeZoomArea({
              id: `zoom_${z.key}`,
              rectOnFull: z.rectOnFull,
              bg: z.bg,
              hotspots: buildZoomHotspotsForEast(z.key)
            })
          ),

          {
            id: "poster_bio",
            rect: { x: 0.10, y: 0.352, w: 0.09, h: 0.21 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/hint_poster4.jpg",
                  hotspots: []
                }
              },
              { type: "message", text: "ポスターだ。" }
            ]
          },

          {
            id: "venus",
            rect: { x: 0.1, y: 0.69, w: 0.035, h: 0.04 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/venus_closed.jpg",
                  hotspots: [
                    {
                      id: "venus_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/venus_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『ト』がある。" }
                      ]
                    }
                  ]
                }
              },
              { type: "message", text: "金星だ" }
            ]
          },

          {
            id: "moon",
            rect: { x: 0.303, y: 0.394, w: 0.04, h: 0.073 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/moon_closed.jpg",
                  hotspots: [
                    {
                      id: "moon_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/moon_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『δ』がある。" }
                      ]
                    }
                  ]
                }
              }
            ]
          },

          {
            id: "marcury",
            rect: { x: 0.478, y: 0.51, w: 0.042, h: 0.074 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/mercury_closed.jpg",
                  hotspots: [
                    {
                      id: "mercury_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/mercury_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『アス』がある。" }
                      ]
                    }
                  ]
                }
              },
              { type: "message", text: "水星だ" }
            ]
          },

          {
            id: "saturn",
            rect: { x: 0.62, y: 0.695, w: 0.042, h: 0.03 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/saturn_closed.jpg",
                  hotspots: [
                    {
                      id: "saturn_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/saturn_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『オ』がある。" }
                      ]
                    }
                  ]
                }
              },
              { type: "message", text: "土星だ" }
            ]
          },

          {
            id: "pluto",
            rect: { x: 0.795, y: 0.498, w: 0.042, h: 0.074 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/pluto_closed.jpg",
                  hotspots: [
                    {
                      id: "pluto_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/pluto_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『β』がある。" }
                      ]
                    }
                  ]
                }
              },
              { type: "message", text: "冥王星だ" }
            ]
          },

          {
            id: "safe_box_locked",
            rect: { x: 0.849, y: 0.62, w: 0.105, h: 0.095 },
            requires: [{ type: "flag", flag: "safeUnlocked", value: false }],
            actions: [
              {
                type: "openModal",
                modal: () => makeSafeLockedModal()
              },
              { type: "message", text: "金庫だ。暗証番号が必要そうだ。" }
            ]
          },
          {
            id: "safe_box_opened",
            rect: { x: 0.849, y: 0.62, w: 0.105, h: 0.095 },
            requires: [{ type: "flag", flag: "safeUnlocked", value: true }],
            actions: [
              {
                type: "openModal",
                modal: (state) => makeSafeOpenedModal(state)
              },
              { type: "message", text: "開いた金庫だ。" }
            ]
          }
        ]
      },

      south: {
        bg: "/images/room1/3_south.jpg",
        nav: { left: "east", right: "west", up: "ceiling"  },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { left: "east", right: "west", up: "ceiling"  }),
          {
            id: "windowMsg",
            rect: { x: 0.34, y: 0.25, w: 0.31, h: 0.45 },
            actions: [{ type: "message", text: "外が見える。特に変わったものはない。" }]
          },
          {
            id: "TVMsg",
            rect: { x: 0.73, y: 0.6, w: 0.24, h: 0.30 },
            actions: [{ type: "message", text: "テレビだ。特に変わったものはない。" }]
          },
          {
            id: "poster_spec",
            rect: { x: 0.725, y: 0.32, w: 0.09, h: 0.21 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/hint_poster2.jpg",
                  hotspots: []
                }
              },
              { type: "message", text: "ポスターだ。" }
            ]
          },
          {
            id: "mars",
            rect: { x: 0.183, y: 0.34, w: 0.047, h: 0.085 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/mars_closed.jpg",
                  hotspots: [
                    {
                      id: "mars_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/mars_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『バ』がある。" }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      },

      west: {
        bg: "/images/room1/4_west.jpg",
        nav: { left: "south", right: "north", up: "ceiling"  },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { left: "south", right: "north", up: "ceiling"  }),

          {
            id: "poster_intro",
            rect: { x: 0.78, y: 0.26, w: 0.17, h: 0.45 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/intro.png",
                  hotspots: []
                }
              }
            ]
          },
          {
            id: "poster_abc",
            rect: { x: 0.65, y: 0.37, w: 0.08, h: 0.20 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/hint_poster1.jpg",
                  hotspots: []
                }
              },
              { type: "message", text: "ポスターだ。今日はABCの研究紹介はやっていないようだ。" }
            ]
          },
          {
            id: "poster_leaf",
            rect: { x: 0.25, y: 0.40, w: 0.08, h: 0.20 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/hint_poster3.jpg",
                  hotspots: []
                }
              },
              { type: "message", text: "ポスターだ。" }
            ]
          },
          {
            id: "mirror",
            rect: { x: 0.43, y: 0.44, w: 0.12, h: 0.20 },
            actions: [
              {
                type: "openModal",
                modal: () => makeMirrorModal()
              },
              { type: "message", text: "鏡だ。" }
            ]
          },
          {
            id: "earth",
            rect: { x: 0.747, y: 0.66, w: 0.027, h: 0.05 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/earth_closed.jpg",
                  hotspots: [
                    {
                      id: "earth_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/earth_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『ロ』がある。" }
                      ]
                    }
                  ]
                }
              }
            ]
          },

          {
            id: "neptune",
            rect: { x: 0.467, y: 0.69, w: 0.031, h: 0.057 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/neptune_closed.jpg",
                  hotspots: [
                    {
                      id: "neptune_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/neptune_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『ジー』がある。" }
                      ]
                    }
                  ]
                }
              }
            ]
          },

          {
            id: "uranus",
            rect: { x: 0.213, y: 0.655, w: 0.032, h: 0.057 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room1/uranus_closed.jpg",
                  hotspots: [
                    {
                      id: "uranus_flip",
                      rect: { x: 0.1, y: 0, w: 0.8, h: 1 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room1/uranus_open.jpg", hotspots: [] }
                        },
                        { type: "message", text: "めくった。『ロ』がある。" }
                      ]
                    }
                  ]
                }
              }
            ]
          },

          {
            id: "TVMsg",
            rect: { x: 0.0, y: 0.6, w: 0.14, h: 0.30 },
            actions: [{ type: "message", text: "テレビだ。特に変わったものはない。" }]
          },
        ]
      },

      ceiling: {
        bg: "/images/room1/5_ceiling.jpg",
        nav: { left: "north", right: "south", up: "west", down: "east" },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { left: "north", right: "south", up: "west", down: "east" }),
          {
            id: "ceiling_light",
            rect: { x: 0.448, y: 0.425, w: 0.10, h: 0.15 },
            actions: [{ type: "message", text: "電気だ。特に変わったものはない。" }]
          },
          {
            id: "ceiling_gamma",
            rect: { x: 0.30, y: 0.5, w: 0.02, h: 0.02 },
            actions: [{ type: "message", text: "γ（ガンマ）と書いてある。" }]
          },
          {
            id: "ceiling_theta",
            rect: { x: 0.485, y: 0.25, w: 0.02, h: 0.02 },
            actions: [{ type: "message", text: "θ（シータ）と書いてある。" }]
          },
          {
            id: "ceiling_lambda",
            rect: { x: 0.71, y: 0.765, w: 0.02, h: 0.02 },
            actions: [{ type: "message", text: "λ（ラムダ）と書いてある。" }]
          }
        ]
      }
    }
  },

  room2: {
    id: "room2",
    name: "Room 2",
    views: {
      south: {
        bg: "/images/room2/south.jpg",
        nav: {},
        hotspots: [
          ...makeEdgeNavHotspots("room1", { down: "north" }),
//          {
//            id: "back",
//            rect: { x: 0.02, y: 0.25, w: 0.20, h: 0.50 },
//            actions: [{ type: "goto", room: "room1", view: "north" }]
//          },
          {
            id: "poster",
            rect: { x: 0.78, y: 0.50, w: 0.120, h: 0.40 },
            actions: [
              {
                type: "openModal",
                modal: {
                  bg: "/images/room2/nazo_poster.png",
                  hotspots: [
                    {
                      id: "nazo_back",
                      rect: { x: 0.3, y: 0.05, w: 0.4, h: 0.9 },
                      actions: [
                        {
                          type: "openModal",
                          replace: true,
                          modal: { bg: "/images/room2/nazo_poster_back.png", hotspots: [] }
                        },
                        { type: "message", text: "裏を見た。QRコードがある。" }
                      ]
                    }
                  ]
                }
              },
              { type: "message", text: "ポスターだ" }
            ]
          },

        ]
      }
    }
  }
};