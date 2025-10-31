import { fmtTime, msToHMS } from "../utils/timeHelpers";

export function SessionsTodayTable({ sessions, nowTick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr><Th>Start</Th><Th>End</Th><Th>Duration</Th><Th>Note</Th></tr>
        </thead>
        <tbody>
          {sessions.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-6 text-gray-500">No sessions today</td></tr>
          ) : sessions.map((s, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              <Td>{fmtTime(new Date(s.start))}</Td>
              <Td>{s.end ? fmtTime(new Date(s.end)) : <span className="text-green-700">(running)</span>}</Td>
              <Td>{msToHMS((s.end ?? nowTick) - s.start)}</Td>
              <Td className="max-w-[320px] truncate" title={s.note || ""}>{s.note || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AllSessionsTable({ sessions, nowTick }) {
  const rows = sessions.map((s, i) => ({ ...s, idx: i + 1 })).sort((a, b) => a.start - b.start);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr><Th>#</Th><Th>Date</Th><Th>Start</Th><Th>End</Th><Th>Duration</Th><Th>Note</Th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6 text-gray-500">Select a user to see history</td></tr>
          ) : rows.map((s) => {
            const startD = new Date(s.start); const endD = s.end ? new Date(s.end) : null;
            return (
              <tr key={s.idx} className="odd:bg-white even:bg-gray-50">
                <Td>{s.idx}</Td>
                <Td>{startD.toISOString().slice(0, 10)}</Td>
                <Td>{fmtTime(startD)}</Td>
                <Td>{endD ? fmtTime(endD) : <span className="text-green-700">(running)</span>}</Td>
                <Td>{msToHMS((s.end ?? nowTick) - s.start)}</Td>
                <Td className="max-w-[320px] truncate" title={s.note || ""}>{s.note || "—"}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Th({ children }) {
  return <th className="text-left px-4 py-2 font-medium text-gray-700 whitespace-nowrap">{children}</th>;
}
export function Td({ children, className = "" }) {
  return <td className={`px-4 py-2 text-gray-800 whitespace-nowrap ${className}`}>{children}</td>;
}
