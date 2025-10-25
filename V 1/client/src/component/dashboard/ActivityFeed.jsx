export default function ActivityFeed({ notifications }) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {notifications.slice(0, 3).map(notif => (
            <div key={notif.id} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${notif.unread ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <p className="text-sm text-gray-600">{notif.message}</p>
              <span className="text-xs text-gray-400">{notif.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
