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
  const isLens = id === "lens";
  const isJupiter = id === "jupiter";
  const isBinoculars = id === "binoculars";
  const itemId = "binoculars";

// ===== 0) lens =====
if (isLens) {
  const closedImg = `/images/room1/${id}.jpg`;
  const openImg = `/images/room1/${id}_alpha.jpg`;
  const itemId = "binoculars";

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
            // A) 双眼鏡を「未所持」or「未選択」ならメッセージのみ
              id: "lens_need_select",
              rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
              priority: 0,
              actions: [{ type: "message", text: "何かあやしい。。。" }]
            },
           {
            // A) 双眼鏡を「所持」＋「選択中」なら lens_alpha へ
              id: "lens_open_with_binoculars",
              rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
              priority: 10, // ★こっちを上に
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


  // ===== 1) jupiter：closed → open（めくる） =====
  if (isJupiter) {
    const closedImg = `/images/room1/${id}_closed.jpg`;
    const openImg = `/images/room1/${id}_open.jpg`;

    return {
      id: `${id}_inZoom`,
      rect: rectOnZoom,
      actions: [
        {  type: "openModal",
          modal: {
            bg: closedImg,
            hotspots: [
              {
                id: `${id}_flip`,
                rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, // クリック領域（必要なら調整）
                actions: [
                  { type: "openModal", replace: true, modal: { bg: openImg, hotspots: [] } },
                  { type: "message", text: `めくった。『${message}』がある。` }
                ]
              }
            ]
          }
        },
        {  type: "message", text: `木星だ`}
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
        rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
        actions: [
          { type: "openModal", replace: true, modal: openModalNotTaken },
          { type: "message", text: "双眼鏡がある。" }
        ]
      }
    ]
  };

  // ★ここがポイント：ズーム画面の同じ場所に「未取得/取得済み」2つのホットスポットを置く
  return [
    {
      id: "binoculars_inZoom_notTaken",
      rect: rectOnZoom,
      requires: [{ type: "notHasItem", item: itemId }],
      actions: [
        { type: "openModal", modal: closedModalNotTaken },
        { type: "message", text: "双眼鏡の絵がある。何かありそうだ。。。" },  // ←ここに移す
      ]
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
  {
    key: "mitaka",
    rectOnFull: { x: 0.54, y: 0.30, w: 0.31, h: 0.39 },
    bg: "/images/room1/1_north_zoom_mitaka.jpg"
  }
];


// ★ステッカー（元画像基準の座標）
const stickersOnNorth = [
  { id: "jupiter",   zoomKey: "mitaka",  rectOnFull: { x: 0.733, y: 0.536, w: 0.016, h: 0.033 }, message: "イ" },
  { id: "binoculars",   zoomKey: "mitaka",  rectOnFull: { x: 0.782, y: 0.650, w: 0.025, h: 0.033 }, message: "双眼鏡" },
  { id: "lens",   zoomKey: "mitaka",  rectOnFull: { x: 0.567, y: 0.640, w: 0.03, h: 0.04 }, message: "α" },
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

// 画面端クリックで視点移動する透明ホットスポットを作る
function makeEdgeNavHotspots(roomId, nav, opts = {}) {
  const w = opts.edgeWidth ?? 0.08;   // 左右の幅（0〜1）
  const h = opts.edgeHeight ?? 0.12;  // 上端の高さ（0〜1）

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

  //// 必要なら下端も
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
          nav: { left: "west", right: "east", up: "ceiling", down: "floor" },
          hotspots: [
            ...makeEdgeNavHotspots("room1", { left: "west", right: "east", up: "ceiling", down: "floor" }),

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
        ...makeEdgeNavHotspots("room1", { left: "north", right: "south" }),

        {
          id: "venus",
          rect: { x: 0.1, y: 0.69, w: 0.035, h: 0.04 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/venus_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "venus_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリックするとxが効かない
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/venus_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『ト』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            },
            {  type: "message", text: `金星だ`}

          ]
        },

        {
          id: "moon",
          rect: { x: 0.303, y: 0.394, w: 0.04, h: 0.073 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/moon_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "moon_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/moon_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『δ』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            }
          ]
        },

        {
          id: "marcury",
          rect: { x: 0.478, y: 0.51, w: 0.042, h: 0.074 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/mercury_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "mercury_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/mercury_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『アス』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            },
            {  type: "message", text: `水星だ`}

          ]
        },

        {
          id: "saturn",
          rect: { x: 0.62, y: 0.695, w: 0.042, h: 0.03 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/saturn_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "saturn_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/saturn_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『オ』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            },
            {  type: "message", text: `土星だ`}
          ]
        },

        {
          id: "pluto",
          rect: { x: 0.795, y: 0.498, w: 0.042, h: 0.074 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/pluto_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "pluto_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/pluto_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『β』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            },
            {  type: "message", text: `冥王星だ`}
          ]
        },

        {
          id: "safe_box",
          rect: { x: 0.89, y: 0.61, w: 0.09, h: 0.09 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/safe_box.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "pluto_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/pluto_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『β』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            },
            {  type: "message", text: `金庫だ。暗証番号が必要そうだ。`}
          ]
        },

        ]
      },
      south: {
        bg: "/images/room1/3_south.jpg",
        nav: { left: "east", right: "west" },
        hotspots: [
        ...makeEdgeNavHotspots("room1", { left: "east", right: "west" }),
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
          rect: { x: 0.725, y: 0.32, w: 0.09, h: 0.21 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/hint_poster2.jpg",
                hotspots: [] // 拡大中はクリック判定なし
              }
            },
            {  type: "message", text: `ポスターだ。`}
          ]
        },

        {
          id: "mars",
          rect: { x: 0.183, y: 0.34, w: 0.047, h: 0.085 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/mars_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "mars_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/mars_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『バ』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            }
          ]
        },

        ]
      },
      west: {
        bg: "/images/room1/4_west.jpg",
        nav: { left: "south", right: "north" },
        hotspots: [
        ...makeEdgeNavHotspots("room1", { left: "south", right: "north" }),

        {
          id: "poster_intro",
          rect: { x: 0.78, y: 0.26, w: 0.17, h: 0.45 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/intro.jpg",
                hotspots: [] // 拡大中はクリック判定なし
              }
            }
          ]
        },
        {
          id: "poster_abc",
          rect: { x: 0.65, y: 0.37, w: 0.08, h: 0.20 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/hint_poster1.jpg",
                hotspots: [] // 拡大中はクリック判定なし
              }
            },
            {  type: "message", text: `ポスターだ。今日はABCの研究紹介はやっていないようだ。`}
          ]
        },
        {
          id: "poster_leaf",
          rect: { x: 0.25, y: 0.40, w: 0.08, h: 0.20 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/hint_poster3.jpg",
                hotspots: [] // 拡大中はクリック判定なし
              }
            },
            {  type: "message", text: `ポスターだ。`}
          ]
        },
        {
          id: "mirror",
          rect: { x: 0.43, y: 0.44, w: 0.12, h: 0.20 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/mirror_zoom.jpg",
                hotspots: [] // 拡大中はクリック判定なし
              }
            },
            {  type: "message", text: `鏡だ。`}
          ]
        },
        {
          id: "earth",
          rect: { x: 0.747, y: 0.66, w: 0.027, h: 0.05 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/earth_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "earth_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリックするとxが機能しなくなる
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/earth_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『ロ』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            }
          ]
        },

        {
          id: "neptune",
          rect: { x: 0.467, y: 0.69, w: 0.031, h: 0.057 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/neptune_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "neptune_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/neptune_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『ジー』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            }
          ]
        },

        {
          id: "uranus",
          rect: { x: 0.213, y: 0.655, w: 0.032, h: 0.057 }, // ★要調整
          actions: [
            {
              type: "openModal",
              modal: {
                bg: "/images/room1/uranus_closed.jpg",
                hotspots: [    // 拡大中にクリックしてめくる
                  {
                    id: "uranus_flip",
                    rect: { x: 0.1, y: 0, w: 0.8, h: 1 }, // モーダル全面クリック注意
                    actions: [
                      {
                        type: "openModal",
                        replace: true,
                        modal: { bg: "/images/room1/uranus_open.jpg", hotspots: [] }
                      },
                      { type: "message", text: "めくった。『ロ』がある。" } // 好きな文に
                    ]
                  }
                ] 
              }
            }
          ]
        },

        ]
      },

      ceiling: {
        bg: "/images/room1/5_ceiling.jpg",
        nav: { down: "north" },
        hotspots: [
          // 天井は「上端クリック」を付けないなら down だけでOK（下端クリックで戻る）
        ...makeEdgeNavHotspots("room1", { down: "north" }),
          {
            id: "ceilingMsg",
            rect: { x: 0.45, y: 0.37, w: 0.10, h: 0.15 },
            actions: [{ type: "message", text: "電気だ。特に変わったものはない。" }]
          }
        ]
      },

      floor: {
        bg: "/images/room1/floor.jpg",
        nav: { up: "north" },
        hotspots: [
          ...makeEdgeNavHotspots("room1", { up: "north" }),
        ]
      },
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
