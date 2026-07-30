export function GridMap() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Grid Asset Map</h2>
      <p className="text-gray-500 mt-1">Spatial view of substations, transformers, and outage zones</p>
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        HANA Spatial-powered map with asset layers and outage overlays would render here.
        <br />
        <span className="text-xs text-gray-400 mt-2 block">
          Uses ST_GEOMETRY(4326) with GiST spatial indexes for sub-50ms neighbor queries.
        </span>
      </div>
    </div>
  )
}
