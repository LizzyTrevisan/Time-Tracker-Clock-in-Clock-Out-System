import { fmtTime, msToHMS, todayKey } from "./timeHelpers";

export function exportUserCsv(user, sessions, nowTick) {
  if (!user) return alert("Select a user first.");
  const rows = [
    ["User", "Start", "End", "Duration(hh:mm:ss)", "Note"],
    ...sessions.map((s) => [
      user,
      fmtTime(new Date(s.start)),
      s.end ? fmtTime(new Date(s.end)) : "",
      msToHMS((s.end ?? nowTick) - s.start),
      s.note || "",
    ]),
  ];
  const csv = rows.map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timesheet_${user}_${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
