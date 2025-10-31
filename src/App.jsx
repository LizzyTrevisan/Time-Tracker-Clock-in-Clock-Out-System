import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "./components/Card";
import UserSelect from "./components/UserSelect";
import { SessionsTodayTable, AllSessionsTable } from "./components/Table";
import { fmtTime, msToHMS, todayKey } from "./utils/timeHelpers";
import { exportUserCsv } from "./utils/exportCsv";
import { loadData, saveData } from "./utils/storage";

export default function App() {
  const [user, setUser] = useState("");
  const [note, setNote] = useState("");
  const [data, setData] = useState(() => loadData());
  const [nowTick, setNowTick] = useState(Date.now());
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) saveData(data);
    else hasMounted.current = true;
  }, [data]);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const userData = data[user] || { sessions: [] };
  const openSession = userData.sessions.find((s) => !s.end);

  const start = () => {
    if (!user.trim()) return alert("Please select a user before starting a session.");
    if (openSession) return alert("Please clock out the current session before starting a new one.");
    const entry = { start: Date.now(), note: note.trim() || undefined };
    setData((prev) => ({
      ...prev,
      [user]: { sessions: [...(prev[user]?.sessions || []), entry] },
    }));
    setNote("");
  };

  const stop = () => {
    if (!openSession) return alert("No ongoing session to clock out from.");
    setData((prev) => ({
      ...prev,
      [user]: {
        sessions: prev[user].sessions.map((s) => (s.end ? s : { ...s, end: Date.now() })),
      },
    }));
  };

  const clearUser = () => {
    if (!user.trim()) return;
    if (!confirm(`Are you sure you want to clear all data for user "${user}"? This action cannot be undone.`)) return;
    setData((prev) => {
      const copy = { ...prev };
      delete copy[user];
      return copy;
    });
  };

  const allSessions = userData.sessions.map((s) => ({ ...s }));
  const sessionsToday = useMemo(() => {
    const key = todayKey();
    return allSessions.filter((s) => new Date(s.start).toISOString().slice(0, 10) === key);
  }, [allSessions, nowTick]);

  const sumDuration = (list) =>
    list.reduce((acc, session) => acc + ((session.end ?? nowTick) - session.start), 0);

  const totalToday = sumDuration(sessionsToday);
  const totalAll = sumDuration(allSessions);

  const users = Object.keys(data).sort((a, b) => a.localeCompare(b));

  const stateBadge = (
    <div
      className={`px-3 py-1 rounded-xl border inline-flex items-center gap-2 ${
        openSession ? "bg-green-50 border-green-300 text-green-800" : "bg-amber-50 border-amber-300"
      }`}
    >
      <span className="text-sm">{openSession ? "Clocked In" : "Clocked Out"}</span>
      {openSession && <span className="text-xs text-gray-500">since {fmtTime(new Date(openSession.start))}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">⏱️ Clock In/Out – Time Tracker</h1>
          <button
            className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => {
              if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) setData({});
            }}
          >
            Clear All Data
          </button>
        </header>

        <UserSelect users={users} value={user} onChange={setUser} onClear={clearUser} stateBadge={stateBadge} />

        <section className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Session Note (optional):</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter a note for this session"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={start}
              className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={!user || !!openSession}
            >
              Clock In
            </button>
            <button
              onClick={stop}
              className="flex-1 px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              disabled={!openSession}
            >
              Clock Out
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <Card title="Total Today" value={msToHMS(totalToday)} sub={todayKey()} />
          <Card title="Total All Time" value={msToHMS(totalAll)} />
          <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Export CSV</h3>
              <p className="text-sm text-gray-500">Export all sessions for the selected user as a CSV file.</p>
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={() => exportUserCsv(user, allSessions, nowTick)}
              disabled={!user}
            >
              Export
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-medium">Sessions Today</h3>
          </div>
          <SessionsTodayTable sessions={sessionsToday} nowTick={nowTick} />
        </section>

        <section className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-medium">All Sessions</h3>
          </div>
          <AllSessionsTable sessions={allSessions} nowTick={nowTick} />
        </section>

        <footer className="text-xs text-center text-gray-500 pb-2">
          Data lives only in your browser (localStorage). Perfect for small teams. ✨
        </footer>
      </div>
    </div>
  );
}
