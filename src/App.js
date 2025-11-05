import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Panel,
  useViewport,
  useReactFlow,
  MarkerType,
  getConnectedEdges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { colorMap } from "./utils";
import { useData } from "./use-data";
import CustomNode from "./CustomNode";
import FloatingEdge from "./FloatingEdge";
import { Relations } from "./Relations";

const relationsWidth = 400;
const margin = 16;

const initBgColor = "#1A192B";

const connectionLineStyle = { stroke: "#fff" };
const snapGrid = [20, 20];
const nodeTypes = {
  customNode: CustomNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const edgeTypes = {
  floating: FloatingEdge,
};

const CustomNodeFlow = () => {
  const { getNodes, getEdges, screenToFlowPosition, getNodesBounds, fitView } =
    useReactFlow();
  const ref = useRef(null);

  const [tooltipPos, setTooltipPos] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodesUpdated, setNodesUpdated] = useState(false);
  const { data } = useData();

  useEffect(() => {
    if (data !== null) {
      const characters = new Set([
        ...data.map((o) => o.character1),
        ...data.map((o) => o.character2),
      ]);
      characters.delete("-");
      const nodes = Array.from(characters).map((c, i) => ({
        id: c,
        position: { x: i * 50, y: i * 50 },
        data: { label: c },
        type: "customNode",
      }));
      setNodes(nodes);

      const edges = data
        .filter((o) => o.relation !== "")
        .map((o) => ({
          id: `${o.character1}-${o.character2}`,
          source: o.character1,
          target: o.character2,
          type: "floating",
          data: { relation: o.relation, label: o.relationLabel, note: o.note },
          markerEnd: {
            type: MarkerType.Arrow,
            color: colorMap[o.relation],
            width: 15,
            height: 15,
          },
          style: {
            strokeWidth: 1.5,
            stroke: colorMap[o.relation],
          },
        }));
      const siblingArr = [];
      const siblingEdges = edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          hasSibling: !!edges.find((oe) => {
            const s =
              e.source === oe.target &&
              e.target === oe.source &&
              !siblingArr.includes(oe.id);
            if (s) {
              siblingArr.push(e.id);
            }
            return s;
          }),
        },
      }));

      setEdges(siblingEdges);

      setNodesUpdated(true);
    }
  }, [data]);

  useEffect(() => {
    if (nodesUpdated) {
      const angleStep = (2 * Math.PI) / nodes.length;
      const radius = 500;
      const centerX = 500;
      const centerY = 500;

      const updatedNodes = nodes.map((node, index) => {
        const angle = index * angleStep;
        return {
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
          positionAbsolute: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
        };
      });

      setNodes(updatedNodes);
      setNodesUpdated(false);
    }
    fitView();
  }, [nodesUpdated, setNodes, nodes, fitView]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: { type: MarkerType.Arrow },
          },
          eds
        )
      ),
    [setEdges]
  );

  const colorLegend = useMemo(() => {
    if (!data) {
      return null;
    }
    const colorSet = [
      ...new Set(
        data
          .map((d) => ({
            index: d.relation,
            relation: d.relationLabel,
          }))
          .map(JSON.stringify)
      ),
    ]
      .map(JSON.parse)
      .filter((o) => o.index !== "")
      .sort((a, b) => parseInt(a.index) - parseInt(b.index));
    return colorSet;
  }, [data]);

  const relations = useMemo(() => {
    return getConnectedEdges([{ id: tooltipPos?.id }], getEdges());
  }, [tooltipPos?.id, getNodes, getEdges, getConnectedEdges]);

  const calculateTooltipLeft = useCallback(() => {
    const basicPosition = tooltipPos.x;
    if (tooltipPos.x > getNodesBounds(getNodes()).width / 2) {
      return basicPosition - margin - relationsWidth;
    }
    return basicPosition + margin;
  }, [tooltipPos?.x]);

  const calculateTooltipTop = useCallback(() => {
    const basicPosition = tooltipPos.y;
    if (tooltipPos.y > getNodesBounds(getNodes()).height / 2) {
      return basicPosition - margin - ref.current?.clientHeight;
    }
    return basicPosition + margin;
  }, [tooltipPos?.y]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        style={{ background: initBgColor }}
        nodeTypes={nodeTypes}
        connectionLineStyle={connectionLineStyle}
        snapToGrid={true}
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
        fitView
        attributionPosition="bottom-left"
        edgeTypes={edgeTypes}
        onNodeMouseMove={(e, node) => {
          setTooltipPos({
            ...{ x: e.clientX, y: e.clientY },
            id: node.id,
          });
        }}
        onNodeMouseLeave={() => {
          setTooltipPos(null);
        }}
      >
        <Panel position="top-left">
          {colorLegend?.map((c) => (
            <div
              key={c.index}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: colorMap[c.index],
                }}
              ></div>
              <div style={{ color: "white" }}>{c.relation}</div>
            </div>
          ))}
        </Panel>
        <Controls />
      </ReactFlow>

      {tooltipPos && (
        <div
          ref={ref}
          style={{
            backgroundColor: "#0c0c14",
            color: "white",
            border: "1px solid white",
            borderRadius: 16,
            width: relationsWidth,
            padding: 12,
            position: "fixed",
            top: calculateTooltipTop(),
            left: calculateTooltipLeft(),
            zIndex: 999,
            display: 'flex',
            gap: 8
          }}
        >
          <Relations
            title={`What ${tooltipPos?.id} thinks of others?`}
            getLabel={(e) => e.target}
            relations={relations.filter((e) => e.source === tooltipPos?.id)}
          />
          <Relations
            title={`What others think of ${tooltipPos?.id}?`}
            getLabel={(e) => e.source}
            relations={relations.filter((e) => e.target === tooltipPos?.id)}
          />
        </div>
      )}
    </>
  );
};

export default CustomNodeFlow;
