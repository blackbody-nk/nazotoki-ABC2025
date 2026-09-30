// ===== 任意rectズーム版（このブロックだけを残す） =====

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
        bg,      // ここはそのままだと関数が入る可能性がある
        hotspots
      }
    }]
  };
}


function makeStickerInZoom({ id, rectOnZoom, message }) {
  const isJupiter = id === "jupiter";
  const isBinoculars = id === "binoculars";
  const itemId = "binoculars";

  // ===== 1) jupiter：closed → open（めくる） =====
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
                rect: { x: 0, y: 0, w: 1, h: 1 }, // クリック領域（必要なら調整）
                actions: [
                  { type: "openModal", replace: true, modal: { bg: openImg, hotspots: [] } },
                  { type: "message", text: `めくった。『${message}』がある。` }
                ]
              }
            ]
          }
        }
      ]
    };
  }

  // ===== 2) binoculars：取得＆open_taken =====
if (isBinoculars) {
  const itemId = "binoculars";

  const closedImg = `/images/room1/binoculars_closed.jpg`;
  const openImg = `/images/room1/binoculars_open.jpg`;
  const openTakenImg = `/images/room1/binoculars_open_taken.jpg`;

  // open（未取得）…双眼鏡を押したら取得して taken へ
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

  // closed（未取得）…クリックで open（未取得）へ
  const closedModalNotTaken = {
    bg: closedImg,
    hotspots: [
      {
        id: "binoculars_open_from_closed",
        rect: { x: 0, y: 0, w: 1, h: 1 },
        actions: [{ type: "openModal", modal: openModalNotTaken }]
      }
    ]
  };

  // ★ここがポイント：ズーム画面の同じ場所に「未取得/取得済み」2つのホットスポットを置く
  return [
    {
      id: "binoculars_inZoom_notTaken",
      rect: rectOnZoom,
      requires: [{ type: "notHasItem", item: itemId }],
      actions: [{ type: "openModal", modal: closedModalNotTaken }]
    },
    {
      id: "binoculars_inZoom_taken",
      rect: rectOnZoom,
      requires: [{ type: "hasItem", item: itemId }],
      // 取得済みなら、最初から「双眼鏡が無い画像」を出す
      actions: [{ type: "openModal", modal: { bg: openTakenImg, hotspots: [] } }]
    }
  ];
}

  // ===== 3) その他ステッカー：とりあえず open だけ（必要なら調整） =====
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


// ★ズームしたい場所（任意rect）をここに追加
const zoomAreasNorth = [
  //{
  //  key: "door",
  //  rectOnFull: { x: 0.12, y: 0.25, w: 0.36, h: 0.60 },
  //  bg: "/images/room1/1_north_zoom_wallLeft.jpg"
  //},
  {
    key: "mitaka",
    rectOnFull: { x: 0.54, y: 0.30, w: 0.31, h: 0.39 },
    bg: "/images/room1/1_north_zoom_mitaka.jpg"
  }
];

// ★ステッカー（元画像基準の座標）
const stickersOnNorth = [
//  { id: "jupiter",   zoomKey: "mitaka",  rectOnFull: { x: 0.10, y: 0.25, w: 0.12, h: 0.16 }, message: "イ" },
//  { id: "moon",    zoomKey: "wallLeft",  rectOnFull: { x: 0.26, y: 0.24, w: 0.12, h: 0.16 }, message: "δ" },
//  { id: "mercury", zoomKey: "center",    rectOnFull: { x: 0.42, y: 0.26, w: 0.12, h: 0.16 }, message: "アス" },
//  { id: "saturn",  zoomKey: "wallRight", rectOnFull: { x: 0.58, y: 0.25, w: 0.12, h: 0.16 }, message: "オ" },
  { id: "jupiter",   zoomKey: "mitaka",  rectOnFull: { x: 0.733, y: 0.536, w: 0.016, h: 0.033 }, message: "イ" },
  { id: "binoculars",   zoomKey: "mitaka",  rectOnFull: { x: 0.782, y: 0.650, w: 0.025, h: 0.033 }, message: "双眼鏡" },
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
      // makeStickerInZoom が「単体 or 配列」どっちでも返せるように吸収
      return Array.isArray(hs) ? hs : [hs];
    });
}

