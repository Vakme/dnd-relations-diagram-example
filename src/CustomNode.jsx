import React, { memo, useMemo, useCallback, useState, useRef } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  getConnectedEdges,
} from "@xyflow/react";

const characterPortraitMap = {
    'Astarion': 'https://bg3.wiki/w/images/0/01/Astarion_Portrait.png',
    'Gale': 'https://bg3.wiki/w/images/3/3f/Gale_Portrait.png',
    'Halsin': 'https://bg3.wiki/w/images/8/8c/Halsin_Portrait.png',
    'Karlach': 'https://bg3.wiki/w/images/e/e9/Karlach_Portrait.png',
    "Lae'zel": "https://bg3.wiki/w/images/6/6f/Laezel_Portrait.png",
    "Minthara": "https://bg3.wiki/w/images/c/c7/Minthara_Portrait.png",
    "Shadowheart": "https://bg3.wiki/w/images/6/6a/Shadowheart_Portrait.png",
    "Wyll": "https://bg3.wiki/w/images/7/7a/Wyll_Portrait.png",
    "Default": 'https://bg3.wiki/w/images/2/21/Custom_Character_Portrait.png'
}

export default memo(({ data }) => {
  return (
    <div style={{ position: "relative", zIndex: 999 }}>
      <div
        style={{
          fontSize: 24,
          background: "rgba(238,238,238, 0.5)",
          color: "#0c0c14",
          borderRadius: 16,
          textAlign: "center",
          border: "1px solid #777",
          padding: 8,
        }}
      >
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <Handle
          type="source"
          position={Position.Right}
          style={{ opacity: 0 }}
        />
        <div>
          <img
            style={{ width: 100 }}
            src={characterPortraitMap[data.label] ?? characterPortraitMap.Default}
            alt={data.label}
          />
        </div>
        {data.label}
      </div>
    </div>
  );
});
