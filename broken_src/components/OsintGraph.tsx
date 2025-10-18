import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import type { ReactFlowInstance } from 'reactflow'

import 'reactflow/dist/style.css'
import dagre from 'dagre'
import snapshot from '../data/osint-snapshot.json'

type RawNode = { name: string; type?: string; url?: string; children?: RawNode[] }
type Tree = RawNode
type Pos = { x: number; y: number }

type NodeData = { label: string; url?: string; depth: number; hasChildren: boolean }

// Layout + style constants shared with NodeBurst / BridgeMorph
const NODE_WIDTH_BASE = 200
const NODE_HEIGHT = 36
const RANKSEP = 48       // horizontal spacing between columns (LR)
const LEFT_MARGIN = 96   // left margin for the root column anchor


/** Make 33 first-level children fit vertically in the current viewport. */
function computeNodesep(firstLevelCount: number) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  // tighter stack so all 33 fit more comfortably without manual zoom
  // here -> CHANGE THIS TO CHANGE FONT SIZING INSIDE THE GRAPH AND ALSO THE VERTICAL NODE SPACES
  const topBottomPad = 80
  const available = Math.max(220, vh - topBottomPad)
  return Math.max(10, Math.min(20, available / Math.max(1, firstLevelCount - 1)))
}

/** Normalize raw OSINT data to a tree and ensure we have exactly `limitKids` children on the root. */
function toTree(raw: any, rootLabel: string, limitKids: number): Tree {
  let children: RawNode[] = []
  if (Array.isArray(raw)) {
    children = raw
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.children)) children = raw.children
    else if (Array.isArray((raw as any).nodes)) children = (raw as any).nodes
    else if (raw.name && Array.isArray((raw as any).children)) children = (raw as any).children
    else {
      children = Object.keys(raw).map((k) => {
        const v: any = (raw as any)[k]
        return { name: k, children: Array.isArray(v?.children) ? v.children : [] }
      })
    }
  }

  let first = (children || []).slice(0, limitKids)
  if (first.length < limitKids) {
    const missing = limitKids - first.length
    for (let i = 0; i < missing; i++) first.push({ name: `Channel ${i + 1}`, children: [] })
  }
  return { name: rootLabel || 'PIE.ai', children: first }
}

/** Approximate a single-line width for a node label at our font size. */
function measureNodeWidth(label: string, isRoot: boolean) {
  // With the larger text size, assume a slightly higher px/char for children.
  const pxPerChar = isRoot ? 8.8 : 9.8
  const base = (label?.length || 0) * pxPerChar + 24 /* padding headroom */
  const min = NODE_WIDTH_BASE
  const max = 420 // prevent overly wide nodes
  return Math.max(min, Math.min(max, Math.round(base)))
}

/** Build VISIBLE subgraph only (root + 33 kids + expanded branches). */
function buildVisibleGraph(
  tree: Tree,
  expanded: Set<string>,
  limitKids: number,
  nodesep: number
) {
  const nodes: any[] = []
  const edges: any[] = []
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep, ranksep: RANKSEP, marginx: 16, marginy: 16 })
  g.setDefaultEdgeLabel(() => ({}))

  const firstLevelCount = Math.min(limitKids, tree.children?.length || 0)
  const rootId = '0'

  function walk(n: RawNode, path: string, parentId: string | null, depth: number) {
    const id = path
    const hasChildren = !!(n.children && n.children.length)
    const isRoot = depth === 0
    const width = measureNodeWidth(n.name, isRoot)

    nodes.push({
      id,
      data: { label: n.name, url: n.url, depth, hasChildren } as NodeData,
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      width,
      height: NODE_HEIGHT,
      draggable: false,
      style: {
        width, /* let the box expand to single line where possible */
      }
    })

    if (parentId) edges.push({ id: parentId + '-' + id, source: parentId, target: id, type: 'bezier' })

    if (depth === 0) {
      ;(n.children || []).slice(0, firstLevelCount).forEach((ch, i) => walk(ch, `${path}.${i}`, id, depth + 1))
    } else if (expanded.has(id)) {
      ;(n.children || []).forEach((ch, i) => walk(ch, `${path}.${i}`, id, depth + 1))
    }
  }

  walk(tree, rootId, null, 0)

  // Dagre layout
  nodes.forEach((n: any) => g.setNode(n.id, { width: n.width, height: NODE_HEIGHT }))
  edges.forEach((e: any) => g.setEdge(e.source, e.target))
  dagre.layout(g)
  nodes.forEach((n: any) => {
    const pos = g.node(n.id)
    n.position = { x: pos.x, y: pos.y }
  })

  // Anchor the entire graph so the root's *center* sits at LEFT_MARGIN + rootWidth/2
  const rootNode = nodes.find((n) => n.id === rootId)
  if (rootNode) {
    const rootAnchorCenter = LEFT_MARGIN + rootNode.width / 2
    const dx = rootAnchorCenter - rootNode.position.x
    nodes.forEach((n: any) => { n.position = { x: n.position.x + dx, y: n.position.y } })
  }



  const childCount = new Map<string, number>()
  nodes.forEach((n) => childCount.set(n.id, 0))
  edges.forEach((e) => childCount.set(e.source, (childCount.get(e.source) || 0) + 1))

  const directKids = nodes
    .filter((n) => n.id.startsWith('0.') && n.id.split('.').length === 2)
    .map((n) => n.id)

  return { nodes, edges, rootId, directKids, childCount, firstLevelCount }
}