//function buildZoomHotspotsForNorth(zoomKey) {
//  const area = zoomAreasNorth.find((z) => z.key === zoomKey);
//  if (!area) return [];
//
//  return stickersOnNorth
//    .filter((s) => s.zoomKey === zoomKey)
//    .map((s) =>
//      makeStickerInZoom({
//        id: s.id,
//        message: s.message,
//        rectOnZoom: toZoomRect(s.rectOnFull, area.rectOnFull)
//      })
//    );
//}

// ===== アイテム定義 =====
export const items = {
  binoculars: {
    id: "binoculars",
    name: "双眼鏡",
    icon: "/images/items/binoculars.png"
//    inspect: {
//      bg: "/images/items/binoculars_big.png"
//    }
  },

  card1: {
    id: "card1",
    name: "最初の謎",
    icon: "/images/items/card1_front.png",
    inspect: {
      bg: "/images/items/card1_front.png",
      back: "/images/items/card1_back.png"
    }
  },
 
  card2: {
    id: "card2",
    name: "最後の謎",
    icon: "/images/items/card2.png",
    inspect: {
      bg: "/images/items/card2.png"
    }
  }
  
};

const itemId = "binoculars";

// 「持ってる時」用：双眼鏡が消えた open
const openModalTaken = {
  bg: `/images/room1/binoculars_open_taken.jpg`,
  hotspots: []
};

export const rooms = {
  room1: {
    id: "room1",
    name: "Room 1",
    views: {
      north: {
          bg: "/images/room1/1_north.jpg",
          nav: { left: "west", right: "east", up: "ceiling", down: "floor" },
          hotspots: [
            // ズーム領域（任意rect）
            ...zoomAreasNorth.map((z) =>
                makeZoomArea({
                    id: `zoom_${z.key}`,
                    rectOnFull: z.rectOnFull,
                    bg: z.bg,
                    hotspots: buildZoomHotspotsForNorth(z.key)
                })
            ),

    // ドアなど通常画面のギミックはそのまま
    {
      id: "doorLocked",
      rect: { x: 0.13, y: 0.27, w: 0.15, h: 0.61 },
      requires: [{ type: "notHasItem", item: "goldKey" }],
      actions: [{ type: "message", text: "扉は鍵がかかっている。" }]
    },
    {
      id: "doorOpen",
      rect: { x: 0.72, y: 0.28, w: 0.20, h: 0.58 },
      requires: [{ type: "hasItem", item: "goldKey" }],
      actions: [
        { type: "message", text: "鍵を使って扉を開けた。" },
        { type: "goto", room: "room2", view: "south" }
      ]
    }
  ]
},

      east: {
        bg: "/images/room1/2_east.jpg",
        nav: { left: "north", right: "south" },
        hotspots: [
        ]
      },
      south: {
        bg: "/images/room1/3_south.jpg",
        nav: { left: "east", right: "west" },
        hotspots: [
          {
            id: "windowMsg",
            rect: { x: 0.34, y: 0.25, w: 0.31, h: 0.45 },
            actions: [{ type: "message", text: "外が見える。特に変わったものはない。" }]
          },
          {
            id: "TVMsg",
            rect: { x: 0.73, y: 0.6, w: 0.24, h: 0.30 },
            actions: [{ type: "message", text: "テレビだ。特に変わったものはない。" }]
          }
        ]
      },
      west: {
        bg: "/images/room1/4_west.jpg",
        nav: { left: "south", right: "north" },
        hotspots: []
      },
      ceiling: {
        bg: "/images/room1/5_ceiling.jpg",
        nav: { down: "north" },
        hotspots: [
          {
            id: "ceilingMsg",
            rect: { x: 0.10, y: 0.10, w: 0.80, h: 0.80 },
            actions: [{ type: "message", text: "天井だ。特に変わったものはない。" }]
          }
        ]
      },
      floor: {
        bg: "/images/room1/floor.jpg",
        nav: {
            up: "north"
        },
        hotspots: []
      }
    },
  },

  room2: {
    id: "room2",
    name: "Room 2",
    views: {
      south: {
        bg: "/images/room2/south.jpg",
        nav: {},
        hotspots: [
          {
            id: "back",
            rect: { x: 0.02, y: 0.25, w: 0.20, h: 0.50 },
            actions: [{ type: "goto", room: "room1", view: "east" }]
          }
        ]
      }
    }
  }
};
