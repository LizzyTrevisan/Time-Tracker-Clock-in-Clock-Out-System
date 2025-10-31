export default function UserSelect({ users, value, onChange, onClear, stateBadge }) {
  return (
    <section className="bg-white rounded-2xl shadow p-4 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">User:</label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border px-3 py-2"
            list="users-list"
            value={value}
            placeholder="Type a name or choose one"
            onChange={(e) => onChange(e.target.value)}
          />
          <datalist id="users-list">
            {users.map((u) => (<option key={u} value={u} />))}
          </datalist>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl px-3 py-2"
            onClick={onClear}
            disabled={!value}
          >
            Clear
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Status:</label>
        {stateBadge}
      </div>
    </section>
  );
}