function styleForNode({
  isRoot,
  isLeaf,
  isActive,
}: {
  isRoot: boolean
  isLeaf: boolean
  isActive: boolean
}) {
  const base: any = {
    borderRadius: 12,
    padding: '5px 8px',        /* slightly tighter to allow bigger font */
    fontWeight: 600,
    fontSize: isRoot ? 17 : 18, /* larger font on children */
    whiteSpace: 'nowrap',       /* single line only */
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    color: 'white',
    border: '1px solid rgba(255,255,255,0.16)',
    transition: 'transform .22s ease, box-shadow .22s ease, background .22s ease',
  }

  if (isRoot) {
    base.background = 'linear-gradient(180deg, rgba(122,162,255,0.35), rgba(180,139,255,0.28))'
    base.boxShadow = '0 12px 28px rgba(0,0,0,0.45), 0 0 0 4px rgba(122,162,255,0.15)'
  } else if (isLeaf) {
    base.background = 'linear-gradient(180deg, rgba(98,245,192,0.28), rgba(40,214,160,0.18))'
    base.border = '1px solid rgba(98,245,192,0.48)'
    base.boxShadow = '0 10px 24px rgba(0,0,0,0.35)'
  } else {
    base.background = 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
    base.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.04)'
  }

  if (isActive) {
    // base.transform = 'scale(1.05)'
    base.boxShadow = '0 16px 36px rgba(0,0,0,0.5), 0 0 0 6px rgba(122,162,255,0.22)'
  }

  return base
}

async function tryFetchArf() {
  try {
    const r = await fetch('/arf.json', { cache: 'no-cache' })
    if (r.ok) return await r.json()
  } catch {}
  try {
    const r = await fetch('/api/arf', { cache: 'no-cache' })
    if (r.ok) return await r.json()
  } catch {}
  return null
}

/** Reapply the original first-level order to the y-positions after Dagre layout. */
function preserveDirectOrder(nodes: any[], rootId: string, directOrder: string[]) {
  const idToNode = new Map(nodes.map((n) => [n.id, n]))
  const directIdsNow = nodes.filter((n) => n.id.startsWith(`${rootId}.`) && n.id.split('.').length === 2).map((n) => n.id)
  const directNodesNow = directIdsNow.map((id) => idToNode.get(id)).filter(Boolean)
  if (directNodesNow.length === 0) return nodes

  const ySlots = directNodesNow.map((n: any) => n.position.y).sort((a: number, b: number) => a - b)
  const ordered = directOrder.filter((id) => idToNode.has(id))

  const count = Math.min(ySlots.length, ordered.length)
  for (let i = 0; i < count; i++) {
    const id = ordered[i]
    const n = idToNode.get(id)
    if (n) n.position = { ...n.position, y: ySlots[i] }
  }
  return nodes
}

export type OsintGraphHandle = { collapseAll: () => void }
type OsintGraphProps = { rootLabel: string; limitKids?: number; seedPositions?: Pos[] };
const OsintGraph = forwardRef<OsintGraphHandle, OsintGraphProps>(
  ({ rootLabel, limitKids = 33, seedPositions }, ref) => {

  const rfRef = useRef<ReactFlowInstance | null>(null)
  const [tree, setTree] = useState<Tree>(() => toTree(snapshot, rootLabel, limitKids))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const hasAnimatedIn = useRef(false)

  // Keep the original first-level order to prevent Dagre reordering on expand.
  const directOrderRef = useRef<string[] | null>(null)

  // Quiet data refresh (doesn't restart the seed morph)
  useEffect(() => {
    let alive = true
    tryFetchArf().then((raw) => {
      if (!alive || !raw) return
      setTree(toTree(raw, rootLabel, limitKids))
    })
    return () => { alive = false }
  }, [rootLabel, limitKids])

  const visible = useMemo(() => {
    const firstCount = Math.min(limitKids, tree.children?.length || 0)
    const nodesep = computeNodesep(firstCount)
    const built = buildVisibleGraph(tree, expanded, limitKids, nodesep)

    // Initialize preserved order once (on first build)
    if (!directOrderRef.current) {
      directOrderRef.current = built.directKids.slice()
    }

    // Reapply the preserved order to the built nodes
    const orderedNodes = preserveDirectOrder(
      built.nodes.map((n) => ({ ...n, position: { ...n.position } })), // clone to avoid accidental mutation
      built.rootId,
      directOrderRef.current || []
    )

    return { ...built, nodes: orderedNodes }
  }, [tree, expanded, limitKids])

  // Initial morph: seed positions (left column) → Dagre layout
  useEffect(() => {
    if (hasAnimatedIn.current) return
    const { nodes: visNodes, edges: visEdges, rootId, directKids } = visible

    // Center-relative seeds → absolute positions
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const toAbs = (p: Pos) => ({ x: p.x + vw / 2, y: p.y + vh / 2 })

    const seeds =
      seedPositions && seedPositions.length >= directKids.length
        ? seedPositions.slice(0, directKids.length).map(toAbs)
        : directKids.map((_, i) => {
            const spacing = computeNodesep(directKids.length)
            const columnH = spacing * (directKids.length - 1)
            const startY = vh / 2 - columnH / 2
            return { x: 40, y: startY + i * spacing }
          })

    // Root starts anchored at the first column
    const avgY = seeds.reduce((a, p) => a + p.y, 0) / seeds.length
    const rootStart = { x: LEFT_MARGIN + (NODE_WIDTH_BASE / 2), y: avgY }

    const initialVisible = new Set([rootId, ...directKids])

    const seededNodes = visNodes
      .filter((n: any) => initialVisible.has(n.id))
      .map((n: any) => {
        const kidIndex = directKids.indexOf(n.id)
        const pos = n.id === rootId ? rootStart : seeds[kidIndex]
        const isLeaf = !(n.data as NodeData).hasChildren
        return {
          ...n,
          position: pos,
          style: styleForNode({ isRoot: n.id === rootId, isLeaf, isActive: false }),
          // Corner gradient highlight: root always highlighted
          className: (n.id === rootId ? 'corner-glow' : undefined),
        }
      })

    const seededEdges = visEdges
      .filter((e: any) => initialVisible.has(e.source) && initialVisible.has(e.target))
      .map((e: any) => ({ ...e, animated: true, style: { strokeWidth: 1.6 } }))

    setNodes(seededNodes as any)
    setEdges(seededEdges as any)

    requestAnimationFrame(() => {
      // Move to Dagre positions; styles remain
      const targetNodes = visNodes
        .filter((n: any) => initialVisible.has(n.id))
        .map((n: any) => {
          const isLeaf = !(n.data as NodeData).hasChildren
          return {
            ...n,
            style: styleForNode({ isRoot: n.id === rootId, isLeaf, isActive: false }),
            // Keep root corner highlight after morph
            className: (n.id === rootId ? 'corner-glow' : undefined),

}
        })
      const targetEdges = visEdges
        .filter((e: any) => initialVisible.has(e.source) && initialVisible.has(e.target))
        .map((e: any) => ({ ...e, animated: false, style: { strokeWidth: 1.2 } }))

      setNodes(targetNodes as any)
      setEdges(targetEdges as any)
      hasAnimatedIn.current = true
      // One-time zoom-out after morph, then pan left so the graph stays where the animation ended
      requestAnimationFrame(() => {
        if (rfRef.current) fitViewLeftAligned(rfRef.current, 0.08, 56)
      })

    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once


  // Helper: zoom out to show everything, then pan so the graph is left-aligned on screen
  function fitViewLeftAligned(instance: ReactFlowInstance, padding = 0.08, marginPx = 16) {
    // First fitView to compute a good zoom
    instance.fitView({ padding, includeHiddenNodes: false })
    // Next frame, pan so the left-most node touches our left margin
    requestAnimationFrame(() => {
      try {
        const vp = instance.getViewport()  // { x, y, zoom }
        const zoom = vp.zoom || 1
        const allNodes = instance.getNodes()
        if (!allNodes || allNodes.length === 0) return
        const minX = Math.min(...allNodes.map(n => (n.positionAbsolute?.x ?? n.position.x)))
        const minY = Math.min(...allNodes.map(n => (n.positionAbsolute?.y ?? n.position.y)))
        // Align left/top edges to small margins
        const targetX = marginPx - minX * zoom
        const targetY = 24 - minY * zoom
        instance.setViewport({ x: targetX, y: targetY, zoom })
      } catch {}
    })
  }


  // Subsequent updates (expands/refresh): layout only visible nodes; preserve order.
  useEffect(() => {
    if (!hasAnimatedIn.current) return
    const { nodes: visNodes, edges: visEdges, rootId } = visible

    const styledNodes = visNodes.map((n: any) => {
      const isLeaf = !(n.data as NodeData).hasChildren
      return {
        ...n,
        style: styleForNode({ isRoot: n.id === rootId, isLeaf, isActive: activeId === n.id }),
        // Corner gradient highlight: root always; selected node when active
        className: (n.id === rootId || activeId === n.id) ? 'corner-glow' : undefined,
      }
    })


    const styledEdges = visEdges.map((e: any) => ({
      ...e,
      animated: activeId ? e.source === activeId : false,
      style: { strokeWidth: activeId && e.source === activeId ? 1.8 : 1.2 },
    }))

    setNodes(styledNodes as any)
    setEdges(styledEdges as any)
  }, [visible, activeId, setNodes, setEdges])

  function onNodeClick(_: any, node: any) {
    setActiveId(node.id)
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(node.id)) next.delete(node.id)
      else next.add(node.id)
      return next
    })
  }

  // Expose: collapse all expanded nodes and re-fit the view (used by HUD "Close all")
  function collapseAll() {
    setExpanded(new Set())
    setActiveId(null)
    // Re-fit after state applies
    requestAnimationFrame(() => {
      try {
        if (rfRef.current) {
          const inst = rfRef.current
          inst.fitView({ padding: 0.08, includeHiddenNodes: false })
          // Optional: nudge right to align with your animation finish
          requestAnimationFrame(() => {
            try {
              const { zoom = 1 } = inst.getViewport()
              const nodes = inst.getNodes()
              if (!nodes || !nodes.length) return
              const minX = Math.min(...nodes.map(n => (n.positionAbsolute?.x ?? n.position.x)))
              const minY = Math.min(...nodes.map(n => (n.positionAbsolute?.y ?? n.position.y)))
              inst.setViewport({ x: 56 - minX * zoom, y: 24 - minY * zoom, zoom })
            } catch {}
          })
        }
      } catch {}
    })
  }
  useImperativeHandle(ref, () => ({ collapseAll }))



  // Top-right action: collapse all expanded nodes and re-fit
  function handleCollapseAll() {
    setExpanded(new Set())
    setActiveId(null)
    // re-fit and re-align after collapsing
    requestAnimationFrame(() => {
      try {
        if (rfRef?.current && typeof fitViewLeftAligned === 'function') {
          fitViewLeftAligned(rfRef.current, 0.08, 56)
        } else {
          rfRef?.current?.fitView({ padding: 0.08, includeHiddenNodes: false })
        }
      } catch {}
    })
  }


  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      
      <ReactFlow
        onInit={(inst) => { rfRef.current = inst }}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.25}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  )
});
export default OsintGraph
